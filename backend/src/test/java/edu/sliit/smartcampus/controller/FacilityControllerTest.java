package edu.sliit.smartcampus.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import edu.sliit.smartcampus.dto.AvailabilityDayDto;
import edu.sliit.smartcampus.dto.AvailabilitySlotDto;
import edu.sliit.smartcampus.dto.AvailabilityWindowDto;
import edu.sliit.smartcampus.dto.MaintenanceBlackoutDto;
import edu.sliit.smartcampus.dto.ResourceAvailabilityDto;
import edu.sliit.smartcampus.dto.ResourceDto;
import edu.sliit.smartcampus.dto.ResourceRequestDto;
import edu.sliit.smartcampus.service.FacilityService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FacilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FacilityService facilityService;

    @Test
    void listResources_returnsPublicCatalogue() throws Exception {
        when(facilityService.listResources(null, null, null, null, null)).thenReturn(List.of(resourceDto()));

        mockMvc.perform(get("/api/v1/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Computer Lab 3A"));
    }

    @Test
    void getAvailability_returnsResourceSchedule() throws Exception {
        when(facilityService.getAvailability(any(UUID.class), eq(LocalDate.of(2026, 4, 24)),
                eq(LocalDate.of(2026, 4, 25))))
                .thenReturn(new ResourceAvailabilityDto(
                        UUID.randomUUID(),
                        "Computer Lab 3A",
                        LocalDate.of(2026, 4, 24),
                        LocalDate.of(2026, 4, 25),
                        List.of(new AvailabilityDayDto(
                                LocalDate.of(2026, 4, 24),
                                List.of(new AvailabilitySlotDto(LocalTime.of(8, 0),
                                        LocalTime.of(9, 0), "AVAILABLE", null,
                                        null, null))))));

        mockMvc.perform(get("/api/v1/resources/{id}/availability", UUID.randomUUID())
                .param("from", "2026-04-24")
                .param("to", "2026-04-25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resourceName").value("Computer Lab 3A"))
                .andExpect(jsonPath("$.availability[0].slots[0].status").value("AVAILABLE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createResource_allowsAdmin() throws Exception {
        when(facilityService.createResource(any(ResourceRequestDto.class))).thenReturn(resourceDto());

        mockMvc.perform(post("/api/v1/resources")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                          "resourceCode": "LAB-3A",
                          "name": "Computer Lab 3A",
                          "type": "LAB",
                          "status": "ACTIVE",
                          "location": "IT Building - Floor 3",
                          "capacity": 40,
                          "description": "Advanced computer lab",
                          "thumbnailUrl": "https://example.com/lab.jpg",
                          "amenities": ["WiFi", "Projector"],
                          "specifications": {"network": "1Gbps"},
                          "availabilityWindows": [
                            {"dayOfWeek": 1, "startTime": "08:00", "endTime": "17:00"}
                          ]
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resourceCode").value("LAB-3A"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createMaintenanceBlackout_allowsAdmin() throws Exception {
        UUID resourceId = UUID.randomUUID();
        when(facilityService.createMaintenanceBlackout(eq(resourceId), any()))
                .thenReturn(new MaintenanceBlackoutDto(
                        UUID.randomUUID(),
                        OffsetDateTime.parse("2026-04-25T08:00:00Z"),
                        OffsetDateTime.parse("2026-04-25T12:00:00Z"),
                        "Electrical maintenance",
                        UUID.randomUUID(),
                        "Campus Admin",
                        OffsetDateTime.parse("2026-04-23T10:00:00Z")));

        mockMvc.perform(post("/api/v1/resources/{id}/maintenance-blackouts", resourceId)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {
                                "startDate": "2026-04-25T08:00:00Z",
                                "endDate": "2026-04-25T12:00:00Z",
                                "reason": "Electrical maintenance"
                        }
                        """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.reason").value("Electrical maintenance"));
    }

    private ResourceDto resourceDto() {
        return new ResourceDto(
                UUID.randomUUID(),
                "LAB-3A",
                "Computer Lab 3A",
                "LAB",
                "ACTIVE",
                "IT Building - Floor 3",
                40,
                "Advanced computer lab",
                "https://example.com/lab.jpg",
                List.of("WiFi", "Projector"),
                Map.of("network", "1Gbps"),
                List.of(new AvailabilityWindowDto(UUID.randomUUID(), 1, LocalTime.of(8, 0),
                        LocalTime.of(17, 0))),
                OffsetDateTime.now(),
                OffsetDateTime.now());
    }
}
