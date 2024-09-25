package com.jobhunthub.jobhunthub.service;

import com.jobhunthub.jobhunthub.dto.QuestionDTO;
import com.jobhunthub.jobhunthub.model.Question;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.model.Question.QuestionType;
import com.jobhunthub.jobhunthub.repository.QuestionRepository;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.InvalidRequestException;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.AuthenticationException;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.assertThat;

public class QuestionServiceTests {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private OpenAIService openAIService;

    @InjectMocks
    private QuestionService questionService;

    private User user;
    private Question question;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        ZoneId zoneId = ZoneId.systemDefault();

        questionService = new QuestionService(questionRepository, openAIService, zoneId);

        user = User.builder()
                .id(1L)
                .githubId("123")
                .username("testuser")
                .email("test@test.com")
                .avatarUrl("https://github.com/testuser.png")
                .build();

        question = Question.builder()
                .id(1L)
                .type(QuestionType.TECHNICAL)
                .question("What is 2x4?")
                .updatedAt(LocalDate.parse("2025-03-21"))
                .responseText("The answer is 8")
                .rating(6)
                .feedback("Good answer.")
                .user(user)
                .build();
    }

    @Test
    public void QuestionService_getRandomQuestion_returnsQuestion() {
        // Arrange
        when(questionRepository.findRandomQuestionForUserAndType(user.getId(), QuestionType.TECHNICAL.toString()))
                .thenReturn(question);

        // Act
        Question randomQuestion = questionService.getRandomQuestion(user, QuestionType.TECHNICAL);

        // Assert
        assertThat(randomQuestion).isNotNull();
        assertThat(randomQuestion.getQuestion()).isEqualTo("What is 2x4?");
    }

    @Test
    public void QuestionService_addQuestion_returnsSavedQuestion() {
        // Arrange
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        // Act
        Question savedQuestion = questionService.addQuestion(question, user, QuestionType.TECHNICAL);

        // Assert
        assertThat(savedQuestion).isNotNull();
        assertThat(savedQuestion.getQuestion()).isEqualTo("What is 2x4?");
    }

    @Test
    public void QuestionService_deleteQuestion_removesQuestion() {
        // Arrange
        Long questionId = 1L;
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        // Act
        questionService.deleteQuestion(questionId, user, QuestionType.TECHNICAL);

        // Assert
        verify(questionRepository, times(1)).findById(questionId);
        verify(questionRepository, times(1)).delete(question);
    }

    @Test
    public void QuestionService_deleteQuestion_throwsResourceNotFoundExceptionWhenQuestionNotFound() {
        // Arrange
        Long questionId = 1L;
        when(questionRepository.findById(questionId)).thenReturn(Optional.empty());

        // Act & Assert
        Assertions.assertThatThrownBy(() ->
                        questionService.deleteQuestion(questionId, user, QuestionType.TECHNICAL)
                ).isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Question")
                .hasMessageContaining(String.valueOf(questionId));
    }

    @Test
    public void QuestionService_getQuestionsByUser_returnsQuestionDTOs() {
        // Arrange
        when(questionRepository.findByUserAndType(user, QuestionType.TECHNICAL)).thenReturn(List.of(question));

        // Act
        List<QuestionDTO> resultDTOs = questionService.getQuestionsByUser(user, QuestionType.TECHNICAL);

        // Assert
        assertThat(resultDTOs).isNotNull();
        assertThat(resultDTOs).hasSize(1);

        QuestionDTO resultDTO = resultDTOs.get(0);

        assertThat(resultDTO.getId()).isEqualTo(question.getId());
        assertThat(resultDTO.getQuestion()).isEqualTo(question.getQuestion());
        assertThat(resultDTO.getType()).isEqualTo(question.getType().name());
        assertThat(resultDTO.getUserId()).isEqualTo(user.getId());
        assertThat(resultDTO.getUpdatedAt()).isEqualTo(question.getUpdatedAt());
        assertThat(resultDTO.getResponseText()).isEqualTo(question.getResponseText());
        assertThat(resultDTO.getRating()).isEqualTo(question.getRating());
        assertThat(resultDTO.getFeedback()).isEqualTo(question.getFeedback());
    }

    @Test
    public void QuestionService_deleteQuestion_throwsAuthenticationException_whenWrongUser() {
        // Arrange
        Long questionId = 1L;
        User wrongUser = User.builder()
                .id(2L)
                .username("wronguser")
                .build();
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        // Act & Assert
        Assertions.assertThatThrownBy(() ->
                        questionService.deleteQuestion(questionId, wrongUser, QuestionType.TECHNICAL)
                ).isInstanceOf(AuthenticationException.class)
                .hasMessageContaining("Not authorized to access this question");
    }

    @Test
    public void QuestionService_deleteQuestion_throwsInvalidRequestException_whenWrongType() {
        // Arrange
        Long questionId = 1L;
        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));

        // Act & Assert
        Assertions.assertThatThrownBy(() ->
                        questionService.deleteQuestion(questionId, user, QuestionType.BEHAVIORAL)
                ).isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Question type does not match");
    }

    @Test
    public void QuestionService_addQuestion_throwsInvalidRequestException_whenQuestionEmpty() {
        // Arrange
        Question emptyQuestion = Question.builder()
                .question("")
                .build();

        // Act & Assert
        Assertions.assertThatThrownBy(() ->
                        questionService.addQuestion(emptyQuestion, user, QuestionType.TECHNICAL)
                ).isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Question text cannot be empty");
    }

    @Test
    public void QuestionService_addQuestion_throwsInvalidRequestException_whenQuestionNull() {
        // Arrange
        Question nullQuestion = Question.builder().build();

        // Act & Assert
        Assertions.assertThatThrownBy(() ->
                        questionService.addQuestion(nullQuestion, user, QuestionType.TECHNICAL)
                ).isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("Question text cannot be empty");
    }

    @Test
    public void QuestionService_addQuestion_throwsInvalidRequestException_whenDuplicateQuestion() {
        // Arrange
        when(questionRepository.findByQuestionAndUserAndType(
                question.getQuestion(), user, QuestionType.TECHNICAL))
                .thenReturn(question);

        // Act & Assert
        Assertions.assertThatThrownBy(() ->
                        questionService.addQuestion(question, user, QuestionType.TECHNICAL)
                ).isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("This question already exists for your account");
    }

    @Test
    public void QuestionService_evaluateResponse_updatesQuestionWithHighRating() {
        // Arrange
        String questionText = "What is 2x4?";
        String response = "The answer is 8";
        String jsonResponse = """
                {
                    "rating": 8,
                    "feedback": "Great answer!"
                }
                """;

        when(questionRepository.findByQuestionAndUserAndType(questionText, user, QuestionType.TECHNICAL))
                .thenReturn(question);
        when(openAIService.getResponse(anyString(), anyString())).thenReturn(jsonResponse);
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        // Act
        Question result = questionService.evaluateResponse(questionText, response, user, QuestionType.TECHNICAL);

        // Assert
        assertThat(result.getRating()).isEqualTo(8);
        assertThat(result.getFeedback()).isEqualTo("Great answer!");
        assertThat(result.getUpdatedAt()).isNotNull();
    }

    @Test
    public void QuestionService_evaluateResponse_updatesQuestionWithLowRating() {
        // Arrange
        String questionText = "What is 2x4?";
        String response = "The answer is 7";
        String jsonResponse = """
                {
                    "rating": 4,
                    "feedback": "Incorrect answer"
                }
                """;

        when(questionRepository.findByQuestionAndUserAndType(questionText, user, QuestionType.TECHNICAL))
                .thenReturn(question);
        when(openAIService.getResponse(anyString(), anyString())).thenReturn(jsonResponse);
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        // Act
        Question result = questionService.evaluateResponse(questionText, response, user, QuestionType.TECHNICAL);

        // Assert
        assertThat(result.getRating()).isEqualTo(4);
        assertThat(result.getFeedback()).isEqualTo("Incorrect answer");
        assertThat(result.getUpdatedAt()).isNull();
    }

    @Test
    public void QuestionService_resetQuestionDate_resetsUpdatedDate() {
        // Arrange
        String questionText = "What is 2x4?";
        when(questionRepository.findByQuestionAndUserAndType(questionText, user, QuestionType.TECHNICAL))
                .thenReturn(question);
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        // Act
        questionService.resetQuestionDate(questionText, user, QuestionType.TECHNICAL);

        // Assert
        verify(questionRepository).findByQuestionAndUserAndType(questionText, user, QuestionType.TECHNICAL);
        verify(questionRepository).save(question);
        assertThat(question.getUpdatedAt()).isNull();
    }
}
