package com.jobhunthub.jobhunthub.controller; // Adjust package if needed

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {

    @GetMapping("/")
    public ResponseEntity<String> healthCheck() {
        // This endpoint simply returns "OK" with a 200 status code.
        // It's designed to be fast and require no authentication.
        return ResponseEntity.ok("OK");
    }
}
