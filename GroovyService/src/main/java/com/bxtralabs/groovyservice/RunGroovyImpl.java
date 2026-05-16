package com.bxtralabs.groovyservice;

import com.google.protobuf.ListValue;
import com.google.protobuf.NullValue;
import com.google.protobuf.Struct;
import com.google.protobuf.Value;
import com.minipaas.groovy.Executable;
import com.minipaas.groovy.Output;
import com.minipaas.groovy.RunGroovyGrpc;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@GrpcService
public class RunGroovyImpl extends RunGroovyGrpc.RunGroovyImplBase {

    @Override
    public void run(Executable request, StreamObserver<Output> responseObserver) {
        ByteArrayOutputStream stdout = new ByteArrayOutputStream();
        ByteArrayOutputStream stderr = new ByteArrayOutputStream();
        Output.Builder out = Output.newBuilder();
        long start = System.currentTimeMillis();

        try {
            Binding binding = new Binding();
            request.getBindings().getFieldsMap()
                    .forEach((k, v) -> binding.setVariable(k, protoValueToJava(v)));
            binding.setProperty("out", new PrintStream(stdout));

            GroovyShell shell = new GroovyShell(binding);
            shell.evaluate(request.getInputCode());

            out.setSuccess(true);
        } catch (Exception e) {
            e.printStackTrace(new PrintStream(stderr));
            out.setSuccess(false).setErrorMessage(e.getMessage() == null ? e.toString() : e.getMessage());
        }

        out.setStdout(stdout.toString())
                .setStderr(stderr.toString())
                .setDurationMs(System.currentTimeMillis() - start);

        responseObserver.onNext(out.build());
        responseObserver.onCompleted();
    }

    private static Object protoValueToJava(Value v) {
        return switch (v.getKindCase()) {
            case NULL_VALUE -> null;
            case BOOL_VALUE -> v.getBoolValue();
            case STRING_VALUE -> v.getStringValue();
            case NUMBER_VALUE -> {
                double d = v.getNumberValue();
                // Surface whole numbers as Long so users don't have to .toInteger() everywhere.
                yield (d == Math.floor(d) && !Double.isInfinite(d) && d >= Long.MIN_VALUE && d <= Long.MAX_VALUE)
                        ? (Object) (long) d
                        : (Object) d;
            }
            case STRUCT_VALUE -> structToMap(v.getStructValue());
            case LIST_VALUE -> listToList(v.getListValue());
            case KIND_NOT_SET -> null;
        };
    }

    private static Map<String, Object> structToMap(Struct s) {
        Map<String, Object> m = new LinkedHashMap<>();
        s.getFieldsMap().forEach((k, v) -> m.put(k, protoValueToJava(v)));
        return m;
    }

    private static List<Object> listToList(ListValue lv) {
        List<Object> out = new ArrayList<>(lv.getValuesCount());
        for (Value v : lv.getValuesList()) out.add(protoValueToJava(v));
        return out;
    }
}
