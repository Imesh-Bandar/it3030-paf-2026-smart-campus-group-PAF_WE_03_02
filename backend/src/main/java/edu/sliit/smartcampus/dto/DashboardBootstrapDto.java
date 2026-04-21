package edu.sliit.smartcampus.dto;

public record DashboardBootstrapDto(
        UserDto user,
        String dashboardPath,
        long unreadNotifications) {
}
