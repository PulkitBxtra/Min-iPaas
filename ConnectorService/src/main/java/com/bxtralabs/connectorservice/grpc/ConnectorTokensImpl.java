package com.bxtralabs.connectorservice.grpc;

import com.bxtralabs.connectorservice.model.Connection;
import com.bxtralabs.connectorservice.service.ConnectionService;
import com.bxtralabs.connectorservice.service.ConnectionService.ConnectionNotFoundException;
import com.bxtralabs.connectorservice.service.ConnectionService.ConnectionNotReadyException;
import com.minipaas.connector.AccessToken;
import com.minipaas.connector.ConnectorTokensGrpc;
import com.minipaas.connector.GetAccessTokenRequest;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

import java.util.UUID;

@GrpcService
public class ConnectorTokensImpl extends ConnectorTokensGrpc.ConnectorTokensImplBase {

    private final ConnectionService connectionService;

    public ConnectorTokensImpl(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @Override
    public void getAccessToken(GetAccessTokenRequest request,
                               StreamObserver<AccessToken> responseObserver) {
        UUID id;
        try {
            id = UUID.fromString(request.getConnectionId());
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("connection_id is not a valid UUID")
                    .asRuntimeException());
            return;
        }

        try {
            Connection conn = connectionService.getValidConnection(id);
            responseObserver.onNext(AccessToken.newBuilder()
                    .setAccessToken(conn.getAccessToken())
                    .setTokenType(conn.getTokenType() == null ? "Bearer" : conn.getTokenType())
                    .setExpiresAtEpochMs(conn.getExpiresAt() == null ? 0L : conn.getExpiresAt().toEpochMilli())
                    .setStatus(conn.getStatus().name())
                    .build());
            responseObserver.onCompleted();
        } catch (ConnectionNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage()).asRuntimeException());
        } catch (ConnectionNotReadyException e) {
            responseObserver.onError(Status.FAILED_PRECONDITION
                    .withDescription(e.getMessage()).asRuntimeException());
        } catch (RuntimeException e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage()).asRuntimeException());
        }
    }
}
