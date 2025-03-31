package com.mindvoyager.mindvoyager.dto;

// DTO for evaluating user responses to interview questions
public class EvaluateResponseRequest {
    private String question;
    private String response;

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    // Basic validation - checks if both fields are non-empty
    public boolean isValid() {
        return question != null && !question.trim().isEmpty() 
            && response != null && !response.trim().isEmpty();
    }
}