package com.bxtralabs.connectorservice.dto;

import com.bxtralabs.connectorservice.model.Connection;

import java.time.Instant;
import java.util.UUID;

/** Non-secret view of a connection (never exposes tokens over REST). */
public record ConnectionStatusResponse(
        UUID connectionId,
        String provider,
        String grantType,
        String status,
        String scopes,
        Instant expiresAt,
        String lastError
) {
    public static ConnectionStatusResponse of(Connection c) {
        return new ConnectionStatusResponse(
                c.getId(),
                c.getProvider(),
                c.getGrantType().name(),
                c.getStatus().name(),
                c.getScopes(),
                c.getExpiresAt(),
                c.getLastError()
        );
    }
}
