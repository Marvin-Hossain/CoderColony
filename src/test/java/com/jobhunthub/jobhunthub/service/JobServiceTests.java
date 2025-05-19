package com.jobhunthub.jobhunthub.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

import org.assertj.core.api.Assertions;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;


import com.jobhunthub.jobhunthub.dto.CreateJobRequestDTO;

import com.jobhunthub.jobhunthub.dto.JobDTO;
import com.jobhunthub.jobhunthub.dto.UpdateJobRequestDTO;

import com.jobhunthub.jobhunthub.exception.GlobalExceptionHandler;
import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.JobRepository;

public class JobServiceTests {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private User user;
    private Job jobEntity;
    private Job jobEntity2;
    private Job jobEntity3;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder()
                .id(1L)
                .provider("github")
                .providerId("123")
                .username("testuser")
                .email("test@test.com")
                .build();

        jobEntity = Job.builder()
                .id(1L)
                .title("Software Engineer")
                .company("Microsoft")
                .location("Remote")
                .status(Job.Status.APPLIED)
                .user(user)
                .createdAt(LocalDate.parse("2025-03-21"))
                .build();

        jobEntity2 = Job.builder()
                .id(2L)
                .title("Software Developer")
                .company("Amazon")
                .location("Sunnyvale, CA")
                .status(Job.Status.APPLIED)
                .user(user)
                .createdAt(LocalDate.parse("2025-03-21"))
                .build();

        jobEntity3 = Job.builder()
                .id(3L)
                .title("Data Scientist")
                .company("Google")
                .location("Seattle, WA")
                .status(Job.Status.APPLIED)
                .user(user)
                .createdAt(LocalDate.parse("2025-03-18"))
                .build();

