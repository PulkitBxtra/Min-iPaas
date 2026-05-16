package com.bxtralabs.connectorservice.dto;

import com.bxtralabs.connectorservice.model.GrantType;

/**
 * Body of POST /connections. {@code scopes} is optional and overrides the
 * provider's default scopes when present.
 */
public record RegisterConnectionRequest(
        String provider,
        GrantType grantType,
        String scopes
) {}
