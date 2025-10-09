package com.alice.gametracker.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.alice.gametracker.dto.CreateEchoRequest;
import com.alice.gametracker.dto.DeactivateWeaponRequest;
import com.alice.gametracker.dto.EchoResponse;
import com.alice.gametracker.dto.UpdateEchoRequest;
import com.alice.gametracker.model.Echo;
import com.alice.gametracker.model.SetEcho;
import com.alice.gametracker.repository.EchoRepository;

@Service
@Transactional
public class EchoService {
    private static final Logger log = LoggerFactory.getLogger(EchoService.class);

    @Autowired
    private EchoRepository echoRepository;

    @Autowired
    private SetEchoService setEchoService;

    @Autowired
    private FileStorageService fileStorageService;

    public Echo save(Echo echo) {
        return echoRepository.save(echo);
    }

    public Optional<Echo> findById(Long id) {
        return echoRepository.findById(id);
    }

    public List<Echo> findAll() {
        return echoRepository.findAll();
    }

    public Echo update(Echo echo) {
        return echoRepository.save(echo);
    }

    public Echo createFromDto(CreateEchoRequest req) {
        SetEcho setEcho = null;
        if (req.getSetEchoId() != null) {
            setEcho = setEchoService.findById(req.getSetEchoId()).orElse(null);
        }
    Integer c = req.getCost();
    int cost = c != null ? c : 0;
        Echo e = new Echo(
            req.getImageUrl(),
            req.getName(),
            req.getDescription(),
            cost,
            req.getSkill(),
            setEcho
        );
        return echoRepository.save(e);
    }

    public Echo updateFromDto(Long id, UpdateEchoRequest req) {
        Echo echo = echoRepository.findById(id).orElseThrow(() -> new RuntimeException("Echo not found"));
        echo.setImageUrl(req.getImageUrl());
        echo.setName(req.getName());
        echo.setDescription(req.getDescription());
    Integer uc = req.getCost();
    echo.setCost(uc != null ? uc : 0);
        echo.setSkill(req.getSkill());
        if (req.getSetEchoId() != null) {
            setEchoService.findById(req.getSetEchoId()).ifPresent(echo::setSetEcho);
        } else {
            echo.setSetEcho(null);
        }
        return echoRepository.save(echo);
    }

    // DTO-based create that accepts optional image file
    public EchoResponse createEcho(CreateEchoRequest req, MultipartFile imageFile) throws Exception {
        Echo e = new Echo();
        SetEcho setEcho = null;
        if (req.getSetEchoId() != null) setEcho = setEchoService.findById(req.getSetEchoId()).orElse(null);
        e.setImageUrl(req.getImageUrl());
        e.setName(req.getName());
        e.setDescription(req.getDescription());
        Integer createCost = req.getCost();
        e.setCost(createCost != null ? createCost : 0);
        e.setSkill(req.getSkill());
        e.setSetEcho(setEcho);

        if (imageFile != null && !imageFile.isEmpty()) {
            String url = fileStorageService.storeEchoImage(imageFile);
            e.setImageUrl(url);
        }

        Echo saved = echoRepository.save(e);
        return convertToResponse(saved);
    }

    public EchoResponse updateEcho(Long id, UpdateEchoRequest req) throws Exception {
        Echo echo = echoRepository.findById(id).orElseThrow(() -> new RuntimeException("Echo not found"));
        echo.setImageUrl(req.getImageUrl());
        echo.setName(req.getName());
        echo.setDescription(req.getDescription());
        Integer updateCost = req.getCost();
        echo.setCost(updateCost != null ? updateCost : 0);
        echo.setSkill(req.getSkill());
        if (req.getSetEchoId() != null) setEchoService.findById(req.getSetEchoId()).ifPresent(echo::setSetEcho);
        else echo.setSetEcho(null);
        Echo updated = echoRepository.save(echo);
        return convertToResponse(updated);
    }

    public EchoResponse updateEchoImage(Long id, MultipartFile imageFile) throws Exception {
        Echo echo = echoRepository.findById(id).orElseThrow(() -> new RuntimeException("Echo not found"));
        if (imageFile == null || imageFile.isEmpty()) return convertToResponse(echo);
        if (echo.getImageUrl() != null) {
            try { fileStorageService.deleteFile(echo.getImageUrl()); } catch (java.io.IOException ex) { log.warn("Failed to delete echo image: {}", ex.getMessage()); }
        }
        String url = fileStorageService.storeEchoImage(imageFile);
        echo.setImageUrl(url);
        Echo updated = echoRepository.save(echo);
        return convertToResponse(updated);
    }

    public EchoResponse deactivateEcho(Long id, DeactivateWeaponRequest req) {
        Echo echo = echoRepository.findById(id).orElseThrow(() -> new RuntimeException("Echo not found"));
        echo.setActive(req.getIsActive());
        Echo updated = echoRepository.save(echo);
        return convertToResponse(updated);
    }

    public void deleteEchoWithFile(Long id) throws Exception {
        Echo echo = echoRepository.findById(id).orElseThrow(() -> new RuntimeException("Echo not found"));
        if (echo.getImageUrl() != null) {
            try { fileStorageService.deleteFile(echo.getImageUrl()); } catch (java.io.IOException ex) { log.warn("Failed to delete echo image: {}", ex.getMessage()); }
        }
        echoRepository.deleteById(id);
    }

    public Optional<EchoResponse> findByIdResponse(Long id) { return echoRepository.findById(id).map(this::convertToResponse); }
    public List<EchoResponse> findAllResponses() { return echoRepository.findAll().stream().map(this::convertToResponse).toList(); }
    public List<EchoResponse> findActiveResponses() { return echoRepository.findAll().stream().filter(Echo::isActive).map(this::convertToResponse).toList(); }

    private EchoResponse convertToResponse(Echo e) {
        return new EchoResponse(e.getId(), e.getImageUrl(), e.getName(), e.getDescription(), e.getCost(), e.getSkill(), e.getSetEcho() != null ? e.getSetEcho().getId() : null, e.isActive(), e.getCreatedDate());
    }

    public void deleteById(Long id) {
        echoRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return echoRepository.existsById(id);
    }
}