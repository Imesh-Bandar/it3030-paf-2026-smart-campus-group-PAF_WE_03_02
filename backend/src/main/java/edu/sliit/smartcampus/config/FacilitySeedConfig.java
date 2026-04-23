package edu.sliit.smartcampus.config;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import edu.sliit.smartcampus.model.AvailabilityWindow;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.ResourceStatus;
import edu.sliit.smartcampus.model.ResourceType;
import edu.sliit.smartcampus.repository.AvailabilityWindowRepository;
import edu.sliit.smartcampus.repository.ResourceRepository;

@Configuration
public class FacilitySeedConfig {

    @Bean
    CommandLineRunner seedFacilities(
            ResourceRepository resourceRepository,
            AvailabilityWindowRepository availabilityWindowRepository) {
        return args -> {
            if (resourceRepository.count() > 0) {
                return;
            }

            Resource lab = new Resource();
            lab.setResourceCode("LAB-3A");
            lab.setName("Computer Lab 3A");
            lab.setType(ResourceType.LAB);
            lab.setStatus(ResourceStatus.ACTIVE);
            lab.setLocation("IT Building - Floor 3");
            lab.setCapacity(40);
            lab.setDescription("Advanced computer lab with projector, smart board, and 40 workstations.");
            lab.setThumbnailUrl("https://images.unsplash.com/photo-1498050108023-c5249f4df085");
            lab.setAmenities(new ArrayList<>(List.of("WiFi", "Projector", "Air Conditioning", "Whiteboard")));
            Resource saved = resourceRepository.save(lab);

            List<AvailabilityWindow> windows = new ArrayList<>();
            for (int day = 1; day <= 5; day++) {
                AvailabilityWindow window = new AvailabilityWindow();
                window.setResource(saved);
                window.setDayOfWeek(day);
                window.setStartTime(LocalTime.of(8, 0));
                window.setEndTime(LocalTime.of(17, 0));
                windows.add(window);
            }
            availabilityWindowRepository.saveAll(windows);
        };
    }
}
