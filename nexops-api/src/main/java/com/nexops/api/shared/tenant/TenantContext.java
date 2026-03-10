package com.nexops.api.shared.tenant;

public class TenantContext {

    private static final ThreadLocal<String> SCHEMA = new ThreadLocal<>();
    private static final ThreadLocal<String> SLUG = new ThreadLocal<>();

    public static void setSchema(String schema) {
        SCHEMA.set(schema);
    }

    public static String getSchema() {
        return SCHEMA.get();
    }

    public static void setSlug(String slug) {
        SLUG.set(slug);
    }

    public static String getSlug() {
        return SLUG.get();
    }

    public static void clear() {
        SCHEMA.remove();
        SLUG.remove();
    }
}
