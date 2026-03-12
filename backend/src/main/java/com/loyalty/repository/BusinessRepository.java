package com.loyalty.repository;

import com.loyalty.entity.Business;
import com.loyalty.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BusinessRepository extends JpaRepository<Business, Long> {
    Optional<Business> findByOwner(User owner);
}
