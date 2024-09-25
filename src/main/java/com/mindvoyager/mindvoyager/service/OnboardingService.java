package com.mindvoyager.mindvoyager.service;

import org.springframework.stereotype.Service;

@Service
public class OnboardingService {
    public String getWelcomeMessage() {
        return "Welcome to MindVoyager!";
    }
}
