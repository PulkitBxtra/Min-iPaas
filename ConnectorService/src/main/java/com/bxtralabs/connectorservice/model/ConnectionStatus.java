package com.bxtralabs.connectorservice.model;

public enum ConnectionStatus {
    /** Authorization-code connection awaiting the user to complete consent. */
    PENDING,
    /** Holds a usable (auto-refreshed) access token. */
    ACTIVE,
    /** Token exchange or refresh failed; needs re-registration. */
    ERROR
}
