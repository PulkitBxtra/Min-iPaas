package com.bxtralabs.appcatalogservice.controllers;

import com.bxtralabs.appcatalogservice.dto.AppSummary;
import com.bxtralabs.appcatalogservice.model.AppConnector;
import com.bxtralabs.appcatalogservice.model.CatalogOperation;
import com.bxtralabs.appcatalogservice.service.CatalogService;
import com.bxtralabs.appcatalogservice.service.CatalogService.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /** List connectors as summaries; optional ?search= or ?category= filter. */
    @GetMapping("/apps")
    public List<AppSummary> apps(@RequestParam(required = false) String search,
                                 @RequestParam(required = false) String category) {
        return catalogService.list(search, category).stream().map(AppSummary::of).toList();
    }

    /** Full connector detail including auth + all actions/triggers and their props. */
    @GetMapping("/apps/{key}")
    public AppConnector app(@PathVariable String key) {
        return catalogService.getByKey(key);
    }

    @GetMapping("/apps/{key}/actions/{name}")
    public CatalogOperation action(@PathVariable String key, @PathVariable String name) {
        return catalogService.getOperation(key, "action", name);
    }

    @GetMapping("/apps/{key}/triggers/{name}")
    public CatalogOperation trigger(@PathVariable String key, @PathVariable String name) {
        return catalogService.getOperation(key, "trigger", name);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return catalogService.categories();
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(NotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    }
}
