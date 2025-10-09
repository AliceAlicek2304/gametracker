package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CreateRoleRequest;
import com.alice.gametracker.dto.DeactivateRoleRequest;
import com.alice.gametracker.dto.RoleResponse;
import com.alice.gametracker.dto.UpdateRoleRequest;
import com.alice.gametracker.model.RoleCharacter;
import com.alice.gametracker.repository.CharacterRepository;
import com.alice.gametracker.repository.RoleCharacterRepository;

@Service
@Transactional
public class RoleCharacterService {
    private static final Logger log = LoggerFactory.getLogger(RoleCharacterService.class);

    @Autowired
    private RoleCharacterRepository roleCharacterRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private FileStorageService fileStorageService;

    // Create new role
    public RoleResponse createRole(CreateRoleRequest request, MultipartFile iconFile) throws Exception {
        RoleCharacter role = new RoleCharacter();
        role.setName(request.getName());
        role.setDescription(request.getDescription());
        
        // Store icon if provided
        if (iconFile != null && !iconFile.isEmpty()) {
            String iconUrl = fileStorageService.storeRoleIcon(iconFile);
            role.setIcon(iconUrl);
        }
        
        RoleCharacter savedRole = roleCharacterRepository.save(role);
        return convertToResponse(savedRole);
    }

    // Update role (JSON only)
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) throws Exception {
        Optional<RoleCharacter> optionalRole = roleCharacterRepository.findById(id);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found with id: " + id);
        }

        RoleCharacter role = optionalRole.get();
        role.setName(request.getName());
        role.setDescription(request.getDescription());

        RoleCharacter updatedRole = roleCharacterRepository.save(role);
        return convertToResponse(updatedRole);
    }

    // Update only role icon
    public RoleResponse updateRoleIcon(Long id, MultipartFile iconFile) throws Exception {
        Optional<RoleCharacter> optionalRole = roleCharacterRepository.findById(id);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found with id: " + id);
        }

        RoleCharacter role = optionalRole.get();

        if (iconFile == null || iconFile.isEmpty()) {
            return convertToResponse(role);
        }

        // Delete old icon if exists
        if (role.getIcon() != null) {
            try {
                fileStorageService.deleteFile(role.getIcon());
            } catch (java.io.IOException ex) {
                // log and continue - don't block update because of delete failure
                log.warn("Failed to delete old icon: {}", ex.getMessage());
            }
        }

        String iconUrl = fileStorageService.storeRoleIcon(iconFile);
        role.setIcon(iconUrl);

        RoleCharacter updatedRole = roleCharacterRepository.save(role);
        return convertToResponse(updatedRole);
    }

    // Deactivate/activate role
    public RoleResponse deactivateRole(Long id, DeactivateRoleRequest request) {
        Optional<RoleCharacter> optionalRole = roleCharacterRepository.findById(id);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found with id: " + id);
        }
        
        RoleCharacter role = optionalRole.get();
        role.setActive(request.getIsActive());
        
        RoleCharacter updatedRole = roleCharacterRepository.save(role);
        return convertToResponse(updatedRole);
    }

    // Hard delete role
    public void deleteRole(Long id) throws Exception {
        Optional<RoleCharacter> optionalRole = roleCharacterRepository.findById(id);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found with id: " + id);
        }
        
        RoleCharacter role = optionalRole.get();
        
        // Check if role is being used by any character
        if (characterRepository.existsByRoleId(id)) {
            throw new RuntimeException("Cannot delete role that is being used by characters");
        }
        
        // Delete icon file if exists
        if (role.getIcon() != null) {
            try { fileStorageService.deleteFile(role.getIcon()); } catch (java.io.IOException ex) { log.warn("Failed to delete role icon: {}", ex.getMessage()); }
        }
        
        roleCharacterRepository.deleteById(id);
    }

    // Get role by ID
    public Optional<RoleResponse> findById(Long id) {
        return roleCharacterRepository.findById(id)
                .map(this::convertToResponse);
    }

    // Get all roles
    public List<RoleResponse> findAll() {
        return roleCharacterRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Get active roles only
    public List<RoleResponse> findActiveRoles() {
        return roleCharacterRepository.findAll()
                .stream()
                .filter(RoleCharacter::isActive)
                .map(this::convertToResponse)
                .toList();
    }

    // Convert entity to response DTO
    private RoleResponse convertToResponse(RoleCharacter role) {
        return new RoleResponse(
                role.getId(),
                role.getIcon(),
                role.getName(),
                role.getDescription(),
                role.isActive(),
                role.getCreatedDate()
        );
    }

    // Legacy methods for backward compatibility
    public RoleCharacter save(RoleCharacter roleCharacter) {
        return roleCharacterRepository.save(roleCharacter);
    }

    public Optional<RoleCharacter> findByIdEntity(Long id) {
        return roleCharacterRepository.findById(id);
    }

    public List<RoleCharacter> findAllEntities() {
        return roleCharacterRepository.findAll();
    }

    public RoleCharacter update(RoleCharacter roleCharacter) {
        return roleCharacterRepository.save(roleCharacter);
    }

    public void deleteById(Long id) {
        roleCharacterRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return roleCharacterRepository.existsById(id);
    }
}