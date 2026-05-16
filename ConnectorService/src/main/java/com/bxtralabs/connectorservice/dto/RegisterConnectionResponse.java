package com.bxtralabs.connectorservice.dto;

import com.bxtralabs.connectorservice.model.ConnectionStatus;

import java.util.UUID;

/**
 * Result of registering a connection.
 * For client-credentials: {@code status=ACTIVE}, {@code authorizationUrl=null}.
 * For authorization-code: {@code status=PENDING}, caller must redirect the user
 * to {@code authorizationUrl} to complete consent.
 */
public record RegisterConnectionResponse(
        UUID connectionId,
        ConnectionStatus status,
        String authorizationUrl
) {}
