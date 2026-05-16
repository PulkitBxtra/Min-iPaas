package com.bxtralabs.appcatalogservice.service;

import com.bxtralabs.appcatalogservice.model.AppConnector;
import com.bxtralabs.appcatalogservice.model.CatalogOperation;
import com.bxtralabs.appcatalogservice.repository.AppConnectorRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

/**
 * Loads the vendored Activepieces snapshot into MongoDB on startup.
 * Runs when the collection is empty, or always when {@code catalog.reseed=true}.
 */
@Component
public class CatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(CatalogSeeder.class);
    private static final String SNAPSHOT = "catalog/activepieces-pieces.json";
    private static final String PIECE_PREFIX = "@activepieces/piece-";

    private final AppConnectorRepository repository;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${catalog.reseed:false}")
    private boolean reseed;

    public CatalogSeeder(AppConnectorRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        long existing = repository.count();
        if (existing > 0 && !reseed) {
            log.info("Catalog already seeded ({} connectors); skipping. Set catalog.reseed=true to reload.", existing);
            return;
        }
        ClassPathResource res = new ClassPathResource(SNAPSHOT);
        if (!res.exists()) {
            log.warn("Snapshot {} not found on classpath; catalog will be empty. Run scripts/fetch-snapshot.sh.", SNAPSHOT);
            return;
        }

        List<AppConnector> connectors = new ArrayList<>();
        try (InputStream in = res.getInputStream()) {
            JsonNode root = mapper.readTree(in);
            for (JsonNode piece : root) {
                connectors.add(toConnector(piece));
            }
        }
        if (reseed) {
            repository.deleteAll();
        }
        repository.saveAll(connectors);
        log.info("Seeded {} connectors from {}", connectors.size(), SNAPSHOT);
    }

    private AppConnector toConnector(JsonNode p) {
        AppConnector c = new AppConnector();
        String name = text(p, "name");
        c.setId(name);
        c.setKey(deriveKey(name));
        c.setDisplayName(text(p, "displayName"));
        c.setDescription(text(p, "description"));
        c.setVersion(text(p, "version"));
        c.setLogoUrl(text(p, "logoUrl"));
        c.setPieceType(text(p, "pieceType"));

        List<String> categories = new ArrayList<>();
        if (p.has("categories") && p.get("categories").isArray()) {
            p.get("categories").forEach(n -> categories.add(n.asText()));
        }
        c.setCategories(categories);
        c.setAuth(toDocument(p.get("auth")));
        c.setActions(toOperations(p.get("actions")));
        c.setTriggers(toOperations(p.get("triggers")));
        return c;
    }

    /**
     * Actions/triggers arrive either as a JSON object keyed by operation name
     * or as an array; handle both.
     */
    private List<CatalogOperation> toOperations(JsonNode node) {
        List<CatalogOperation> ops = new ArrayList<>();
        if (node == null || node.isNull()) {
            return ops;
        }
        if (node.isObject()) {
            node.fields().forEachRemaining(e -> ops.add(toOperation(e.getValue())));
        } else if (node.isArray()) {
            node.forEach(n -> ops.add(toOperation(n)));
        }
        return ops;
    }

    private CatalogOperation toOperation(JsonNode o) {
        CatalogOperation op = new CatalogOperation();
        op.setName(text(o, "name"));
        op.setDisplayName(text(o, "displayName"));
        op.setDescription(text(o, "description"));
        op.setRequireAuth(o.has("requireAuth") && o.get("requireAuth").asBoolean());
        op.setProps(toDocument(o.get("props")));
        op.setErrorHandlingOptions(toDocument(o.get("errorHandlingOptions")));
        return op;
    }

    private Document toDocument(JsonNode node) {
        if (node == null || node.isNull() || !node.isObject()) {
            return null;
        }
        return Document.parse(node.toString());
    }

    private static String deriveKey(String pieceName) {
        if (pieceName == null) {
            return null;
        }
        return pieceName.startsWith(PIECE_PREFIX)
                ? pieceName.substring(PIECE_PREFIX.length())
                : pieceName;
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return (v == null || v.isNull()) ? null : v.asText();
    }
}
