package com.alice.gametracker.controller;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/background")
public class BackgroundController {

    @GetMapping
    public ResponseEntity<List<String>> getBackgroundFiles() {
        List<String> files = new ArrayList<>();
        File dir = new File("uploads/background");
        if (dir.exists() && dir.isDirectory()) {
            File[] fileList = dir.listFiles();
            if (fileList != null) {
                for (File file : fileList) {
                    if (file.isFile()) {
                        files.add(file.getName());
                    }
                }
            }
        }
        return ResponseEntity.ok(files);
    }
}