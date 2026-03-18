package br.com.tjjud.catalog.shared.exception;

public class ResourceNotFoundException extends RuntimeException {

    private final String resourceKey;
    private final Long resourceId;

    public ResourceNotFoundException(String resourceKey, Long resourceId) {
        super(resourceKey);
        this.resourceKey = resourceKey;
        this.resourceId = resourceId;
    }

    public String getResourceKey() {
        return resourceKey;
    }

    public Long getResourceId() {
        return resourceId;
    }
}
