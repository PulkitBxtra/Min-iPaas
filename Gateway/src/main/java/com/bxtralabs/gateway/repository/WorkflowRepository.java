package com.bxtralabs.gateway.repository;

import com.bxtralabs.gateway.model.Workflow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowRepository  extends MongoRepository<Workflow, String> {

}
