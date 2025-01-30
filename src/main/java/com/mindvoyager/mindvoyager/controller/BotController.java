// BotController.java
package com.mindvoyager.mindvoyager.controller;

import com.mindvoyager.mindvoyager.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/bot")
@CrossOrigin(origins = "http://localhost:3000") // Adjust as needed
public class BotController {

    @Autowired
    private OpenAIService openAIService;

    @PostMapping
    public Map<String, String> chatWithBot(@RequestBody Map<String, String> request) {
        String userInput = request.get("input");
        String botResponse = openAIService.getResponse(userInput);

        return Map.of("response", botResponse.trim());
    }
}
