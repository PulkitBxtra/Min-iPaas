package com.bxtralabs.connectorservice.controllers;

import com.bxtralabs.connectorservice.dto.ConnectionStatusResponse;
import com.bxtralabs.connectorservice.dto.RegisterConnectionRequest;
import com.bxtralabs.connectorservice.dto.RegisterConnectionResponse;
import com.bxtralabs.connectorservice.model.Connection;
import com.bxtralabs.connectorservice.service.ConnectionService;
import com.bxtralabs.connectorservice.service.ConnectionService.ConnectionNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    /** Register a connection. Client-credentials returns ACTIVE; auth-code returns an authorizationUrl. */
    @PostMapping("/connections")
    public ResponseEntity<RegisterConnectionResponse> register(
            @RequestBody RegisterConnectionRequest request) {
        return ResponseEntity.ok(connectionService.register(request));
    }

    /** Provider OAuth redirect target for the authorization-code flow. */
    @GetMapping("/oauth/callback")
    public ResponseEntity<?> callback(@RequestParam(required = false) String code,
                                      @RequestParam(required = false) String state,
                                      @RequestParam(required = false) String error) {
        if (error != null) {
            return ResponseEntity.badRequest().body(Map.of("error", error));
        }
        if (code == null || state == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "missing code or state"));
        }
        Connection conn = connectionService.completeAuthorizationCode(code, state);
        return ResponseEntity.ok(ConnectionStatusResponse.of(conn));
    }

    @GetMapping("/connections/{id}")
    public ResponseEntity<ConnectionStatusResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ConnectionStatusResponse.of(connectionService.get(id)));
    }

    @DeleteMapping("/connections/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        connectionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ConnectionNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(ConnectionNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> conflict(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", e.getMessage()));
    }
}
