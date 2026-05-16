package com.bxtralabs.connectorservice.config;

import com.bxtralabs.connectorservice.model.GrantType;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Map;
import java.util.Set;

/**
 * Generic, config-driven provider registry plus token-refresh tuning.
 * Bound from {@code connectors.*} in application.properties; per-provider
 * {@code client-secret} values live in the gitignored application-local.properties.
 */
@ConfigurationProperties(prefix = "connectors")
public record ConnectorProperties(
        /** Public base URL of this service, used to build the OAuth redirect_uri. */
        String callbackBaseUrl,
        Refresh refresh,
        Map<String, Provider> providers
) {

    public ConnectorProperties {
        if (callbackBaseUrl == null || callbackBaseUrl.isBlank()) {
            callbackBaseUrl = "http://localhost:8081";
        }
        if (refresh == null) {
            refresh = new Refresh(60_000L, 120L);
        }
        if (providers == null) {
            providers = Map.of();
        }
    }

    /** redirect_uri the provider must be configured to call back. */
    public String redirectUri() {
        return callbackBaseUrl + "/oauth/callback";
    }

    public Provider requireProvider(String key) {
        Provider p = providers.get(key);
        if (p == null) {
            throw new IllegalArgumentException("Unknown provider: " + key
                    + " (configured: " + providers.keySet() + ")");
        }
        return p;
    }

    public record Refresh(
            /** How often the background refresh sweep runs. */
            long sweepIntervalMs,
            /** Refresh a token this many seconds before it actually expires. */
            long skewSeconds
    ) {
        public Refresh {
            if (sweepIntervalMs <= 0) sweepIntervalMs = 60_000L;
            if (skewSeconds < 0) skewSeconds = 120L;
        }
    }

    public record Provider(
            String authorizationUri,
            String tokenUri,
            String clientId,
            String clientSecret,
            String scopes,
            Set<GrantType> supportedGrants
    ) {
        public Provider {
            if (supportedGrants == null || supportedGrants.isEmpty()) {
                supportedGrants = Set.of(GrantType.AUTHORIZATION_CODE, GrantType.CLIENT_CREDENTIALS);
            }
        }

        public boolean supports(GrantType grant) {
            return supportedGrants.contains(grant);
        }
    }
}
