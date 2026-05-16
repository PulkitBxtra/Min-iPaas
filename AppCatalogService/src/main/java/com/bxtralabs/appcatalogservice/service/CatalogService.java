package com.bxtralabs.appcatalogservice.service;

import com.bxtralabs.appcatalogservice.model.AppConnector;
import com.bxtralabs.appcatalogservice.model.CatalogOperation;
import com.bxtralabs.appcatalogservice.repository.AppConnectorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {

    private final AppConnectorRepository repository;

    public CatalogService(AppConnectorRepository repository) {
        this.repository = repository;
    }

    /** Filtered connector list. search → key/displayName contains; category → exact tag. */
    public List<AppConnector> list(String search, String category) {
        if (search != null && !search.isBlank()) {
            return repository
                    .findByKeyContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(search, search);
        }
        if (category != null && !category.isBlank()) {
            return repository.findByCategoriesContaining(category);
        }
        return repository.findAll();
    }

    public AppConnector getByKey(String key) {
        return repository.findByKey(key)
                .orElseThrow(() -> new NotFoundException("No connector with key: " + key));
    }

    /** A single action or trigger by name. {@code kind} is "trigger" for triggers, else actions. */
    public CatalogOperation getOperation(String appKey, String kind, String name) {
        AppConnector app = getByKey(appKey);
        List<CatalogOperation> ops = "trigger".equalsIgnoreCase(kind)
                ? app.getTriggers() : app.getActions();
        if (ops != null) {
            for (CatalogOperation op : ops) {
                if (name.equals(op.getName())) {
                    return op;
                }
            }
        }
        throw new NotFoundException(
                "No " + kind + " '" + name + "' on connector '" + appKey + "'");
    }

    public List<String> categories() {
        return repository.findAll().stream()
                .filter(c -> c.getCategories() != null)
                .flatMap(c -> c.getCategories().stream())
                .distinct()
                .sorted()
                .toList();
    }

    /** 404-style: connector or operation does not exist. */
    public static class NotFoundException extends RuntimeException {
        public NotFoundException(String message) {
            super(message);
        }
    }
}
