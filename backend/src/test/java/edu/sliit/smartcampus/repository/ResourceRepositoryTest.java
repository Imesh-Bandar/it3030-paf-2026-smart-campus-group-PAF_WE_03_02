package edu.sliit.smartcampus.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.ResourceStatus;
import edu.sliit.smartcampus.model.ResourceType;

@DataJpaTest
class ResourceRepositoryTest {

    @Autowired
    private ResourceRepository resourceRepository;

    private Resource equipment;

    @BeforeEach
    void setUp() {
        saveResource("LAB-01", "Computer Lab", ResourceType.LAB, ResourceStatus.ACTIVE, "IT Building", 40);
        saveResource("HALL-01", "Main Hall", ResourceType.LECTURE_HALL, ResourceStatus.UNDER_MAINTENANCE,
                "Admin Block", 200);
        equipment = saveResource("EQ-01", "Projector Kit", ResourceType.EQUIPMENT, ResourceStatus.OUT_OF_SERVICE,
                "Media Room", 5);
    }

    @Test
    void searchResources_filtersByType() {
        List<Resource> results = resourceRepository.searchResources(ResourceType.LAB, null, null, null, null);
        assertThat(results).extracting(Resource::getName).containsExactly("Computer Lab");
    }

    @Test
    void searchResources_filtersByStatus() {
        List<Resource> results = resourceRepository.searchResources(null, ResourceStatus.UNDER_MAINTENANCE, null, null,
                null);
        assertThat(results).extracting(Resource::getName).containsExactly("Main Hall");
    }

    @Test
    void searchResources_filtersByCapacityRange() {
        List<Resource> results = resourceRepository.searchResources(null, null, 30, 60, null);
        assertThat(results).extracting(Resource::getName).containsExactly("Computer Lab");
    }

    @Test
    void searchResources_matchesQueryAgainstLocationAndName() {
        List<Resource> results = resourceRepository.searchResources(null, null, null, null, "admin");
        assertThat(results).extracting(Resource::getName).containsExactly("Main Hall");
    }

    @Test
    void findByTypeAndDeletedAtIsNullOrderByNameAsc_returnsSortedMatches() {
        List<Resource> results = resourceRepository.findByTypeAndDeletedAtIsNullOrderByNameAsc(ResourceType.LAB);
        assertThat(results).extracting(Resource::getName).containsExactly("Computer Lab");
    }

    @Test
    void findByStatusAndDeletedAtIsNullOrderByNameAsc_returnsSortedMatches() {
        List<Resource> results = resourceRepository
                .findByStatusAndDeletedAtIsNullOrderByNameAsc(ResourceStatus.OUT_OF_SERVICE);
        assertThat(results).extracting(Resource::getName).containsExactly("Projector Kit");
    }

    @Test
    void findByCapacityGreaterThanEqualAndDeletedAtIsNullOrderByNameAsc_filtersCapacity() {
        List<Resource> results = resourceRepository.findByCapacityGreaterThanEqualAndDeletedAtIsNullOrderByNameAsc(40);
        assertThat(results).extracting(Resource::getName).containsExactly("Computer Lab", "Main Hall");
    }

    @Test
    void searchByLocation_matchesLocationCaseInsensitively() {
        List<Resource> results = resourceRepository.searchByLocation("BUILDING");
        assertThat(results).extracting(Resource::getName).containsExactly("Computer Lab");
    }

    @Test
    void findActiveById_excludesSoftDeletedResources() {
        equipment.setDeletedAt(OffsetDateTime.now());
        resourceRepository.save(equipment);
        assertThat(resourceRepository.findActiveById(equipment.getId())).isEmpty();
    }

    private Resource saveResource(
            String code,
            String name,
            ResourceType type,
            ResourceStatus status,
            String location,
            int capacity) {
        Resource resource = new Resource();
        resource.setResourceCode(code);
        resource.setName(name);
        resource.setType(type);
        resource.setStatus(status);
        resource.setLocation(location);
        resource.setCapacity(capacity);
        return resourceRepository.save(resource);
    }
}
