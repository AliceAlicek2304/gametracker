package com.alice.gametracker.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.alice.gametracker.dto.ApiResponse;
import com.alice.gametracker.service.CharacterService;
import com.alice.gametracker.service.WeaponService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@RestController
@RequestMapping("/api/gacha")
public class GachaController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private WeaponService weaponService;

    @Autowired
    private CharacterService characterService;

    @PostMapping("/fetch")
    public ResponseEntity<?> fetchGachaHistory(@RequestBody Map<String, String> request) {
        String url = request.get("url");
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("URL is required"));
        }

        try {
            // Parse query params from URL
            String queryString = url.split("\\?")[1].split("#")[0];
            Map<String, String> params = parseQueryString(queryString);

            // Set headers (from successful Postman test)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36");
            headers.set("Referer", "https://aki-gm-resources-oversea.aki-game.net/");
            headers.set("Origin", "https://aki-gm-resources-oversea.aki-game.net");
            headers.set("Accept", "application/json, text/plain, */*");
            headers.set("Accept-Language", "en");
            headers.set("sec-ch-ua", "\"Chromium\";v=\"140\", \"Not=A?Brand\";v=\"24\", \"Google Chrome\";v=\"140\"");
            headers.set("sec-ch-ua-mobile", "?0");
            headers.set("sec-ch-ua-platform", "\"Windows\"");
            headers.set("sec-fetch-dest", "empty");
            headers.set("sec-fetch-mode", "cors");
            headers.set("sec-fetch-site", "cross-site");

            String apiUrl = "https://gmserver-api.aki-game2.net/gacha/record/query";
            
            // Build image cache: load all weapons and characters once (OPTIMIZATION 1)
            Map<String, String> imageCache = new ConcurrentHashMap<>();
            weaponService.findAllResponses().forEach(w -> {
                if (w.getName() != null && w.getImageUrl() != null) {
                    // Trim and lowercase for consistent matching
                    imageCache.put(w.getName().trim().toLowerCase(), w.getImageUrl());
                }
            });
            characterService.findAllCharacters().forEach(c -> {
                if (c.getName() != null && c.getImageUrl() != null) {
                    // Trim and lowercase for consistent matching
                    imageCache.put(c.getName().trim().toLowerCase(), c.getImageUrl());
                }
            });
            
            // Collect gacha items grouped by cardPoolType (thread-safe)
            Map<String, ArrayNode> bannerDataMap = new ConcurrentHashMap<>();
            
            // OPTIMIZATION 2: Parallel API calls using CompletableFuture
            java.util.List<CompletableFuture<Void>> futures = new java.util.ArrayList<>();
            
            // Loop through cardPoolType 1-9
            for (int cardPoolType = 1; cardPoolType <= 9; cardPoolType++) {
                final int poolType = cardPoolType; // For lambda
                
                CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                    try {
                        // Build request body for each cardPoolType
                        Map<String, Object> body = new HashMap<>();
                        body.put("playerId", params.get("player_id"));
                        body.put("cardPoolId", params.get("gacha_id"));
                        body.put("cardPoolType", poolType);
                        body.put("languageCode", params.get("lang"));
                        body.put("recordId", params.get("record_id"));
                        body.put("serverId", params.get("svr_id"));

                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

                        // Call API for this cardPoolType
                        ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);
                        JsonNode jsonData = objectMapper.readTree(response.getBody());
                        
                        // Get the data array from response
                        if (jsonData.has("data") && jsonData.get("data").isArray()) {
                            ArrayNode dataArray = (ArrayNode) jsonData.get("data");
                            
                            // Step 1: Calculate pity counters on FULL data (including 3-star items)
                            // Loop BACKWARDS (oldest to newest) to calculate pity correctly
                            int[] pityCounters = new int[dataArray.size()];
                            int fiveStarPity = 0;
                            int fourStarPity = 0;
                            
                            // Iterate from end to start (oldest to newest)
                            for (int i = dataArray.size() - 1; i >= 0; i--) {
                                ObjectNode item = (ObjectNode) dataArray.get(i);
                                int qualityLevel = item.has("qualityLevel") ? item.get("qualityLevel").asInt() : 0;
                                
                                // Increment pity counters for every item (including 3-star)
                                fiveStarPity++;
                                fourStarPity++;
                                
                                // Save pity count for this item
                                if (qualityLevel == 5) {
                                    pityCounters[i] = fiveStarPity;
                                    fiveStarPity = 0; // Reset 5-star pity
                                } else if (qualityLevel == 4) {
                                    pityCounters[i] = fourStarPity;
                                    fourStarPity = 0; // Reset 4-star pity
                                } else {
                                    pityCounters[i] = 0; // 3-star items don't have pity displayed
                                }
                            }
                            
                            // Step 2: Build enriched items array (only 4-star and 5-star)
                            ArrayNode enrichedItems = objectMapper.createArrayNode();
                            
                            // Now loop forward (newest to oldest) to build final result
                            for (int i = 0; i < dataArray.size(); i++) {
                                ObjectNode item = (ObjectNode) dataArray.get(i);
                                int qualityLevel = item.has("qualityLevel") ? item.get("qualityLevel").asInt() : 0;
                                
                                // FILTER: Only include 4-star and 5-star items in final result
                                if (qualityLevel == 4 || qualityLevel == 5) {
                                    String name = item.has("name") ? item.get("name").asText() : null;
                                    
                                    // Add pityCount to item (already calculated in previous loop)
                                    item.put("pityCount", pityCounters[i]);
                                    
                                    if (name != null) {
                                        // Lookup imageUrl from cache (O(1) instead of O(n) stream filter)
                                        // Trim and lowercase for consistent matching
                                        String imageUrl = imageCache.get(name.trim().toLowerCase());
                                        item.put("imageUrl", imageUrl);
                                    }
                                    
                                    enrichedItems.add(item);
                                }
                            }
                            
                            // Store items for this cardPoolType (thread-safe)
                            bannerDataMap.put(String.valueOf(poolType), enrichedItems);
                        }
                    } catch (Exception e) {
                        // If a specific cardPoolType fails, continue with others
                        System.err.println("Failed to fetch cardPoolType " + poolType + ": " + e.getMessage());
                    }
                });
                
                futures.add(future);
            }
            
            // Wait for all API calls to complete
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
            
            // Build response with grouped data
            ObjectNode bannerData = objectMapper.createObjectNode();
            bannerDataMap.forEach((key, value) -> bannerData.set(key, value));
            
            ObjectNode responseData = objectMapper.createObjectNode();
            responseData.put("code", 0);
            responseData.put("message", "success");
            responseData.set("data", bannerData);
            
            return ResponseEntity.ok(ApiResponse.success("Gacha history fetched from all banners", responseData));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch gacha history: " + e.getMessage()));
        }
    }

    @PostMapping("/paste")
    public ResponseEntity<?> pasteGachaHistory(@RequestBody Map<String, String> request) {
        String json = request.get("json");
        if (json == null || json.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("JSON is required"));
        }

        // Validate JSON
        try {
            // Parse JSON to validate and return as object
            Object jsonData = objectMapper.readTree(json);
            return ResponseEntity.ok(ApiResponse.success("Gacha history received", jsonData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid JSON"));
        }
    }

    private Map<String, String> parseQueryString(String query) {
        Map<String, String> params = new HashMap<>();
        if (query != null && !query.isEmpty()) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2) {
                    params.put(keyValue[0], keyValue[1]);
                }
            }
        }
        return params;
    }
}
