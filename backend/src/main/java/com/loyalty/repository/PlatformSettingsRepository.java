package com.loyalty.repository;

import com.loyalty.entity.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, Long> {
}
