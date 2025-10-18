package com.alice.gametracker.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.alice.gametracker.dto.BannerResponse;
import com.alice.gametracker.dto.CreateBannerRequest;
import com.alice.gametracker.dto.FeaturedFiveStarIdsResponse;
import com.alice.gametracker.dto.GachaItemResponse;
import com.alice.gametracker.dto.GachaRequest;
import com.alice.gametracker.dto.GachaResultResponse;
import com.alice.gametracker.model.Banner;
import com.alice.gametracker.model.BannerType;
import com.alice.gametracker.model.Character;
import com.alice.gametracker.model.Weapon;
import com.alice.gametracker.repository.BannerRepository;
import com.alice.gametracker.repository.CharacterRepository;
import com.alice.gametracker.repository.WeaponRepository;

@Service
public class BannerService {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private WeaponRepository weaponRepository;

    // Get all active banners
    public List<BannerResponse> getAllActiveBanners() {
        List<Banner> banners = bannerRepository.findByIsActiveTrueOrderByStartDateDesc();
        return banners.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get currently running banners
    public List<BannerResponse> getCurrentBanners() {
        List<Banner> banners = bannerRepository.findCurrentlyActiveBanners(LocalDateTime.now());
        return banners.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get upcoming banners
    public List<BannerResponse> getUpcomingBanners() {
        List<Banner> banners = bannerRepository.findUpcomingBanners(LocalDateTime.now());
        return banners.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get past banners (history)
    public List<BannerResponse> getPastBanners() {
        List<Banner> banners = bannerRepository.findPastBanners(LocalDateTime.now());
        return banners.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get banner by ID
    public BannerResponse getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
        banner.updateStatus();
        return convertToResponse(banner);
    }

    // Create new banner
    @Transactional
    public BannerResponse createBanner(CreateBannerRequest request) {
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        Banner banner = new Banner();
        banner.setName(request.getName());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());
        banner.setBannerType(BannerType.valueOf(request.getBannerType()));

        // Set isActive from request (default true if not provided)
        if (request.getIsActive() != null) {
            banner.setActive(request.getIsActive());
        }

        // Handle CHARACTER banner
        if ("CHARACTER".equals(request.getBannerType())) {
            if (request.getFeatured5StarCharacterId() == null || 
                request.getFeatured4StarCharacter1Id() == null ||
                request.getFeatured4StarCharacter2Id() == null ||
                request.getFeatured4StarCharacter3Id() == null) {
                throw new RuntimeException("All character IDs are required for CHARACTER banner");
            }

            Character featured5Star = characterRepository.findById(request.getFeatured5StarCharacterId())
                    .orElseThrow(() -> new RuntimeException("5-star character not found"));
            Character featured4Star1 = characterRepository.findById(request.getFeatured4StarCharacter1Id())
                    .orElseThrow(() -> new RuntimeException("4-star character 1 not found"));
            Character featured4Star2 = characterRepository.findById(request.getFeatured4StarCharacter2Id())
                    .orElseThrow(() -> new RuntimeException("4-star character 2 not found"));
            Character featured4Star3 = characterRepository.findById(request.getFeatured4StarCharacter3Id())
                    .orElseThrow(() -> new RuntimeException("4-star character 3 not found"));

            // Validate rarity
            if (featured5Star.getRarity() != 5) {
                throw new RuntimeException("Featured 5-star character must have 5-star rarity");
            }
            if (featured4Star1.getRarity() != 4 || featured4Star2.getRarity() != 4 || featured4Star3.getRarity() != 4) {
                throw new RuntimeException("Featured 4-star characters must have 4-star rarity");
            }

            banner.setFeatured5StarCharacter(featured5Star);
            banner.setFeatured4StarCharacter1(featured4Star1);
            banner.setFeatured4StarCharacter2(featured4Star2);
            banner.setFeatured4StarCharacter3(featured4Star3);
        }
        // Handle WEAPON banner
        else if ("WEAPON".equals(request.getBannerType())) {
            if (request.getFeatured5StarWeaponId() == null || 
                request.getFeatured4StarWeapon1Id() == null ||
                request.getFeatured4StarWeapon2Id() == null ||
                request.getFeatured4StarWeapon3Id() == null) {
                throw new RuntimeException("All weapon IDs are required for WEAPON banner");
            }

            Weapon featured5Star = weaponRepository.findById(request.getFeatured5StarWeaponId())
                    .orElseThrow(() -> new RuntimeException("5-star weapon not found"));
            Weapon featured4Star1 = weaponRepository.findById(request.getFeatured4StarWeapon1Id())
                    .orElseThrow(() -> new RuntimeException("4-star weapon 1 not found"));
            Weapon featured4Star2 = weaponRepository.findById(request.getFeatured4StarWeapon2Id())
                    .orElseThrow(() -> new RuntimeException("4-star weapon 2 not found"));
            Weapon featured4Star3 = weaponRepository.findById(request.getFeatured4StarWeapon3Id())
                    .orElseThrow(() -> new RuntimeException("4-star weapon 3 not found"));

            // Validate rarity
            if (featured5Star.getRarity() != 5) {
                throw new RuntimeException("Featured 5-star weapon must have 5-star rarity");
            }
            if (featured4Star1.getRarity() != 4 || featured4Star2.getRarity() != 4 || featured4Star3.getRarity() != 4) {
                throw new RuntimeException("Featured 4-star weapons must have 4-star rarity");
            }

            banner.setFeatured5StarWeapon(featured5Star);
            banner.setFeatured4StarWeapon1(featured4Star1);
            banner.setFeatured4StarWeapon2(featured4Star2);
            banner.setFeatured4StarWeapon3(featured4Star3);
        } else {
            throw new RuntimeException("Invalid banner type. Must be CHARACTER or WEAPON");
        }

        banner.updateStatus();
        Banner savedBanner = bannerRepository.save(banner);
        return convertToResponse(savedBanner);
    }

    // Update banner
    @Transactional
    public BannerResponse updateBanner(Long id, CreateBannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));

        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }

