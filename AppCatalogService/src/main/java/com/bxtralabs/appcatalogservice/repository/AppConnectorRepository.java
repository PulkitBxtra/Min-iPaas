package com.bxtralabs.appcatalogservice.repository;

import com.bxtralabs.appcatalogservice.model.AppConnector;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppConnectorRepository extends MongoRepository<AppConnector, String> {

    Optional<AppConnector> findByKey(String key);

    List<AppConnector> findByCategoriesContaining(String category);

    // Case-insensitive search on key OR displayName.
    List<AppConnector> findByKeyContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(
            String key, String displayName);
}
