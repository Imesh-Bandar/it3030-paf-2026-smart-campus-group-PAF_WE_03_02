package edu.sliit.smartcampus.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserStatusRequest(@NotBlank(message = "Status is required") String status) {
}