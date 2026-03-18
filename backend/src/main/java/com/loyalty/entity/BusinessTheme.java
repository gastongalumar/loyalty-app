package com.loyalty.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "business_themes")
public class BusinessTheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "business_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"loyaltyCards", "owner", "stamps", "rewards"})
    private Business business;

    @Column(length = 10)
    private String stampEmoji = "☕";

    @Column(length = 20)
    private String mode = "light";

    @Column(length = 10)
    private String primaryColor = "#FF6B35";

    @Column(length = 10)
    private String secondaryColor = "#1A1A2E";

    @Column(length = 10)
    private String accentColor = "#FFD166";

    @Column(length = 50)
    private String fontFamily = "Syne";

    @Column(length = 100)
    private String appName = "LoyaltyCard";

    @Column(length = 500)
    private String logoUrl = "";

    private Integer logoSize = 32;
    private Integer nameSize = 18;

    @Column(length = 10)
    private String navbarTextColor = "#FFFFFF";

    @Column(length = 500)
    private String backgroundUrl = "";

    @Column(length = 10)
    private String backgroundSize = "cover";

    private Boolean backgroundBlur = false;
    private Integer cardOpacity = 85;

    @Column(length = 10)
    private String bodyTextColor = "#111118";

    @Column(length = 10)
    private String headingTextColor = "#111118";

    @Column
    private Integer bodyFontSize = 16;

    @Column
    private Integer loginLogoSize = 80;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters y Setters
    public String getStampEmoji() { return stampEmoji; }
    public void setStampEmoji(String stampEmoji) { this.stampEmoji = stampEmoji; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }

    public String getSecondaryColor() { return secondaryColor; }
    public void setSecondaryColor(String secondaryColor) { this.secondaryColor = secondaryColor; }

    public String getAccentColor() { return accentColor; }
    public void setAccentColor(String accentColor) { this.accentColor = accentColor; }

    public String getFontFamily() { return fontFamily; }
    public void setFontFamily(String fontFamily) { this.fontFamily = fontFamily; }

    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public Integer getLogoSize() { return logoSize; }
    public void setLogoSize(Integer logoSize) { this.logoSize = logoSize; }

    public Integer getNameSize() { return nameSize; }
    public void setNameSize(Integer nameSize) { this.nameSize = nameSize; }

    public String getNavbarTextColor() { return navbarTextColor; }
    public void setNavbarTextColor(String navbarTextColor) { this.navbarTextColor = navbarTextColor; }

    public String getBackgroundUrl() { return backgroundUrl; }
    public void setBackgroundUrl(String backgroundUrl) { this.backgroundUrl = backgroundUrl; }

    public String getBackgroundSize() { return backgroundSize; }
    public void setBackgroundSize(String backgroundSize) { this.backgroundSize = backgroundSize; }

    public Boolean getBackgroundBlur() { return backgroundBlur; }
    public void setBackgroundBlur(Boolean backgroundBlur) { this.backgroundBlur = backgroundBlur; }

    public Integer getCardOpacity() { return cardOpacity; }
    public void setCardOpacity(Integer cardOpacity) { this.cardOpacity = cardOpacity; }

    public String getBodyTextColor() { return bodyTextColor; }
    public void setBodyTextColor(String bodyTextColor) { this.bodyTextColor = bodyTextColor; }

    public String getHeadingTextColor() { return headingTextColor; }
    public void setHeadingTextColor(String headingTextColor) { this.headingTextColor = headingTextColor; }

    public Integer getBodyFontSize() { return bodyFontSize; }
    public void setBodyFontSize(Integer bodyFontSize) { this.bodyFontSize = bodyFontSize; }

    public Integer getLoginLogoSize() { return loginLogoSize; }
    public void setLoginLogoSize(Integer loginLogoSize) { this.loginLogoSize = loginLogoSize; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
