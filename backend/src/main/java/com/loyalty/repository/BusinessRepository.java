package com.loyalty.repository;

import com.loyalty.entity.Business;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BusinessRepository extends JpaRepository<Business, Long> {

    Optional<Business> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<Business> findByStatus(Business.Status status, Pageable pageable);

    @Query("""
            SELECT b FROM Business b
            WHERE (:status IS NULL OR b.status = :status)
              AND (:query IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%'))
                                  OR LOWER(b.slug) LIKE LOWER(CONCAT('%', :query, '%')))
            """)
    Page<Business> search(@Param("status") Business.Status status,
                          @Param("query") String query,
                          Pageable pageable);
}
