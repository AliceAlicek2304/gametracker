package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CharacterResponse;
import com.alice.gametracker.dto.CreateCharacterRequest;
import com.alice.gametracker.dto.DeactivateCharacterRequest;
import com.alice.gametracker.dto.RoleResponse;
import com.alice.gametracker.dto.SkillResponse;
import com.alice.gametracker.dto.StatsResponse;
import com.alice.gametracker.dto.UpdateCharacterRequest;
import com.alice.gametracker.model.Character;
import com.alice.gametracker.model.Element;
import com.alice.gametracker.model.RoleCharacter;
import com.alice.gametracker.model.Skill;
import com.alice.gametracker.model.Stats;
import com.alice.gametracker.model.WeaponType;
import com.alice.gametracker.repository.CharacterRepository;
import com.alice.gametracker.repository.RoleCharacterRepository;
import com.alice.gametracker.repository.SkillRepository;
import com.alice.gametracker.repository.StatsRepository;

@Service
@Transactional
public class CharacterService {
    private static final Logger log = LoggerFactory.getLogger(CharacterService.class);

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private RoleCharacterRepository roleCharacterRepository;

    @Autowired
    private StatsRepository statsRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public Character save(Character character) {
        return characterRepository.save(character);
    }

    public Optional<Character> findById(Long id) {
        return characterRepository.findById(id);
    }

    public List<Character> findAll() {
        return characterRepository.findAll();
    }

    public Character update(Character character) {
        return characterRepository.save(character);
    }

    public void deleteById(Long id) {
        characterRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return characterRepository.existsById(id);
    }

    // Create new character
    public CharacterResponse createCharacter(CreateCharacterRequest request, MultipartFile imageFile) throws Exception {
        // Validate roles exist
        List<RoleCharacter> roles = roleCharacterRepository.findAllById(request.getRoleIds());
        if (roles.size() != request.getRoleIds().size()) {
            throw new RuntimeException("Some role IDs are invalid");
        }

        // Create stats
        // DTO uses Double (nullable); coerce to primitive double with default 0.0 to avoid NPE
        Stats stats = new Stats(
            request.getAtk() != null ? request.getAtk() : 0.0,
            request.getDef() != null ? request.getDef() : 0.0,
            request.getHp() != null ? request.getHp() : 0.0,
            request.getAtkUp() != null ? request.getAtkUp() : 0.0,
            request.getDefUp() != null ? request.getDefUp() : 0.0,
            request.getHpUp() != null ? request.getHpUp() : 0.0
        );
        stats = statsRepository.save(stats);

        // Create skill: use structured JsonNode if provided
        Skill skill = new Skill();
        if (request.getSkill() != null) {
            skill.setSkillNode(request.getSkill());
        }
        skill = skillRepository.save(skill);

        // Handle image upload
        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileStorageService.storeCharacterImage(imageFile);
        }

        // Create character
        Character character = new Character(
            request.getName(),
            request.getRarity(),
            roles,
            Element.valueOf(request.getElement()),
            WeaponType.valueOf(request.getWeaponType()),
            request.getDescription(),
            imageUrl,
            stats,
            skill
        );

