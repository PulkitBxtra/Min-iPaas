package com.bxtralabs.appcatalogservice.model;

import org.bson.Document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

/**
 * A connector (app) sourced from Activepieces. {@link #id} is the full piece
 * name (e.g. {@code @activepieces/piece-slack}); {@link #key} is the short slug
 * (e.g. {@code slack}) used in API paths.
 */
@org.springframework.data.mongodb.core.mapping.Document("app_connectors")
public class AppConnector {

    @Id
    private String id;

    @Indexed(unique = true)
    private String key;

    private String displayName;
    private String description;
    private String version;
    private String logoUrl;
    private String pieceType;
    private List<String> categories;

    /** Raw Activepieces auth schema (type/props vary by connector). */
    @Field("auth")
    private Document auth;

    private List<CatalogOperation> actions;
    private List<CatalogOperation> triggers;

    public AppConnector() {
    }

    /** Auth mechanism label for summaries; "NONE" when the connector needs no auth. */
    public String authType() {
        return auth != null && auth.get("type") != null
                ? String.valueOf(auth.get("type"))
                : "NONE";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getPieceType() {
        return pieceType;
    }

    public void setPieceType(String pieceType) {
        this.pieceType = pieceType;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }

    public Document getAuth() {
        return auth;
    }

    public void setAuth(Document auth) {
        this.auth = auth;
    }

    public List<CatalogOperation> getActions() {
        return actions;
    }

    public void setActions(List<CatalogOperation> actions) {
        this.actions = actions;
    }

    public List<CatalogOperation> getTriggers() {
        return triggers;
    }

    public void setTriggers(List<CatalogOperation> triggers) {
        this.triggers = triggers;
    }
}
