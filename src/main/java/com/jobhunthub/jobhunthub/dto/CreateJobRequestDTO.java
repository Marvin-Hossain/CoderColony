package com.jobhunthub.jobhunthub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobRequestDTO {
    private String title;
    private String company;
    private String location;
    // Status is intentionally omitted as it's defaulted to APPLIED in the service.
    // User and createdAt are handled by the server.
} 