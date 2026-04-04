package edu.sliit.smartcampus.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import edu.sliit.smartcampus.dto.ResourceDto;
import edu.sliit.smartcampus.exception.ResourceNotFoundException;
import edu.sliit.smartcampus.repository.ResourceRepository;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceRepository resourceRepository;

    public ResourceController(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @GetMapping
    public ResponseEntity<List<ResourceDto>> listResources() {
        return ResponseEntity.ok(resourceRepository.findAll()
                .stream()
                .map(resource -> new ResourceDto(resource.getId(), resource.getName()))
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDto> getResource(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceRepository.findById(id)
                .map(resource -> new ResourceDto(resource.getId(), resource.getName()))
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found")));
    }
}