package com.jobhunthub.jobhunthub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateJobRequestDTO {
    private String title;
    private String company;
    private String location;
    private String status;
} 