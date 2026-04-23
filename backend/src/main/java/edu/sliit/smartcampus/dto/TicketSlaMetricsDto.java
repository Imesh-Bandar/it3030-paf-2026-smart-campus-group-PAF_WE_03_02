package edu.sliit.smartcampus.dto;

import java.util.Map;

public record TicketSlaMetricsDto(
        long openTickets,
        long inProgressTickets,
        long resolvedTickets,
        long slaBreachedTickets,
        double averageFirstResponseMinutes,
        double averageResolutionMinutes,
        Map<String, Long> priorityMix) {
}
