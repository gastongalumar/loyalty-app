package com.loyalty.service;

import com.loyalty.dto.publicapi.TenantPublicResponse;
import com.loyalty.entity.Business;
import com.loyalty.exception.NotFoundException;
import com.loyalty.repository.BusinessRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PublicTenantService {

    private static final String DEFAULT_PRIMARY = "#FF6B35";
    private static final String DEFAULT_BACKGROUND = "#1A1A2E";

    private final BusinessRepository businessRepository;

    public PublicTenantService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    @Transactional(readOnly = true)
    public TenantPublicResponse getBySlug(String slug) {
        Business business = requireActiveOrSuspended(slug);

        return TenantPublicResponse.builder()
                .slug(business.getSlug())
                .name(business.getName())
                .status(business.getStatus().name())
                .colorPrimary(business.getColorPrimary())
                .colorSecondary(business.getColorSecondary())
                .logoUrl(business.getLogoUrl())
                .backgroundUrl(business.getBackgroundUrl())
                .stampIcon(business.getStampIcon())
                .rewardIcon(business.getRewardIcon())
                .build();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getManifest(String slug) {
        Business business = requireActiveOrSuspended(slug);

        String primary = business.getColorPrimary() != null ? business.getColorPrimary() : DEFAULT_PRIMARY;
        String background = business.getColorSecondary() != null ? business.getColorSecondary() : DEFAULT_BACKGROUND;

        Map<String, Object> manifest = new LinkedHashMap<>();
        manifest.put("name", business.getName() + " · Loyalty Card");
        manifest.put("short_name", shortName(business.getName()));
        manifest.put("description", business.getRewardDescription());
        manifest.put("start_url", "/" + business.getSlug() + "/login");
        manifest.put("scope", "/" + business.getSlug() + "/");
        manifest.put("display", "standalone");
        manifest.put("orientation", "portrait");
        manifest.put("background_color", background);
        manifest.put("theme_color", primary);
        manifest.put("lang", "es");
        manifest.put("icons", List.of(
                Map.of(
                        "src", "/assets/icons/icon-192.png",
                        "sizes", "192x192",
                        "type", "image/png",
                        "purpose", "any"
                ),
                Map.of(
                        "src", "/assets/icons/icon-512.png",
                        "sizes", "512x512",
                        "type", "image/png",
                        "purpose", "any"
                ),
                Map.of(
                        "src", "/assets/icons/icon-maskable-512.png",
                        "sizes", "512x512",
                        "type", "image/png",
                        "purpose", "maskable"
                ),
                Map.of(
                        "src", "/assets/icons/icon.svg",
                        "sizes", "any",
                        "type", "image/svg+xml",
                        "purpose", "any"
                )
        ));
        return manifest;
    }

    private Business requireActiveOrSuspended(String slug) {
        return businessRepository.findBySlug(slug.toLowerCase())
                .filter(b -> b.getStatus() != Business.Status.DELETED)
                .orElseThrow(() -> new NotFoundException("Unknown business"));
    }

    private String shortName(String name) {
        return name.length() <= 12 ? name : name.substring(0, 12).trim();
    }
}
