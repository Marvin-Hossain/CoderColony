package com.jobhunthub.jobhunthub.dto;

import java.time.LocalDate;

import com.jobhunthub.jobhunthub.model.Question;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private String type;
    private String question;
    private LocalDate updatedAt;
    private String responseText;
    private Integer rating;
    private String feedback;
    private Long userId;

    public static QuestionDTO fromEntity(Question question) {
        if (question == null) {
            return null;
        }
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setType(question.getType() != null ? question.getType().name() : null);
        dto.setQuestion(question.getQuestion());
        dto.setUpdatedAt(question.getUpdatedAt());
        dto.setResponseText(question.getResponseText());
        dto.setRating(question.getRating());
        dto.setFeedback(question.getFeedback());

        if (question.getUser() != null) {
            dto.setUserId(question.getUser().getId());
        }
        return dto;
    }
}