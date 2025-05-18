package com.jobhunthub.jobhunthub.dto;

import java.time.LocalDate;

import com.jobhunthub.jobhunthub.model.Job;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String status;
    private LocalDate createdAt;
    private Long userId;

    public static JobDTO fromEntity(Job job) {
        if (job == null) {
            return null;
        }
        String statusString = (job.getStatus() != null) ? job.getStatus().name() : null;
        Long userId = (job.getUser() != null) ? job.getUser().getId() : null;

        return new JobDTO(
                job.getId(),
                job.getTitle(),
                job.getCompany(),
                job.getLocation(),
                statusString,
                job.getCreatedAt(),
                userId
        );
    }
} 