package com.bxtralabs.appcatalogservice.grpc;

import com.bxtralabs.appcatalogservice.model.AppConnector;
import com.bxtralabs.appcatalogservice.model.CatalogOperation;
import com.bxtralabs.appcatalogservice.service.CatalogService;
import com.bxtralabs.appcatalogservice.service.CatalogService.NotFoundException;
import com.google.protobuf.ListValue;
import com.google.protobuf.NullValue;
import com.google.protobuf.Struct;
import com.google.protobuf.Value;
import com.minipaas.catalog.App;
import com.minipaas.catalog.AppCatalogGrpc;
import com.minipaas.catalog.AppList;
import com.minipaas.catalog.AppSummary;
import com.minipaas.catalog.GetAppRequest;
import com.minipaas.catalog.GetOperationRequest;
import com.minipaas.catalog.ListAppsRequest;
import com.minipaas.catalog.Operation;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

import java.util.List;
import java.util.Map;

@GrpcService
public class AppCatalogGrpcService extends AppCatalogGrpc.AppCatalogImplBase {

    private final CatalogService catalogService;

    public AppCatalogGrpcService(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @Override
    public void listApps(ListAppsRequest request, StreamObserver<AppList> responseObserver) {
        List<AppConnector> connectors =
                catalogService.list(request.getSearch(), request.getCategory());
        AppList.Builder list = AppList.newBuilder();
        for (AppConnector c : connectors) {
            list.addApps(AppSummary.newBuilder()
                    .setKey(nz(c.getKey()))
                    .setDisplayName(nz(c.getDisplayName()))
                    .setDescription(nz(c.getDescription()))
                    .setLogoUrl(nz(c.getLogoUrl()))
                    .setAuthType(nz(c.authType()))
                    .setActionCount(c.getActions() == null ? 0 : c.getActions().size())
                    .setTriggerCount(c.getTriggers() == null ? 0 : c.getTriggers().size())
                    .addAllCategories(c.getCategories() == null ? List.of() : c.getCategories())
                    .build());
        }
        responseObserver.onNext(list.build());
        responseObserver.onCompleted();
    }

    @Override
    public void getApp(GetAppRequest request, StreamObserver<App> responseObserver) {
        try {
            responseObserver.onNext(toProto(catalogService.getByKey(request.getKey())));
            responseObserver.onCompleted();
        } catch (NotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getOperation(GetOperationRequest request,
                             StreamObserver<Operation> responseObserver) {
        try {
            CatalogOperation op = catalogService.getOperation(
                    request.getAppKey(), request.getKind(), request.getName());
            responseObserver.onNext(toProto(op));
            responseObserver.onCompleted();
        } catch (NotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage()).asRuntimeException());
        }
    }

    private App toProto(AppConnector c) {
        App.Builder b = App.newBuilder()
                .setKey(nz(c.getKey()))
                .setName(nz(c.getId()))
                .setDisplayName(nz(c.getDisplayName()))
                .setDescription(nz(c.getDescription()))
                .setVersion(nz(c.getVersion()))
                .setLogoUrl(nz(c.getLogoUrl()))
                .setPieceType(nz(c.getPieceType()))
                .addAllCategories(c.getCategories() == null ? List.of() : c.getCategories());
        if (c.getAuth() != null) {
            b.setAuth(mapToStruct(c.getAuth()));
        }
        if (c.getActions() != null) {
            c.getActions().forEach(o -> b.addActions(toProto(o)));
        }
        if (c.getTriggers() != null) {
            c.getTriggers().forEach(o -> b.addTriggers(toProto(o)));
        }
        return b.build();
    }

    private Operation toProto(CatalogOperation o) {
        Operation.Builder b = Operation.newBuilder()
                .setName(nz(o.getName()))
                .setDisplayName(nz(o.getDisplayName()))
                .setDescription(nz(o.getDescription()))
                .setRequireAuth(o.isRequireAuth());
        if (o.getProps() != null) {
            b.setProps(mapToStruct(o.getProps()));
        }
        return b.build();
    }

    // --- raw Mongo Document/Map → protobuf Struct (dependency-free) ---

    @SuppressWarnings("unchecked")
    private static Struct mapToStruct(Map<String, Object> map) {
        Struct.Builder s = Struct.newBuilder();
        map.forEach((k, v) -> s.putFields(k, toValue(v)));
        return s.build();
    }

    @SuppressWarnings("unchecked")
    private static Value toValue(Object v) {
        if (v == null) {
            return Value.newBuilder().setNullValue(NullValue.NULL_VALUE).build();
        }
        if (v instanceof String str) {
            return Value.newBuilder().setStringValue(str).build();
        }
        if (v instanceof Boolean bool) {
            return Value.newBuilder().setBoolValue(bool).build();
        }
        if (v instanceof Number num) {
            return Value.newBuilder().setNumberValue(num.doubleValue()).build();
        }
        if (v instanceof Map<?, ?> m) {
            return Value.newBuilder().setStructValue(mapToStruct((Map<String, Object>) m)).build();
        }
        if (v instanceof List<?> list) {
            ListValue.Builder lv = ListValue.newBuilder();
            for (Object item : list) {
                lv.addValues(toValue(item));
            }
            return Value.newBuilder().setListValue(lv).build();
        }
        // Fallback for any other BSON/scalar type.
        return Value.newBuilder().setStringValue(String.valueOf(v)).build();
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
