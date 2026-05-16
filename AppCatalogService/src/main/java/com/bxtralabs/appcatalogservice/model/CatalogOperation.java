package com.bxtralabs.appcatalogservice.model;

import org.bson.Document;

/**
 * An action or trigger on a connector. {@code props} (and the connector's auth)
 * are kept as a raw {@link Document} — Activepieces' prop schema is rich and
 * varying, so we pass it through verbatim rather than model every prop type.
 */
public class CatalogOperation {

    private String name;
    private String displayName;
    private String description;
    private boolean requireAuth;
    private Document props;
    private Document errorHandlingOptions;

    public CatalogOperation() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public boolean isRequireAuth() {
        return requireAuth;
    }

    public void setRequireAuth(boolean requireAuth) {
        this.requireAuth = requireAuth;
    }

    public Document getProps() {
        return props;
    }

    public void setProps(Document props) {
        this.props = props;
    }

    public Document getErrorHandlingOptions() {
        return errorHandlingOptions;
    }

    public void setErrorHandlingOptions(Document errorHandlingOptions) {
        this.errorHandlingOptions = errorHandlingOptions;
    }
}
