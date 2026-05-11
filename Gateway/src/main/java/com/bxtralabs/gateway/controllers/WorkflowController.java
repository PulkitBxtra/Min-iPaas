package com.bxtralabs.gateway.controllers;

import com.bxtralabs.gateway.model.Workflow;
import com.bxtralabs.gateway.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.PrintWriter;
import java.io.StringWriter;

@RestController
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    @PostMapping("/create/workflow")
    public ResponseEntity<?> createWorkflow(@RequestBody Workflow workflow) {
        try {
            return ResponseEntity.ok(workflowService.createWorkflow(workflow));
        } catch (Exception e) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            return ResponseEntity.status(500).body(sw.toString());
        }
    }
}
