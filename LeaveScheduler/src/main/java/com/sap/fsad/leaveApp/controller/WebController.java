package com.sap.fsad.leaveApp.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WebController {

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robots() {
        String robots = "User-agent: *\nDisallow: /api/\nDisallow: /admin/";
        return ResponseEntity.ok(robots);
    }

    @GetMapping(value = "/robots*.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> robotsVariants() {
        return robots();
    }

    @GetMapping("/favicon.ico")
    public ResponseEntity<Void> favicon() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sitemap.xml")
    public ResponseEntity<Void> sitemap() {
        return ResponseEntity.noContent().build();
    }
}