        character = characterRepository.save(character);
        return convertToResponse(character);
    }

    // Update character (JSON only)
    public CharacterResponse updateCharacter(Long id, UpdateCharacterRequest request) throws Exception {
        Character character = characterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Character not found"));

        // Validate roles exist
        List<RoleCharacter> roles = roleCharacterRepository.findAllById(request.getRoleIds());
        if (roles.size() != request.getRoleIds().size()) {
            throw new RuntimeException("Some role IDs are invalid");
        }

        // Update stats
        Stats stats = character.getStats();
    // coerce nullable Double to primitive double
    stats.setAtk(request.getAtk() != null ? request.getAtk() : 0.0);
    stats.setDef(request.getDef() != null ? request.getDef() : 0.0);
    stats.setHp(request.getHp() != null ? request.getHp() : 0.0);
    stats.setAtkUp(request.getAtkUp() != null ? request.getAtkUp() : 0.0);
    stats.setDefUp(request.getDefUp() != null ? request.getDefUp() : 0.0);
    stats.setHpUp(request.getHpUp() != null ? request.getHpUp() : 0.0);
        statsRepository.save(stats);

        // Update skill: replace JSON if provided
        Skill skill = character.getSkill();
        if (request.getSkill() != null) {
            skill.setSkillNode(request.getSkill());
            skillRepository.save(skill);
        }

        // Update character
        character.setName(request.getName());
        character.setRarity(request.getRarity());
        character.setRoles(roles);
        character.setElement(Element.valueOf(request.getElement()));
        character.setWeaponType(WeaponType.valueOf(request.getWeaponType()));
        character.setDescription(request.getDescription());

        character = characterRepository.save(character);
        return convertToResponse(character);
    }

    // Update only character image
    public CharacterResponse updateCharacterImage(Long id, MultipartFile imageFile) throws Exception {
        Character character = characterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Character not found"));

        if (imageFile == null || imageFile.isEmpty()) {
            return convertToResponse(character);
        }

        // Delete old image if exists
        if (character.getImageUrl() != null) {
            try { fileStorageService.deleteFile(character.getImageUrl()); } catch (java.io.IOException ex) { log.warn("Failed to delete old image: {}", ex.getMessage()); }
        }

        String imageUrl = fileStorageService.storeCharacterImage(imageFile);
        character.setImageUrl(imageUrl);

        character = characterRepository.save(character);
        return convertToResponse(character);
    }

    // Deactivate/activate character
    public CharacterResponse deactivateCharacter(Long id, DeactivateCharacterRequest request) {
        Character character = characterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Character not found"));

        character.setActive(request.getIsActive());
        character = characterRepository.save(character);
        return convertToResponse(character);
    }

    // Hard delete character
    public void deleteCharacter(Long id) throws Exception {
        Character character = characterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Character not found"));

        // Capture image URL before deleting the entity
        final String imageUrl = character.getImageUrl();

        // Delete the entity (this runs inside the current transaction)
        characterRepository.delete(character);

        // Ensure file deletion runs only after transaction commit to avoid
        // removing files when DB delete fails. Register an after-commit callback.
        if (imageUrl != null) {
            try {
                final String toDelete = imageUrl;
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                            try {
                                fileStorageService.deleteFile(toDelete);
                            } catch (java.io.IOException ex) {
                                // Log and swallow - file cleanup failure shouldn't break API flow
                                log.warn("Failed to delete character image after commit: {}", ex.getMessage());
                            }
                    }
                });
            } catch (Exception ex) {
                // Fallback: attempt best-effort delete now and don't fail the delete operation
                try {
                    fileStorageService.deleteFile(imageUrl);
                } catch (java.io.IOException e) {
                    log.warn("Failed to delete character image (fallback): {}", e.getMessage());
                }
            }
        }
    }

    // Get character by ID
    public Optional<CharacterResponse> findCharacterById(Long id) {
        return characterRepository.findById(id).map(this::convertToResponse);
    }

    // Get all characters
    public List<CharacterResponse> findAllCharacters() {
        return characterRepository.findAll().stream()
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    // Get active characters only
    public List<CharacterResponse> findActiveCharacters() {
        return characterRepository.findAll().stream()
            .filter(Character::isActive)
            .map(this::convertToResponse)
            .collect(Collectors.toList());
    }

    // Convert entity to response DTO
    private CharacterResponse convertToResponse(Character character) {
        List<RoleResponse> roleResponses = character.getRoles().stream()
            .map(role -> new RoleResponse(
                role.getId(),
                role.getIcon(),
                role.getName(),
                role.getDescription(),
                role.isActive(),
                role.getCreatedDate()
            ))
            .collect(Collectors.toList());

        StatsResponse statsResponse = new StatsResponse(
            character.getStats().getId(),
            character.getStats().getAtk(),
            character.getStats().getDef(),
            character.getStats().getHp(),
            character.getStats().getAtkUp(),
            character.getStats().getDefUp(),
            character.getStats().getHpUp(),
            character.getStats().isActive(),
            character.getStats().getCreatedDate()
        );

        SkillResponse skillResponse = new SkillResponse(
            character.getSkill().getId(),
            character.getSkill().getSkillNode(),
            character.getSkill().isActive(),
            character.getSkill().getCreatedDate()
        );

        return new CharacterResponse(
            character.getId(),
            character.getName(),
            character.getRarity(),
            roleResponses,
            character.getElement().name(),
            character.getWeaponType().name(),
            character.isActive(),
            character.getDescription(),
            character.getImageUrl(),
            statsResponse,
            skillResponse,
            character.getCreatedDate()
        );
    }
}