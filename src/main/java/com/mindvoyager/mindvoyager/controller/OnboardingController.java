package com.mindvoyager.mindvoyager.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    @GetMapping("/welcome")
    public String welcome() {
        return "Welcome to MindVoyager!";
    }

    @GetMapping("/goodbye")
    public String goodbye() {
        return "Goodbye from MindVoyager!";
    }
}
