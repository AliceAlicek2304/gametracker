package com.alice.gametracker.controller;

import java.util.HashMap;
import java.util.Map;

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
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/gacha")
public class GachaController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

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

            // Build request body
            Map<String, Object> body = new HashMap<>();
            body.put("playerId", params.get("player_id"));
            body.put("cardPoolId", params.get("gacha_id"));
            body.put("cardPoolType", Integer.parseInt(params.get("gacha_type")));
            body.put("languageCode", params.get("lang"));
            body.put("recordId", params.get("record_id"));
            body.put("serverId", params.get("svr_id"));

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

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            // Call API
            String apiUrl = "https://gmserver-api.aki-game2.net/gacha/record/query";
            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, String.class);

            // Parse JSON response to Object for better frontend handling
            Object jsonData = objectMapper.readTree(response.getBody());
            return ResponseEntity.ok(ApiResponse.success("Gacha history fetched", jsonData));

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
