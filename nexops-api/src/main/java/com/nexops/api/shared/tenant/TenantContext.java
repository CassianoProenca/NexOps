package com.nexops.api.shared.tenant;

public class TenantContext {

    private static final ThreadLocal<String> SCHEMA = new ThreadLocal<>();

    public static void setSchema(String schema) {
        SCHEMA.set(schema);
    }

    public static String getSchema() {
        return SCHEMA.get();
    }

    public static void clear() {
        SCHEMA.remove();
    }
}
