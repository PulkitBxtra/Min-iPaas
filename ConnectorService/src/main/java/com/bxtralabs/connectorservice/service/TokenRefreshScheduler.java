package com.bxtralabs.connectorservice.service;

import com.bxtralabs.connectorservice.config.ConnectorProperties;
import com.bxtralabs.connectorservice.model.Connection;
import com.bxtralabs.connectorservice.model.ConnectionStatus;
import com.bxtralabs.connectorservice.repository.ConnectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

/**
 * Periodically refreshes ACTIVE connections whose access token is within the
 * configured skew of expiry, so callers over gRPC never receive a stale token.
 */
@Component
public class TokenRefreshScheduler {

    private static final Logger log = LoggerFactory.getLogger(TokenRefreshScheduler.class);

    private final ConnectionRepository repository;
    private final ConnectionService connectionService;
    private final ConnectorProperties properties;

    public TokenRefreshScheduler(ConnectionRepository repository,
                                 ConnectionService connectionService,
                                 ConnectorProperties properties) {
        this.repository = repository;
        this.connectionService = connectionService;
        this.properties = properties;
    }

    @Scheduled(fixedDelayString = "${connectors.refresh.sweep-interval-ms}")
    public void refreshExpiringTokens() {
        Instant cutoff = Instant.now().plusSeconds(properties.refresh().skewSeconds());
        List<Connection> due = repository.findByStatusAndExpiresAtBefore(
                ConnectionStatus.ACTIVE, cutoff);
        if (due.isEmpty()) {
            return;
        }
        log.info("Refresh sweep: {} connection(s) near expiry", due.size());
        for (Connection conn : due) {
            try {
                connectionService.refresh(conn);
            } catch (RuntimeException e) {
                // refresh() already marks ERROR + logs; guard the loop regardless.
                log.warn("Unexpected error refreshing {}: {}", conn.getId(), e.getMessage());
            }
        }
    }
}
