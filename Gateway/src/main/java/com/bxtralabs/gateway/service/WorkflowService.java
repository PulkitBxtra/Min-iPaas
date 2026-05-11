package com.bxtralabs.gateway.service;


import com.bxtralabs.gateway.model.Workflow;
import com.bxtralabs.gateway.repository.WorkflowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkflowService {

    @Autowired
    private WorkflowRepository workflowRepository;

    public Workflow createWorkflow(Workflow workflow){
        return workflowRepository.save(workflow);

    }

}
