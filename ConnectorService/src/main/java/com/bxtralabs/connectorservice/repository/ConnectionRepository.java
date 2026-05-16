package com.bxtralabs.connectorservice.repository;

import com.bxtralabs.connectorservice.model.Connection;
import com.bxtralabs.connectorservice.model.ConnectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, UUID> {

    Optional<Connection> findByOauthState(String oauthState);

    /** Active connections whose token expires before the given cutoff (now + skew). */
    List<Connection> findByStatusAndExpiresAtBefore(ConnectionStatus status, Instant cutoff);
}
