package com.loyalty.repository;

import com.loyalty.entity.Business;
import com.loyalty.entity.BusinessTheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BusinessThemeRepository extends JpaRepository<BusinessTheme, Long> {
    Optional<BusinessTheme> findByBusiness(Business business);
}
