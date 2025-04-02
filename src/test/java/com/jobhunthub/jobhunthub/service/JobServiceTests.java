package com.jobhunthub.jobhunthub.service;
import com.jobhunthub.jobhunthub.model.Job;
import com.jobhunthub.jobhunthub.model.User;
import com.jobhunthub.jobhunthub.repository.JobRepository;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.jdbc.EmbeddedDatabaseConnection;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.Mockito.*;

@DataJpaTest
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
public class JobServiceTests {

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private JobService jobService;

    private User user;
    private Job job;
    private Job job2;
    private Job job3;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        user = User.builder()
                .id(1L)
                .githubId("123")
                .username("testuser")
                .email("test@test.com")
                .build();

        

        job = Job.builder()
                .id(1L)
                .title("Software Engineer")
                .company("Microsoft")
                .location("Remote")
                .status(Job.Status.APPLIED)
                .user(user)
                .createdAt(LocalDate.parse("2025-03-21"))
                .build();

        job2 = Job.builder()
                .title("Software Developer")
                .company("Amazon")
                .location("Sunnyvale, CA")
                .status(Job.Status.APPLIED)
                .user(user)
                .createdAt(LocalDate.parse("2025-03-21"))
                .build();

        job3 = Job.builder()
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
    public void JobService_createJob_returnsJob() {

        // Mock the behavior of the jobRepository
        when(jobRepository.save(any(Job.class))).thenReturn(job);

        // Act
        Job createdJob = jobService.createJob(job, user);

        // Assert
        verify(jobRepository, times(1)).save(job);  // Verify that save was called once
        Assertions.assertThat(createdJob.getTitle()).isEqualTo("Software Engineer");
        Assertions.assertThat(createdJob.getCompany()).isEqualTo("Microsoft");
        Assertions.assertThat(createdJob.getLocation()).isEqualTo("Remote");
        Assertions.assertThat(createdJob.getStatus()).isEqualTo(Job.Status.APPLIED);
        Assertions.assertThat(createdJob.getUser()).isEqualTo(user);
    }

    @Test
    public void JobService_getJobById_returnsJob() {
        // Arrange
        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));

        // Act
        Job users_job = jobService.getJobById(job.getId(), user);

        // Assert
        verify(jobRepository, times(1)).findById(job.getId()); // Verify that findById was called with the correct ID
        Assertions.assertThat(users_job).isNotNull(); // Ensure the job is not null
        Assertions.assertThat(users_job.getUser()).isEqualTo(user); // Check that the job belongs to the correct user
    }

    @Test
    public void JobService_updateJob_returnsJob() {
        // Arrange
        when(jobRepository.save(any(Job.class))).thenReturn(job);
        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job)); // Mock findById to return the job

        job.setTitle("Software Engineer II"); // Change the title for the update

        // Act
        Job updatedJob = jobService.updateJob(job.getId(), job, user);

        // Assert
        verify(jobRepository, times(1)).save(job);
        Assertions.assertThat(updatedJob.getTitle()).isEqualTo("Software Engineer II");
        Assertions.assertThat(updatedJob.getCompany()).isEqualTo("Microsoft");
        Assertions.assertThat(updatedJob.getLocation()).isEqualTo("Remote");
        Assertions.assertThat(updatedJob.getStatus()).isEqualTo(Job.Status.APPLIED);
        Assertions.assertThat(updatedJob.getUser()).isEqualTo(user);
    }

    @Test
    public void JobService_deleteJob_removesJob() {
        // Arrange
        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));

        // Act
        jobService.deleteJob(job.getId(), user);

        // Assert
        verify(jobRepository, times(1)).delete(job); // Verify that delete was called
        verify(jobRepository, times(1)).findById(job.getId()); // Verify that findById was called
        when(jobRepository.findById(job.getId())).thenReturn(Optional.empty()); // Mock to return empty after deletion
        Assertions.assertThat(jobRepository.findById(job.getId())).isEmpty(); // Ensure job is no longer retrievable
    }

    @Test
    public void JobService_getJobsByUser_returnsJobList() {
        // Arrange
        List<Job> jobList = Arrays.asList(job, job2, job3);
        when(jobRepository.findByUser(user)).thenReturn(jobList);

        // Act
        List<Job> result = jobService.getJobsByUser(user);

        // Assert
        verify(jobRepository, times(1)).findByUser(user);
        Assertions.assertThat(result).hasSize(3);
    }

    @Test
    public void JobService_updateJobStatus_returnsUpdatedJob() {
        // Arrange
        when(jobRepository.findById(job.getId())).thenReturn(Optional.of(job));
        when(jobRepository.save(any(Job.class))).thenReturn(job);

        // Act
        Job updatedJob = jobService.updateJobStatus(job.getId(), Job.Status.INTERVIEWED, user);

        // Assert
        Assertions.assertThat(updatedJob.getStatus()).isEqualTo(Job.Status.INTERVIEWED);
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