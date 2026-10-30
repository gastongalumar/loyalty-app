package com.loyalty.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80, unique = true)
    private String slug;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String logoUrl;

    @Column(length = 500)
    private String backgroundUrl;

    private Integer backgroundVisibility;

    private Integer backgroundBlur;

    @Column(length = 7)
    private String colorPrimary;

    @Column(length = 7)
    private String colorSecondary;

    @Column(length = 16)
    private String stampIcon;

    @Column(length = 16)
    private String rewardIcon;

    @Column(nullable = false)
    private Integer stampsRequired;

    @Column(nullable = false)
    private String rewardDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private Status status = Status.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = Status.ACTIVE;
        }
    }

    public enum Status {
        ACTIVE, SUSPENDED, DELETED
    }
}
