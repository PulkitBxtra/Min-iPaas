package com.bxtralabs.appcatalogservice.dto;

import com.bxtralabs.appcatalogservice.model.AppConnector;

import java.util.List;

/** Lightweight connector view for list endpoints (no action/trigger detail). */
public record AppSummary(
        String key,
        String displayName,
        String description,
        String logoUrl,
        String authType,
        int actionCount,
        int triggerCount,
        List<String> categories
) {
    public static AppSummary of(AppConnector c) {
        return new AppSummary(
                c.getKey(),
                c.getDisplayName(),
                c.getDescription(),
                c.getLogoUrl(),
                c.authType(),
                c.getActions() == null ? 0 : c.getActions().size(),
                c.getTriggers() == null ? 0 : c.getTriggers().size(),
                c.getCategories()
        );
    }
}
