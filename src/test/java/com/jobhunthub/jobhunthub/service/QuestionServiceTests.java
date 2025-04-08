package com.jobhunthub.jobhunthub.service;

import com.jobhunthub.jobhunthub.model.Question;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.model.Question.QuestionType;
import com.jobhunthub.jobhunthub.repository.QuestionRepository;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.InvalidRequestException;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.ResourceNotFoundException;
import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler.AuthenticationException;
import com.jobhunthub.jobhunthub.service.OpenAIService;
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

public class QuestionServiceTests {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private OpenAIService openAIService;

    private ZoneId zoneId;

    @InjectMocks
    private QuestionService questionService;

    private User user;
    private Question question;
    private Question question2;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        zoneId = ZoneId.systemDefault();
        
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

//        question2 = Question.builder()
//                .id(1L)
//                .type(QuestionType.TECHNICAL)
//                .question("What is the difference between a stack and a queue?")
//                .updatedAt(LocalDate.now())
//                .responseText("The difference is...")
//                .rating(7)
//                .feedback("Good answer.")
//                .user(user)
//                .build();
    }

    @Test
    public void QuestionService_getRandomQuestion_returnsQuestion() {
        // Arrange
        when(questionRepository.findRandomQuestionForUserAndType(user.getId(), QuestionType.TECHNICAL.toString()))
                .thenReturn(question);

        // Act
        Question randomQuestion = questionService.getRandomQuestion(user, QuestionType.TECHNICAL);

        // Assert
        Assertions.assertThat(randomQuestion).isNotNull();
        Assertions.assertThat(randomQuestion.getQuestion()).isEqualTo("What is 2x4?");
    }

    @Test
    public void QuestionService_addQuestion_returnsSavedQuestion() {
        // Arrange
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        // Act
        Question savedQuestion = questionService.addQuestion(question, user, QuestionType.TECHNICAL);

        // Assert
        Assertions.assertThat(savedQuestion).isNotNull();
        Assertions.assertThat(savedQuestion.getQuestion()).isEqualTo("What is 2x4?");
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
    public void QuestionService_getQuestionsByUser_returnsQuestions() {
        // Arrange
        when(questionRepository.findByUserAndType(user, QuestionType.TECHNICAL)).thenReturn(List.of(question));

        // Act
        List<Question> questions = questionService.getQuestionsByUser(user, QuestionType.TECHNICAL);

        // Assert
        Assertions.assertThat(questions).isNotEmpty();
        Assertions.assertThat(questions).contains(question);
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
            .thenReturn(question);  // Simulate finding a duplicate

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
        Assertions.assertThat(result.getRating()).isEqualTo(8);
        Assertions.assertThat(result.getFeedback()).isEqualTo("Great answer!");
        Assertions.assertThat(result.getUpdatedAt()).isNotNull(); // Should be set because rating > 5
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
        Assertions.assertThat(result.getRating()).isEqualTo(4);
        Assertions.assertThat(result.getFeedback()).isEqualTo("Incorrect answer");
        Assertions.assertThat(result.getUpdatedAt()).isNull(); // Should be null because rating <= 5
    }
}
