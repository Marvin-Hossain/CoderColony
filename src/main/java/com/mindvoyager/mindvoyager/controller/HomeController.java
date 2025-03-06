package com.mindvoyager.mindvoyager.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public RedirectView home() {
        return new RedirectView("http://localhost:3000");
    }

    @GetMapping("/secured")
    public String secured() {
        return "Hello Secured!";
    }

    @GetMapping("/api/public/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello, World!");
    }

}
