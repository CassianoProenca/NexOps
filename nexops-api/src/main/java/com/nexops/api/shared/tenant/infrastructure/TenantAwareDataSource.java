package com.nexops.api.shared.tenant.infrastructure;

import com.nexops.api.shared.tenant.TenantContext;
import org.springframework.jdbc.datasource.AbstractDataSource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * DataSource wrapper que executa SET search_path em cada getConnection(),
 * garantindo que JPA e JdbcTemplate sempre operem no schema correto do tenant.
 */
public class TenantAwareDataSource extends AbstractDataSource {

    private final DataSource delegate;

    public TenantAwareDataSource(DataSource delegate) {
        this.delegate = delegate;
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection conn = delegate.getConnection();
        applySearchPath(conn);
        return conn;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection conn = delegate.getConnection(username, password);
        applySearchPath(conn);
        return conn;
    }

    private void applySearchPath(Connection conn) throws SQLException {
        String schema = TenantContext.getSchema();
        String path = (schema != null && !schema.isBlank()) ? schema + ", public" : "public";
        try (var stmt = conn.createStatement()) {
            stmt.execute("SET search_path TO " + path);
        }
    }
}
