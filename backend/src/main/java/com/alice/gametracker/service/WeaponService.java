package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CreateWeaponRequest;
import com.alice.gametracker.dto.DeactivateWeaponRequest;
import com.alice.gametracker.dto.UpdateWeaponRequest;
import com.alice.gametracker.dto.WeaponCardResponse;
import com.alice.gametracker.dto.WeaponResponse;
import com.alice.gametracker.model.Weapon;
import com.alice.gametracker.repository.WeaponRepository;

@Service
@Transactional
public class WeaponService {
    private static final Logger log = LoggerFactory.getLogger(WeaponService.class);

    @Autowired
    private WeaponRepository weaponRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // Create new weapon (service accepts optional imageFile)
    public WeaponResponse createWeapon(CreateWeaponRequest request, MultipartFile imageFile) throws Exception {
        Weapon weapon = new Weapon(
            com.alice.gametracker.model.WeaponType.valueOf(request.getWeaponType()),
            request.getName(),
            null,
            request.getDescription(),
            request.getMainStats(),
            request.getSubStats(),
            request.getSubStatsType() != null ? com.alice.gametracker.model.SubStatsType.valueOf(request.getSubStatsType()) : null,
            request.getSkill(),
            request.getRarity() != null ? request.getRarity() : 1
        );

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = fileStorageService.storeWeaponImage(imageFile);
            weapon.setImageUrl(imageUrl);
        }

        Weapon saved = weaponRepository.save(weapon);
        return convertToResponse(saved);
    }

    // Update weapon (JSON only)
    public WeaponResponse updateWeapon(Long id, UpdateWeaponRequest request) throws Exception {
        Optional<Weapon> optional = weaponRepository.findById(id);
        if (optional.isEmpty()) throw new RuntimeException("Weapon not found");

        Weapon weapon = optional.get();
        weapon.setWeaponType(com.alice.gametracker.model.WeaponType.valueOf(request.getWeaponType()));
        weapon.setName(request.getName());
        weapon.setDescription(request.getDescription());
        weapon.setMainStats(request.getMainStats());
        weapon.setSubStats(request.getSubStats());
    if (request.getSubStatsType() != null) weapon.setSubStatsType(com.alice.gametracker.model.SubStatsType.valueOf(request.getSubStatsType()));
    weapon.setSkill(request.getSkill());
    if (request.getRarity() != null) weapon.setRarity(request.getRarity());

        Weapon updated = weaponRepository.save(weapon);
        return convertToResponse(updated);
    }

    // Update only weapon image
    public WeaponResponse updateWeaponImage(Long id, MultipartFile imageFile) throws Exception {
        Optional<Weapon> optional = weaponRepository.findById(id);
        if (optional.isEmpty()) throw new RuntimeException("Weapon not found");

        Weapon weapon = optional.get();

        if (imageFile == null || imageFile.isEmpty()) return convertToResponse(weapon);

        // Delete old image if exists
        if (weapon.getImageUrl() != null) {
            try { fileStorageService.deleteFile(weapon.getImageUrl()); } catch (java.io.IOException ex) { log.warn("Failed to delete old weapon image: {}", ex.getMessage()); }
        }

        String imageUrl = fileStorageService.storeWeaponImage(imageFile);
        weapon.setImageUrl(imageUrl);
        Weapon updated = weaponRepository.save(weapon);
        return convertToResponse(updated);
    }

    // Deactivate/activate
    public WeaponResponse deactivateWeapon(Long id, DeactivateWeaponRequest request) {
        Optional<Weapon> optional = weaponRepository.findById(id);
        if (optional.isEmpty()) throw new RuntimeException("Weapon not found");

        Weapon weapon = optional.get();
        weapon.setActive(request.getIsActive());
        Weapon updated = weaponRepository.save(weapon);
        return convertToResponse(updated);
    }

    // Hard delete weapon
    public void deleteWeapon(Long id) throws Exception {
        Optional<Weapon> optional = weaponRepository.findById(id);
        if (optional.isEmpty()) throw new RuntimeException("Weapon not found");

        Weapon weapon = optional.get();

        // Delete image if exists
        if (weapon.getImageUrl() != null) {
            try { fileStorageService.deleteFile(weapon.getImageUrl()); } catch (java.io.IOException ex) { log.warn("Failed to delete weapon image: {}", ex.getMessage()); }
        }

        weaponRepository.deleteById(id);
    }

    // Getters / listings
    public Optional<WeaponResponse> findByIdResponse(Long id) {
        return weaponRepository.findById(id).map(this::convertToResponse);
    }

    public Optional<Weapon> findById(Long id) { return weaponRepository.findById(id); }

    public List<Weapon> findAll() { return weaponRepository.findAll(); }

    // Return DTO list similar to other services
    public List<WeaponResponse> findAllResponses() {
        return weaponRepository.findAll().stream().map(this::convertToResponse).toList();
    }

    public List<WeaponResponse> findActiveWeapons() {
        return weaponRepository.findAll().stream().filter(Weapon::isActive).map(this::convertToResponse).toList();
    }

    // Get simplified weapon cards (only essential fields for public listing)
    public List<WeaponCardResponse> findWeaponCards() {
        return weaponRepository.findAll().stream()
            .filter(Weapon::isActive)
            .map(this::convertToCardResponse)
            .toList();
    }

    // Find by name (case-insensitive)
    public Optional<WeaponResponse> findByName(String name) {
        if (name == null || name.trim().isEmpty()) return Optional.empty();
        return weaponRepository.findAll().stream()
            .filter(w -> w.getName() != null && w.getName().equalsIgnoreCase(name.trim()))
            .findFirst()
            .map(this::convertToResponse);
    }

    // Convert to DTO
    private WeaponResponse convertToResponse(Weapon weapon) {
        return new WeaponResponse(
            weapon.getId(),
            weapon.getWeaponType() != null ? weapon.getWeaponType().name() : null,
            weapon.getName(),
            weapon.getImageUrl(),
            weapon.getDescription(),
            weapon.getMainStats(),
            weapon.getSubStats(),
            weapon.getSubStatsType() != null ? weapon.getSubStatsType().name() : null,
            weapon.getSkill(),
            weapon.getRarity(),
            weapon.isActive(),
            weapon.getCreatedDate()
        );
    }

    // Convert entity to simplified card response DTO (only essential fields)
    private WeaponCardResponse convertToCardResponse(Weapon weapon) {
        return new WeaponCardResponse(
            weapon.getId(),
            weapon.getName(),
            weapon.getWeaponType() != null ? weapon.getWeaponType().name() : null,
            weapon.getImageUrl(),
            weapon.getRarity()
        );
    }

    // Legacy helpers
    public Weapon save(Weapon w) { return weaponRepository.save(w); }
    public void deleteById(Long id) { weaponRepository.deleteById(id); }
    public boolean existsById(Long id) { return weaponRepository.existsById(id); }
}
