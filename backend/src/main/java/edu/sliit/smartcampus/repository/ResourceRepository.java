package edu.sliit.smartcampus.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import edu.sliit.smartcampus.model.Resource;
import edu.sliit.smartcampus.model.ResourceStatus;
import edu.sliit.smartcampus.model.ResourceType;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByTypeAndDeletedAtIsNullOrderByNameAsc(ResourceType type);

    List<Resource> findByStatusAndDeletedAtIsNullOrderByNameAsc(ResourceStatus status);

    List<Resource> findByCapacityGreaterThanEqualAndDeletedAtIsNullOrderByNameAsc(Integer capacity);

    @Query("""
            SELECT r FROM Resource r
            WHERE r.deletedAt IS NULL
                    AND LOWER(r.location) LIKE LOWER(CONCAT('%', :query, '%'))
            ORDER BY r.name ASC
            """)
    List<Resource> searchByLocation(@Param("query") String query);

    boolean existsByNameIgnoreCaseAndDeletedAtIsNull(String name);

    boolean existsByNameIgnoreCaseAndIdNotAndDeletedAtIsNull(String name, UUID id);

    boolean existsByResourceCodeIgnoreCaseAndDeletedAtIsNull(String resourceCode);

    boolean existsByResourceCodeIgnoreCaseAndIdNotAndDeletedAtIsNull(String resourceCode, UUID id);

    @Query("""
            SELECT r FROM Resource r
            WHERE r.deletedAt IS NULL
              AND (:type IS NULL OR r.type = :type)
              AND (:status IS NULL OR r.status = :status)
              AND (:capacityMin IS NULL OR r.capacity >= :capacityMin)
              AND (:capacityMax IS NULL OR r.capacity <= :capacityMax)
                                         AND (LOWER(r.name) LIKE CONCAT('%', COALESCE(:query, ''), '%')
                                                 OR LOWER(r.resourceCode) LIKE CONCAT('%', COALESCE(:query, ''), '%')
                                                 OR LOWER(r.location) LIKE CONCAT('%', COALESCE(:query, ''), '%')
                                                 OR LOWER(COALESCE(r.description, '')) LIKE CONCAT('%', COALESCE(:query, ''), '%'))
            ORDER BY r.name ASC
            """)
    List<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("capacityMin") Integer capacityMin,
            @Param("capacityMax") Integer capacityMax,
            @Param("query") String query);

    @Query("SELECT r FROM Resource r WHERE r.id = :id AND r.deletedAt IS NULL")
    Optional<Resource> findActiveById(@Param("id") UUID id);
}
