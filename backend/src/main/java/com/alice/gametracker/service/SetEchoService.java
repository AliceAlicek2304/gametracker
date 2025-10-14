package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CreateSetEchoRequest;
import com.alice.gametracker.dto.DeactivateWeaponRequest;
import com.alice.gametracker.dto.SetEchoResponse;
import com.alice.gametracker.dto.UpdateSetEchoRequest;
import com.alice.gametracker.model.SetEcho;
import com.alice.gametracker.repository.SetEchoRepository;

@Service
@Transactional
public class SetEchoService {
    private static final Logger log = LoggerFactory.getLogger(SetEchoService.class);

    @Autowired
    private SetEchoRepository setEchoRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public SetEchoResponse createSetEcho(CreateSetEchoRequest request, MultipartFile iconFile) throws Exception {
        SetEcho s = new SetEcho(request.getName(), request.getSkill(), request.getIcon());

        if (iconFile != null && !iconFile.isEmpty()) {
            String iconUrl = fileStorageService.storeSetEchoIcon(iconFile);
            s.setIcon(iconUrl);
        }

        SetEcho saved = setEchoRepository.save(s);
        return convertToResponse(saved);
    }

    public SetEchoResponse updateSetEcho(Long id, UpdateSetEchoRequest request) throws Exception {
        Optional<SetEcho> opt = setEchoRepository.findById(id);
        if (opt.isEmpty()) throw new RuntimeException("SetEcho not found");

        SetEcho s = opt.get();
        if (request.getName() != null) s.setName(request.getName());
        s.setSkill(request.getSkill());
        if (request.getIcon() != null) s.setIcon(request.getIcon());

        SetEcho updated = setEchoRepository.save(s);
        return convertToResponse(updated);
    }

    public SetEchoResponse updateSetEchoIcon(Long id, MultipartFile iconFile) throws Exception {
        Optional<SetEcho> opt = setEchoRepository.findById(id);
        if (opt.isEmpty()) throw new RuntimeException("SetEcho not found");

        SetEcho s = opt.get();

        if (iconFile == null || iconFile.isEmpty()) return convertToResponse(s);

        if (s.getIcon() != null) {
            try { fileStorageService.deleteFile(s.getIcon()); } catch (java.io.IOException ex) { log.warn("Failed to delete old setecho icon: {}", ex.getMessage()); }
        }

        String iconUrl = fileStorageService.storeSetEchoIcon(iconFile);
        s.setIcon(iconUrl);
        SetEcho updated = setEchoRepository.save(s);
        return convertToResponse(updated);
    }

    public SetEchoResponse deactivateSetEcho(Long id, DeactivateWeaponRequest request) {
        Optional<SetEcho> opt = setEchoRepository.findById(id);
        if (opt.isEmpty()) throw new RuntimeException("SetEcho not found");

        SetEcho s = opt.get();
        s.setActive(request.getIsActive());
        SetEcho updated = setEchoRepository.save(s);
        return convertToResponse(updated);
    }

    public void deleteSetEcho(Long id) throws Exception {
        Optional<SetEcho> opt = setEchoRepository.findById(id);
        if (opt.isEmpty()) throw new RuntimeException("SetEcho not found");
        SetEcho s = opt.get();

        if (s.getIcon() != null) {
            try { fileStorageService.deleteFile(s.getIcon()); } catch (java.io.IOException ex) { log.warn("Failed to delete setecho icon: {}", ex.getMessage()); }
        }

        setEchoRepository.deleteById(id);
    }

    public Optional<SetEchoResponse> findByIdResponse(Long id) { return setEchoRepository.findById(id).map(this::convertToResponse); }
    public List<SetEchoResponse> findAllResponses() { return setEchoRepository.findAll().stream().map(this::convertToResponse).toList(); }
    public List<SetEchoResponse> findActiveSetEchoes() { return setEchoRepository.findAll().stream().filter(SetEcho::isActive).map(this::convertToResponse).toList(); }

    // Expose raw entity lookup for internal service usage
    public Optional<SetEcho> findById(Long id) { return setEchoRepository.findById(id); }

    private SetEchoResponse convertToResponse(SetEcho s) {
        return new SetEchoResponse(s.getId(), s.getName(), s.getSkill(), s.getIcon(), s.isActive(), s.getCreatedDate());
    }
}