package com.bxtralabs.connectorservice.service;

import com.bxtralabs.connectorservice.config.ConnectorProperties;
import com.bxtralabs.connectorservice.config.ConnectorProperties.Provider;
import com.bxtralabs.connectorservice.dto.RegisterConnectionRequest;
import com.bxtralabs.connectorservice.dto.RegisterConnectionResponse;
import com.bxtralabs.connectorservice.model.Connection;
import com.bxtralabs.connectorservice.model.ConnectionStatus;
import com.bxtralabs.connectorservice.model.GrantType;
import com.bxtralabs.connectorservice.repository.ConnectionRepository;
import com.bxtralabs.connectorservice.service.OAuthTokenClient.TokenResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
public class ConnectionService {

    private static final Logger log = LoggerFactory.getLogger(ConnectionService.class);

    private final ConnectionRepository repository;
    private final OAuthTokenClient tokenClient;
    private final ConnectorProperties properties;
    private final SecureRandom random = new SecureRandom();

    public ConnectionService(ConnectionRepository repository,
                             OAuthTokenClient tokenClient,
                             ConnectorProperties properties) {
        this.repository = repository;
        this.tokenClient = tokenClient;
        this.properties = properties;
    }

    /** Registers a connection. See {@link RegisterConnectionResponse} for the two outcomes. */
    @Transactional
    public RegisterConnectionResponse register(RegisterConnectionRequest req) {
        if (req.provider() == null || req.grantType() == null) {
            throw new IllegalArgumentException("provider and grantType are required");
        }
        Provider provider = properties.requireProvider(req.provider());
        if (!provider.supports(req.grantType())) {
            throw new IllegalArgumentException("Provider " + req.provider()
                    + " does not support " + req.grantType()
                    + " (supported: " + provider.supportedGrants() + ")");
        }

        Connection conn = new Connection();
        conn.setId(UUID.randomUUID());
        conn.setProvider(req.provider());
        conn.setGrantType(req.grantType());
        conn.setScopes(req.scopes() != null ? req.scopes() : provider.scopes());

        if (req.grantType() == GrantType.CLIENT_CREDENTIALS) {
            TokenResponse token = tokenClient.clientCredentials(provider, conn.getScopes());
            applyToken(conn, token);
            conn.setStatus(ConnectionStatus.ACTIVE);
            repository.save(conn);
            return new RegisterConnectionResponse(conn.getId(), ConnectionStatus.ACTIVE, null);
        }

        // AUTHORIZATION_CODE: park as PENDING and hand back the consent URL.
        String state = newState();
        conn.setOauthState(state);
        conn.setStatus(ConnectionStatus.PENDING);
        repository.save(conn);

        String authUrl = UriComponentsBuilder.fromUriString(provider.authorizationUri())
                .queryParam("response_type", "code")
                .queryParam("client_id", provider.clientId())
                .queryParam("redirect_uri", properties.redirectUri())
                .queryParam("scope", conn.getScopes() == null ? "" : conn.getScopes())
                .queryParam("state", state)
                .build()
                .toUriString();

        return new RegisterConnectionResponse(conn.getId(), ConnectionStatus.PENDING, authUrl);
    }

    /** OAuth redirect handler: completes an authorization-code connection. */
    @Transactional
    public Connection completeAuthorizationCode(String code, String state) {
        Connection conn = repository.findByOauthState(state)
                .orElseThrow(() -> new IllegalArgumentException("Unknown or expired state"));
        Provider provider = properties.requireProvider(conn.getProvider());
        try {
            TokenResponse token = tokenClient.exchangeAuthorizationCode(
                    provider, code, properties.redirectUri());
            applyToken(conn, token);
            conn.setStatus(ConnectionStatus.ACTIVE);
            conn.setOauthState(null);
            conn.setLastError(null);
        } catch (RuntimeException e) {
            conn.setStatus(ConnectionStatus.ERROR);
            conn.setLastError(e.getMessage());
            repository.save(conn);
            throw e;
        }
        return repository.save(conn);
    }

    /**
     * Returns a guaranteed-valid connection: refreshes synchronously if the
     * token is missing/expired/near expiry. Throws if the connection is not
     * usable.
     */
    @Transactional
    public Connection getValidConnection(UUID connectionId) {
        Connection conn = repository.findById(connectionId)
                .orElseThrow(() -> new ConnectionNotFoundException(connectionId));
        if (conn.getStatus() == ConnectionStatus.PENDING) {
            throw new ConnectionNotReadyException(connectionId, "authorization not completed");
        }
        if (needsRefresh(conn)) {
            refresh(conn);
        }
        if (conn.getStatus() != ConnectionStatus.ACTIVE || conn.getAccessToken() == null) {
            throw new ConnectionNotReadyException(connectionId,
                    conn.getLastError() != null ? conn.getLastError() : "connection not active");
        }
        return conn;
    }

    /** True when the token is absent or within the configured skew of expiry. */
    public boolean needsRefresh(Connection conn) {
        if (conn.getAccessToken() == null) return true;
        if (conn.getExpiresAt() == null) return false; // no TTL → treat as long-lived
        Instant cutoff = Instant.now().plusSeconds(properties.refresh().skewSeconds());
        return conn.getExpiresAt().isBefore(cutoff);
    }

    /** Refreshes one connection in place; marks ERROR on failure. */
    @Transactional
    public void refresh(Connection conn) {
        Provider provider = properties.requireProvider(conn.getProvider());
        try {
            TokenResponse token = switch (conn.getGrantType()) {
                case CLIENT_CREDENTIALS -> tokenClient.clientCredentials(provider, conn.getScopes());
                case AUTHORIZATION_CODE -> {
                    if (conn.getRefreshToken() == null) {
                        throw new IllegalStateException("No refresh token; re-authorization required");
                    }
                    yield tokenClient.refreshAuthorizationCode(provider, conn.getRefreshToken());
                }
            };
            applyToken(conn, token);
            conn.setStatus(ConnectionStatus.ACTIVE);
            conn.setLastError(null);
            log.info("Refreshed connection {} ({})", conn.getId(), conn.getProvider());
        } catch (RuntimeException e) {
            conn.setStatus(ConnectionStatus.ERROR);
            conn.setLastError(e.getMessage());
            log.warn("Refresh failed for connection {}: {}", conn.getId(), e.getMessage());
        }
        repository.save(conn);
    }

    public Connection get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new ConnectionNotFoundException(id));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ConnectionNotFoundException(id);
        }
        repository.deleteById(id);
    }

    private static void applyToken(Connection conn, TokenResponse token) {
        conn.setAccessToken(token.accessToken());
        if (token.refreshToken() != null) {
            conn.setRefreshToken(token.refreshToken());
        }
        conn.setTokenType(token.tokenType());
        if (token.scope() != null) {
            conn.setScopes(token.scope());
        }
        conn.setExpiresAt(token.expiresAt());
    }

    private String newState() {
        byte[] buf = new byte[32];
        random.nextBytes(buf);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
    }

    /** 404-style: no such connectionId. */
    public static class ConnectionNotFoundException extends RuntimeException {
        public ConnectionNotFoundException(UUID id) {
            super("No connection: " + id);
        }
    }

    /** 409-style: exists but not usable (pending consent or errored). */
    public static class ConnectionNotReadyException extends RuntimeException {
        public ConnectionNotReadyException(UUID id, String why) {
            super("Connection " + id + " not ready: " + why);
        }
    }
}
