package edu.sliit.smartcampus.dto;

public record NotificationPreferenceDto(
        boolean bookingNotifications,
        boolean ticketNotifications,
        boolean securityNotifications,
        boolean reminderNotifications,
        boolean generalNotifications) {
}
