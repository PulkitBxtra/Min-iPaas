package com.bxtralabs.gateway.model;

import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document
public class Workflow {
    @MongoId
    private String id;
    private int version;
    private String ownerId;
    private String lastModified;
    private long createdTime;
    private long lastModifiedTime;
    private String trigger;

    public Workflow() {}

    public Workflow(String id, int version, String ownerId, String lastModified, long createdTime, long lastModifiedTime, String trigger) {
        this.id = id;
        this.version = version;
        this.ownerId = ownerId;
        this.lastModified = lastModified;
        this.createdTime = createdTime;
        this.lastModifiedTime = lastModifiedTime;
        this.trigger = trigger;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getLastModified() {
        return lastModified;
    }

    public void setLastModified(String lastModified) {
        this.lastModified = lastModified;
    }

    public long getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(long createdTime) {
        this.createdTime = createdTime;
    }

    public long getLastModifiedTime() {
        return lastModifiedTime;
    }

    public void setLastModifiedTime(long lastModifiedTime) {
        this.lastModifiedTime = lastModifiedTime;
    }

    public String getTrigger() {
        return trigger;
    }

    public void setTrigger(String trigger) {
        this.trigger = trigger;
    }

    @Override
    public String toString() {
        return "Workflow{" +
                "id='" + id + '\'' +
                ", version=" + version +
                ", ownerId='" + ownerId + '\'' +
                ", lastModified='" + lastModified + '\'' +
                ", createdTime=" + createdTime +
                ", lastModifiedTime=" + lastModifiedTime +
                ", trigger='" + trigger + '\'' +
                '}';
    }


}
