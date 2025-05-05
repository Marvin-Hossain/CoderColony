package com.jobhunthub.jobhunthub.dto;

import com.jobhunthub.jobhunthub.model.Question; // Assuming Question lives here
import lombok.Data; // Use Lombok for boilerplate reduction
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
// Add other necessary imports

@Data // Generates getters, setters, toString, equals, hashCode
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDTO {
    private Long id;
    private String type; // Using String representation of the enum
    private String question;
    private LocalDate updatedAt;
    private String responseText;
    private Integer rating;
    private String feedback;
    // Decide if the frontend needs the user's ID or username for this list view
    private Long userId;
    // private String username; // Optional: uncomment if needed

    // Static factory method to convert from Entity to DTO
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

        // Safely access user data *before* potential session close
        if (question.getUser() != null) {
            dto.setUserId(question.getUser().getId());
            // dto.setUsername(question.getUser().getUsername()); // Uncomment if needed
        }
        return dto;
    }
}