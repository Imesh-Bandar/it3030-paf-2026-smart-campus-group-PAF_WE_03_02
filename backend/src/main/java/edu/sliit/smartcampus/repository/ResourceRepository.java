package edu.sliit.smartcampus.repository;

import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.Resource;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    Page<Resource> findByDeletedAtIsNull(Pageable pageable);

    Page<Resource> findByTypeAndDeletedAtIsNull(String type, Pageable pageable);

    Page<Resource> findByStatusAndDeletedAtIsNull(String status, Pageable pageable);

    Page<Resource> findByCapacityBetweenAndDeletedAtIsNull(int min, int max, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.deletedAt IS NULL AND (LOWER(r.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Resource> searchByKeyword(@Param("q") String keyword, Pageable pageable);

    long countByDeletedAtIsNull();
}
