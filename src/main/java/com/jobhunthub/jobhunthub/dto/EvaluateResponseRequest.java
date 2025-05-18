package com.jobhunthub.jobhunthub.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluateResponseRequest {
    private String question;
    private String response;

    public boolean isValid() {
        return question != null && !question.trim().isEmpty()
                && response != null && !response.trim().isEmpty();
    }
}