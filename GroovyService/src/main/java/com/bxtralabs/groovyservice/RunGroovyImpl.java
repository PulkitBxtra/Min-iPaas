package com.bxtralabs.groovyservice;

import com.minipaas.groovy.Executable;
import com.minipaas.groovy.Output;
import com.minipaas.groovy.RunGroovyGrpc;
import com.sun.net.httpserver.Request;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;
import io.grpc.stub.StreamObserver;
import org.springframework.grpc.server.service.GrpcService;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

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
            request.getBindingsMap().forEach(binding::setVariable);
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
}