        // Set the zoneId in the JobService
        jobService = new JobService(jobRepository, ZoneId.systemDefault());
    }

    @Test
    public void JobService_createJob_returnsJobDTO() {
        CreateJobRequestDTO createDto = new CreateJobRequestDTO(
                jobEntity.getTitle(),
                jobEntity.getCompany(),
                jobEntity.getLocation()
        );

        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> {
            Job jobToSave = invocation.getArgument(0);
            jobToSave.setId(jobEntity.getId());
            jobToSave.setCreatedAt(LocalDate.now(ZoneId.systemDefault()));
            jobToSave.setUser(user);
            jobToSave.setStatus(Job.Status.APPLIED);
            return jobToSave;
        });

        JobDTO createdJobDTO = jobService.createJob(createDto, user);

        verify(jobRepository, times(1)).save(any(Job.class));
        Assertions.assertThat(createdJobDTO).isNotNull();
        Assertions.assertThat(createdJobDTO.getTitle()).isEqualTo(createDto.getTitle());
        Assertions.assertThat(createdJobDTO.getCompany()).isEqualTo(createDto.getCompany());
        Assertions.assertThat(createdJobDTO.getLocation()).isEqualTo(createDto.getLocation());
        Assertions.assertThat(createdJobDTO.getStatus()).isEqualTo(Job.Status.APPLIED.name());
        Assertions.assertThat(createdJobDTO.getUserId()).isEqualTo(user.getId());
        Assertions.assertThat(createdJobDTO.getId()).isEqualTo(jobEntity.getId());
        Assertions.assertThat(createdJobDTO.getCreatedAt()).isEqualTo(LocalDate.now(ZoneId.systemDefault()));
    }

    @Test
    public void JobService_getJobById_returnsJobDTO() {
        when(jobRepository.findById(jobEntity.getId())).thenReturn(Optional.of(jobEntity));

        JobDTO foundJobDTO = jobService.getJobById(jobEntity.getId(), user);

        verify(jobRepository, times(1)).findById(jobEntity.getId());
        Assertions.assertThat(foundJobDTO).isNotNull();
        Assertions.assertThat(foundJobDTO.getId()).isEqualTo(jobEntity.getId());
        Assertions.assertThat(foundJobDTO.getTitle()).isEqualTo(jobEntity.getTitle());
        Assertions.assertThat(foundJobDTO.getUserId()).isEqualTo(user.getId());
    }

    @Test
    public void JobService_getJobById_whenNotOwner_throwsException() {
        User anotherUser = User.builder().id(2L).username("another").build();
        Job jobBelongingToOriginalUser = Job.builder()
            .id(1L)
            .title("Test Job")
            .company("Test Co")
            .location("Test Location")
            .user(user)
            .status(Job.Status.APPLIED)
            .createdAt(LocalDate.now())
            .build();

        when(jobRepository.findById(jobBelongingToOriginalUser.getId())).thenReturn(Optional.of(jobBelongingToOriginalUser));

        assertThrows(GlobalExceptionHandler.ResourceNotFoundException.class, () -> jobService.getJobById(jobBelongingToOriginalUser.getId(), anotherUser));
        verify(jobRepository, times(1)).findById(jobBelongingToOriginalUser.getId());
    }

    @Test
    public void JobService_updateJob_withStatusChange_returnsJobDTOWithNewStatus() {
        UpdateJobRequestDTO updateDto = new UpdateJobRequestDTO(
                "Software Engineer II",
                jobEntity.getCompany(),
                "New Location, ST",
                Job.Status.INTERVIEWED.name()
        );
        when(jobRepository.findById(jobEntity.getId())).thenReturn(Optional.of(jobEntity));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        JobDTO updatedJobDTO = jobService.updateJob(jobEntity.getId(), updateDto, user);

        Assertions.assertThat(updatedJobDTO).isNotNull();
        Assertions.assertThat(updatedJobDTO.getTitle()).isEqualTo("Software Engineer II");
        Assertions.assertThat(updatedJobDTO.getStatus()).isEqualTo(Job.Status.INTERVIEWED.name());
    }

    @Test
    public void JobService_updateJob_withoutStatusChange_preservesExistingStatus() {
        UpdateJobRequestDTO updateDto = new UpdateJobRequestDTO(
                "Software Engineer III",
                "New Company",
                jobEntity.getLocation(),
                null
        );
        Job existingJob = Job.builder()
            .id(jobEntity.getId())
            .title(jobEntity.getTitle())
            .company(jobEntity.getCompany())
            .location(jobEntity.getLocation())
            .status(Job.Status.APPLIED)
            .user(user)
            .createdAt(jobEntity.getCreatedAt())
            .build();

        when(jobRepository.findById(jobEntity.getId())).thenReturn(Optional.of(existingJob));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        JobDTO updatedJobDTO = jobService.updateJob(jobEntity.getId(), updateDto, user);

        Assertions.assertThat(updatedJobDTO).isNotNull();
        Assertions.assertThat(updatedJobDTO.getTitle()).isEqualTo("Software Engineer III");
        Assertions.assertThat(updatedJobDTO.getCompany()).isEqualTo("New Company");
        Assertions.assertThat(updatedJobDTO.getStatus()).isEqualTo(Job.Status.APPLIED.name());
    }
    
    @Test
    public void JobService_updateJob_withEmptyStatusString_preservesExistingStatus() {
        UpdateJobRequestDTO updateDto = new UpdateJobRequestDTO(
                "Software Engineer IV",
                jobEntity.getCompany(),
                jobEntity.getLocation(),
                "   "
        );
         Job existingJob = Job.builder()
            .id(jobEntity.getId())
            .title(jobEntity.getTitle())
            .company(jobEntity.getCompany())
            .location(jobEntity.getLocation())
            .status(Job.Status.INTERVIEWED)
            .user(user)
            .createdAt(jobEntity.getCreatedAt())
            .build();

        when(jobRepository.findById(jobEntity.getId())).thenReturn(Optional.of(existingJob));
        when(jobRepository.save(any(Job.class))).thenAnswer(invocation -> invocation.getArgument(0));

        JobDTO updatedJobDTO = jobService.updateJob(jobEntity.getId(), updateDto, user);
        Assertions.assertThat(updatedJobDTO.getStatus()).isEqualTo(Job.Status.INTERVIEWED.name());
    }

    @Test
    public void JobService_deleteJob_callsRepositoryDelete() {
        when(jobRepository.findById(jobEntity.getId())).thenReturn(Optional.of(jobEntity));
        doNothing().when(jobRepository).delete(any(Job.class));

        jobService.deleteJob(jobEntity.getId(), user);

        verify(jobRepository, times(1)).findById(jobEntity.getId());
        verify(jobRepository, times(1)).delete(jobEntity);
    }

    @Test
    public void JobService_getJobsByUser_returnsJobDTOList() {
        List<Job> jobList = Arrays.asList(jobEntity, jobEntity2, jobEntity3);
        when(jobRepository.findByUser(user)).thenReturn(jobList);

        List<JobDTO> resultDTOs = jobService.getJobsByUser(user);

        verify(jobRepository, times(1)).findByUser(user);
        Assertions.assertThat(resultDTOs).hasSize(3);
        Assertions.assertThat(resultDTOs.get(0).getId()).isEqualTo(jobEntity.getId());
        Assertions.assertThat(resultDTOs.get(1).getId()).isEqualTo(jobEntity2.getId());
        Assertions.assertThat(resultDTOs.get(0).getTitle()).isEqualTo(jobEntity.getTitle());
    }

    @Test
    public void JobService_getJobCountByUser_returnsCount() {
        // Arrange
        when(jobRepository.countByUser(user)).thenReturn(3L);

        // Act
        long count = jobService.getJobCountByUser(user);

        // Assert
        Assertions.assertThat(count).isEqualTo(3L);
    }

    @Test
    public void JobService_getWeeklyJobStats_returnsStatsMap() {
        // Arrange
        LocalDate startDate = LocalDate.now(ZoneId.systemDefault()).minusDays(7);
        LocalDate endDate = LocalDate.now(ZoneId.systemDefault());
        when(jobRepository.countByUser(user)).thenReturn(3L);

        // Act
        Map<String, Object> stats = jobService.getWeeklyJobStats(user, startDate, endDate);

        // Assert
        Assertions.assertThat(stats).containsKey("total");
        Assertions.assertThat(stats.get("total")).isEqualTo(3L);
    }

    @Test
    public void JobService_getAllTimeJobStats_returnsStatsMap() {
        // Arrange
        when(jobRepository.countByUser(user)).thenReturn(10L);
        when(jobRepository.countDistinctDates(user)).thenReturn(5L);
        when(jobRepository.findBestDayCount(user)).thenReturn(3);

        // Act
        Map<String, Object> stats = jobService.getAllTimeJobStats(user);

        // Assert
        Assertions.assertThat(stats).containsKey("total");
        Assertions.assertThat(stats.get("total")).isEqualTo(10L);
    }
}