        banner.setName(request.getName());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());
        banner.setBannerType(BannerType.valueOf(request.getBannerType()));
        
        // Update isActive from request
        if (request.getIsActive() != null) {
            banner.setActive(request.getIsActive());
        }

        // Clear existing relationships
        banner.setFeatured5StarCharacter(null);
        banner.setFeatured4StarCharacter1(null);
        banner.setFeatured4StarCharacter2(null);
        banner.setFeatured4StarCharacter3(null);
        banner.setFeatured5StarWeapon(null);
        banner.setFeatured4StarWeapon1(null);
        banner.setFeatured4StarWeapon2(null);
        banner.setFeatured4StarWeapon3(null);

        // Handle CHARACTER banner
        if ("CHARACTER".equals(request.getBannerType())) {
            if (request.getFeatured5StarCharacterId() == null || 
                request.getFeatured4StarCharacter1Id() == null ||
                request.getFeatured4StarCharacter2Id() == null ||
                request.getFeatured4StarCharacter3Id() == null) {
                throw new RuntimeException("All character IDs are required for CHARACTER banner");
            }

            Character featured5Star = characterRepository.findById(request.getFeatured5StarCharacterId())
                    .orElseThrow(() -> new RuntimeException("5-star character not found"));
            Character featured4Star1 = characterRepository.findById(request.getFeatured4StarCharacter1Id())
                    .orElseThrow(() -> new RuntimeException("4-star character 1 not found"));
            Character featured4Star2 = characterRepository.findById(request.getFeatured4StarCharacter2Id())
                    .orElseThrow(() -> new RuntimeException("4-star character 2 not found"));
            Character featured4Star3 = characterRepository.findById(request.getFeatured4StarCharacter3Id())
                    .orElseThrow(() -> new RuntimeException("4-star character 3 not found"));

            // Validate rarity
            if (featured5Star.getRarity() != 5) {
                throw new RuntimeException("Featured 5-star character must have 5-star rarity");
            }
            if (featured4Star1.getRarity() != 4 || featured4Star2.getRarity() != 4 || featured4Star3.getRarity() != 4) {
                throw new RuntimeException("Featured 4-star characters must have 4-star rarity");
            }

            banner.setFeatured5StarCharacter(featured5Star);
            banner.setFeatured4StarCharacter1(featured4Star1);
            banner.setFeatured4StarCharacter2(featured4Star2);
            banner.setFeatured4StarCharacter3(featured4Star3);
        }
        // Handle WEAPON banner
        else if ("WEAPON".equals(request.getBannerType())) {
            if (request.getFeatured5StarWeaponId() == null || 
                request.getFeatured4StarWeapon1Id() == null ||
                request.getFeatured4StarWeapon2Id() == null ||
                request.getFeatured4StarWeapon3Id() == null) {
                throw new RuntimeException("All weapon IDs are required for WEAPON banner");
            }

            Weapon featured5Star = weaponRepository.findById(request.getFeatured5StarWeaponId())
                    .orElseThrow(() -> new RuntimeException("5-star weapon not found"));
            Weapon featured4Star1 = weaponRepository.findById(request.getFeatured4StarWeapon1Id())
                    .orElseThrow(() -> new RuntimeException("4-star weapon 1 not found"));
            Weapon featured4Star2 = weaponRepository.findById(request.getFeatured4StarWeapon2Id())
                    .orElseThrow(() -> new RuntimeException("4-star weapon 2 not found"));
            Weapon featured4Star3 = weaponRepository.findById(request.getFeatured4StarWeapon3Id())
                    .orElseThrow(() -> new RuntimeException("4-star weapon 3 not found"));

            // Validate rarity
            if (featured5Star.getRarity() != 5) {
                throw new RuntimeException("Featured 5-star weapon must have 5-star rarity");
            }
            if (featured4Star1.getRarity() != 4 || featured4Star2.getRarity() != 4 || featured4Star3.getRarity() != 4) {
                throw new RuntimeException("Featured 4-star weapons must have 4-star rarity");
            }

            banner.setFeatured5StarWeapon(featured5Star);
            banner.setFeatured4StarWeapon1(featured4Star1);
            banner.setFeatured4StarWeapon2(featured4Star2);
            banner.setFeatured4StarWeapon3(featured4Star3);
        } else {
            throw new RuntimeException("Invalid banner type. Must be CHARACTER or WEAPON");
        }
        
        banner.updateStatus();

        Banner updatedBanner = bannerRepository.save(banner);
        return convertToResponse(updatedBanner);
    }

    // Delete banner (soft delete)
    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
        banner.setActive(false);
        bannerRepository.save(banner);
    }

    // Update all banner statuses (scheduled task can call this)
    @Transactional
    public void updateAllBannerStatuses() {
        List<Banner> banners = bannerRepository.findByIsActiveTrueOrderByStartDateDesc();
        for (Banner banner : banners) {
            banner.updateStatus();
            bannerRepository.save(banner);
        }
    }

    // Convert Banner entity to BannerResponse DTO
    private BannerResponse convertToResponse(Banner banner) {
        BannerResponse response = new BannerResponse();
        response.setId(banner.getId());
        response.setName(banner.getName());
        response.setStartDate(banner.getStartDate());
        response.setEndDate(banner.getEndDate());
        response.setBannerType(banner.getBannerType().name());

        // Handle CHARACTER banner
        if (banner.getBannerType() == BannerType.CHARACTER) {
            // Featured 5-star character
            if (banner.getFeatured5StarCharacter() != null) {
                Character char5Star = banner.getFeatured5StarCharacter();
                response.setFeatured5StarCharacterId(char5Star.getId());
                response.setFeatured5StarCharacterName(char5Star.getName());
                response.setFeatured5StarCharacterImageUrl(char5Star.getImageUrl());
            }

            // Featured 4-star character 1
            if (banner.getFeatured4StarCharacter1() != null) {
                Character char4Star1 = banner.getFeatured4StarCharacter1();
                response.setFeatured4StarCharacter1Id(char4Star1.getId());
                response.setFeatured4StarCharacter1Name(char4Star1.getName());
                response.setFeatured4StarCharacter1ImageUrl(char4Star1.getImageUrl());
            }

            // Featured 4-star character 2
            if (banner.getFeatured4StarCharacter2() != null) {
                Character char4Star2 = banner.getFeatured4StarCharacter2();
                response.setFeatured4StarCharacter2Id(char4Star2.getId());
                response.setFeatured4StarCharacter2Name(char4Star2.getName());
                response.setFeatured4StarCharacter2ImageUrl(char4Star2.getImageUrl());
            }

            // Featured 4-star character 3
            if (banner.getFeatured4StarCharacter3() != null) {
                Character char4Star3 = banner.getFeatured4StarCharacter3();
                response.setFeatured4StarCharacter3Id(char4Star3.getId());
                response.setFeatured4StarCharacter3Name(char4Star3.getName());
                response.setFeatured4StarCharacter3ImageUrl(char4Star3.getImageUrl());
            }
        }
        // Handle WEAPON banner
        else if (banner.getBannerType() == BannerType.WEAPON) {
            // Featured 5-star weapon
            if (banner.getFeatured5StarWeapon() != null) {
                Weapon weapon5Star = banner.getFeatured5StarWeapon();
                response.setFeatured5StarWeaponId(weapon5Star.getId());
                response.setFeatured5StarWeaponName(weapon5Star.getName());
                response.setFeatured5StarWeaponImageUrl(weapon5Star.getImageUrl());
            }

            // Featured 4-star weapon 1
            if (banner.getFeatured4StarWeapon1() != null) {
                Weapon weapon4Star1 = banner.getFeatured4StarWeapon1();
                response.setFeatured4StarWeapon1Id(weapon4Star1.getId());
                response.setFeatured4StarWeapon1Name(weapon4Star1.getName());
                response.setFeatured4StarWeapon1ImageUrl(weapon4Star1.getImageUrl());
            }

            // Featured 4-star weapon 2
            if (banner.getFeatured4StarWeapon2() != null) {
                Weapon weapon4Star2 = banner.getFeatured4StarWeapon2();
                response.setFeatured4StarWeapon2Id(weapon4Star2.getId());
                response.setFeatured4StarWeapon2Name(weapon4Star2.getName());
                response.setFeatured4StarWeapon2ImageUrl(weapon4Star2.getImageUrl());
            }

            // Featured 4-star weapon 3
            if (banner.getFeatured4StarWeapon3() != null) {
                Weapon weapon4Star3 = banner.getFeatured4StarWeapon3();
                response.setFeatured4StarWeapon3Id(weapon4Star3.getId());
                response.setFeatured4StarWeapon3Name(weapon4Star3.getName());
                response.setFeatured4StarWeapon3ImageUrl(weapon4Star3.getImageUrl());
            }
        }

        response.setStatus(banner.getStatus().name());
        response.setActive(banner.isActive());
        response.setCreatedDate(banner.getCreatedDate());

        return response;
    }

    // Get featured 5-star character and weapon IDs from active banners
    public FeaturedFiveStarIdsResponse getFeaturedFiveStarIds() {
        List<Banner> activeBanners = bannerRepository.findCurrentlyActiveBanners(LocalDateTime.now());
        
        Set<Long> characterIds = new HashSet<>();
        Set<Long> weaponIds = new HashSet<>();

        for (Banner banner : activeBanners) {
            if (banner.getBannerType() == BannerType.CHARACTER && banner.getFeatured5StarCharacter() != null) {
                characterIds.add(banner.getFeatured5StarCharacter().getId());
            } else if (banner.getBannerType() == BannerType.WEAPON && banner.getFeatured5StarWeapon() != null) {
                weaponIds.add(banner.getFeatured5StarWeapon().getId());
            }
        }

        return new FeaturedFiveStarIdsResponse(characterIds, weaponIds);
    }

    // ==================== GACHA SYSTEM ====================
    private Random random = new Random();
    
    // Standard 5-star pool for all character banners (Calcharo, LingYang, Verina, Encore, Jianxin)
    private static final List<String> STANDARD_5_STAR_NAMES = List.of(
        "Calcharo", "Lingyang", "Verina", "Encore", "Jianxin"
    );

    // Calculate 5-star rate with soft pity (Roll 60-69: +1% per roll, Roll 70-79: +10% per roll)
    private double calculateFiveStarRate(int currentPity) {
        double baseRate = 0.8;
        
        // Hard pity at 80
        if (currentPity >= 80) {
            return 100.0;
        }
        
        // Soft pity: Roll 70-79: +10% per roll
        if (currentPity >= 70) {
            return baseRate + (currentPity - 69) * 10.0;
        }
        
        // Soft pity: Roll 60-69: +1% per roll
        if (currentPity >= 60) {
            return baseRate + (currentPity - 59) * 1.0;
        }
        
        return baseRate;
    }

    // Perform gacha roll with pity from client localStorage
    public GachaResultResponse performGacha(Long bannerId, int count, GachaRequest request) {
        if (count != 1 && count != 10) {
            throw new RuntimeException("Invalid count. Must be 1 or 10");
        }

        Banner banner = bannerRepository.findById(bannerId)
            .orElseThrow(() -> new RuntimeException("Banner not found"));

        // Get pity from request (from localStorage)
        int pity5Star = request.getPity5Star();
        int pity4Star = request.getPity4Star();
        boolean guaranteed5StarFeatured = request.isGuaranteed5StarFeatured();
        boolean guaranteed4StarFeatured = request.isGuaranteed4StarFeatured();

        List<GachaItemResponse> results = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            pity5Star++;
            pity4Star++;
            
            // Roll single item with current pity state
            GachaRollResult rollResult = rollSingle(banner, pity5Star, pity4Star, guaranteed5StarFeatured, guaranteed4StarFeatured);
            results.add(rollResult.item);
            
            // Update pity and guarantee flags based on result
            pity5Star = rollResult.newPity5Star;
            pity4Star = rollResult.newPity4Star;
            guaranteed5StarFeatured = rollResult.newGuaranteed5StarFeatured;
            guaranteed4StarFeatured = rollResult.newGuaranteed4StarFeatured;
        }

        return new GachaResultResponse(results, pity4Star, pity5Star, guaranteed5StarFeatured, guaranteed4StarFeatured);
    }

    /**
     * Internal class to hold roll result with updated pity
     */
    private static class GachaRollResult {
        GachaItemResponse item;
        int newPity5Star;
        int newPity4Star;
        boolean newGuaranteed5StarFeatured;
        boolean newGuaranteed4StarFeatured;

        GachaRollResult(GachaItemResponse item, int newPity5Star, int newPity4Star, 
                        boolean newGuaranteed5StarFeatured, boolean newGuaranteed4StarFeatured) {
            this.item = item;
            this.newPity5Star = newPity5Star;
            this.newPity4Star = newPity4Star;
            this.newGuaranteed5StarFeatured = newGuaranteed5StarFeatured;
            this.newGuaranteed4StarFeatured = newGuaranteed4StarFeatured;
        }
    }

    // Roll a single item with provided pity state
    private GachaRollResult rollSingle(Banner banner, int pity5Star, int pity4Star, 
                                       boolean guaranteed5StarFeatured, boolean guaranteed4StarFeatured) {
        // Calculate current 5-star rate with soft pity
        double fiveStarRate = calculateFiveStarRate(pity5Star);

        // Check 5-star pity (guaranteed at 80)
        if (pity5Star >= 80 || random.nextDouble() * 100.0 < fiveStarRate) {
            GachaItemResponse item = roll5Star(banner, guaranteed5StarFeatured);
            // Reset 5-star pity, update guarantee flag
            boolean isGuaranteedNext = !item.isFeatured(); // If got standard, next is guaranteed featured
            return new GachaRollResult(item, 0, pity4Star, isGuaranteedNext, guaranteed4StarFeatured);
        }

        // Check 4-star pity (guaranteed at 10)
        if (pity4Star >= 10 || random.nextDouble() * 100.0 < 6.0) {
            GachaItemResponse item = roll4Star(banner, guaranteed4StarFeatured);
            // Reset 4-star pity, update guarantee flag
            boolean isGuaranteedNext = !item.isFeatured(); // If got standard, next is guaranteed featured
            return new GachaRollResult(item, pity5Star, 0, guaranteed5StarFeatured, isGuaranteedNext);
        }

        // 3-star: 93.2%
        GachaItemResponse item = roll3Star();
        // No pity reset for 3-star
        return new GachaRollResult(item, pity5Star, pity4Star, guaranteed5StarFeatured, guaranteed4StarFeatured);
    }

    // Roll a 5-star item (stateless)
    private GachaItemResponse roll5Star(Banner banner, boolean isGuaranteed) {
        Character featuredChar = null;
        Weapon featuredWeapon = null;
        List<Character> standardPool = new ArrayList<>();

        if (banner.getBannerType() == BannerType.CHARACTER) {
            featuredChar = banner.getFeatured5StarCharacter();
            
            // Get standard 5-star characters
            standardPool = characterRepository.findAll().stream()
                .filter(c -> c.getRarity() == 5)
                .filter(c -> STANDARD_5_STAR_NAMES.contains(c.getName()))
                .collect(Collectors.toList());
                
            // Character banner: 50/50 system
            boolean isFeatured;
            if (isGuaranteed) {
                isFeatured = true;
            } else {
                isFeatured = random.nextDouble() < 0.5;
            }

            if (isFeatured) {
                // MUST return featured character
                if (featuredChar != null) {
                    return createGachaItem(featuredChar, true);
                }
                throw new RuntimeException("Featured 5-star character not found in banner");
            } else {
                // Return standard character
                if (!standardPool.isEmpty()) {
                    Character standardChar = standardPool.get(random.nextInt(standardPool.size()));
                    return createGachaItem(standardChar, false);
                }
                throw new RuntimeException("Standard 5-star pool is empty");
            }
        } else if (banner.getBannerType() == BannerType.WEAPON) {
            // Weapon banner: 100% featured weapon (no 50/50)
            featuredWeapon = banner.getFeatured5StarWeapon();
            if (featuredWeapon != null) {
                return createGachaItem(featuredWeapon, true);
            }
            throw new RuntimeException("Featured 5-star weapon not found in banner");
        }

        throw new RuntimeException("Unable to roll 5-star");
    }

    // Roll a 4-star item (stateless)
    private GachaItemResponse roll4Star(Banner banner, boolean isGuaranteed) {
        List<Character> featuredChars = new ArrayList<>();
        List<Weapon> featuredWeapons = new ArrayList<>();
        List<Character> allFourStarChars = characterRepository.findAll().stream()
            .filter(c -> c.getRarity() == 4)
            .collect(Collectors.toList());
        List<Weapon> allFourStarWeapons = weaponRepository.findAll().stream()
            .filter(w -> w.getRarity() == 4)
            .collect(Collectors.toList());

        if (banner.getBannerType() == BannerType.CHARACTER) {
            // Get featured 4-star characters from banner
            if (banner.getFeatured4StarCharacter1() != null) featuredChars.add(banner.getFeatured4StarCharacter1());
            if (banner.getFeatured4StarCharacter2() != null) featuredChars.add(banner.getFeatured4StarCharacter2());
            if (banner.getFeatured4StarCharacter3() != null) featuredChars.add(banner.getFeatured4StarCharacter3());
        } else {
            // Get featured 4-star weapons from weapon banner
            if (banner.getFeatured4StarWeapon1() != null) featuredWeapons.add(banner.getFeatured4StarWeapon1());
            if (banner.getFeatured4StarWeapon2() != null) featuredWeapons.add(banner.getFeatured4StarWeapon2());
            if (banner.getFeatured4StarWeapon3() != null) featuredWeapons.add(banner.getFeatured4StarWeapon3());
        }

        // 50/50 system for 4-star
        boolean isFeatured;
        if (isGuaranteed) {
            isFeatured = true;
        } else {
            isFeatured = random.nextDouble() < 0.5;
        }

        if (banner.getBannerType() == BannerType.CHARACTER) {
            if (isFeatured) {
                // MUST return one of the featured 4-star characters
                if (!featuredChars.isEmpty()) {
                    Character featured = featuredChars.get(random.nextInt(featuredChars.size()));
                    return createGachaItem(featured, true);
                }
                throw new RuntimeException("Featured 4-star characters not found in banner");
            } else {
                // Return standard 4-star character
                if (!allFourStarChars.isEmpty()) {
                    Character standard = allFourStarChars.get(random.nextInt(allFourStarChars.size()));
                    return createGachaItem(standard, false);
                }
                throw new RuntimeException("Standard 4-star character pool is empty");
            }
        } else {
            // Weapon banner: 50/50 system for 4-star
            if (isFeatured) {
                // MUST return one of the featured 4-star weapons
                if (!featuredWeapons.isEmpty()) {
                    Weapon featured = featuredWeapons.get(random.nextInt(featuredWeapons.size()));
                    return createGachaItem(featured, true);
                }
                throw new RuntimeException("Featured 4-star weapons not found in banner");
            } else {
                // Return standard 4-star (character or weapon)
                List<Object> allItems = new ArrayList<>();
                allItems.addAll(allFourStarChars);
                allItems.addAll(allFourStarWeapons);
                if (!allItems.isEmpty()) {
                    Object item = allItems.get(random.nextInt(allItems.size()));
                    if (item instanceof Character) {
                        return createGachaItem((Character) item, false);
                    } else {
                        return createGachaItem((Weapon) item, false);
                    }
                }
                throw new RuntimeException("Standard 4-star pool is empty");
            }
        }
    }

    // Roll a 3-star weapon
    private GachaItemResponse roll3Star() {
        // Get all 3-star weapons
        List<Weapon> threeStarWeapons = weaponRepository.findAll().stream()
            .filter(w -> w.getRarity() == 3)
            .collect(Collectors.toList());

        if (threeStarWeapons.isEmpty()) {
            throw new RuntimeException("No 3-star weapons available");
        }

        Weapon weapon = threeStarWeapons.get(random.nextInt(threeStarWeapons.size()));
        return createGachaItem(weapon, false);
    }

    // Create GachaItemResponse from Character
    private GachaItemResponse createGachaItem(Character character, boolean isFeatured) {
        GachaItemResponse item = new GachaItemResponse();
        item.setId(character.getId());
        item.setName(character.getName());
        item.setImageUrl(character.getImageUrl());
        item.setRarity(character.getRarity());
        item.setType("CHARACTER");
        item.setElement(character.getElement() != null ? character.getElement().name() : null);
        item.setWeaponType(character.getWeaponType() != null ? character.getWeaponType().name() : null);
        item.setNew(false); // TODO: Check user inventory
        item.setFeatured(isFeatured);
        return item;
    }

    // Create GachaItemResponse from Weapon
    private GachaItemResponse createGachaItem(Weapon weapon, boolean isFeatured) {
        GachaItemResponse item = new GachaItemResponse();
        item.setId(weapon.getId());
        item.setName(weapon.getName());
        item.setImageUrl(weapon.getImageUrl());
        item.setRarity(weapon.getRarity());
        item.setType("WEAPON");
        item.setElement(null);
        item.setWeaponType(weapon.getWeaponType() != null ? weapon.getWeaponType().name() : null);
        item.setNew(false); // TODO: Check user inventory
        item.setFeatured(isFeatured);
        return item;
    }
}
