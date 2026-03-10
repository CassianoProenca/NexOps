package com.nexops.api.shared.tenant.infrastructure;

import com.nexops.api.shared.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(1)
public class TenantSchemaFilter extends OncePerRequestFilter {

    private final JdbcTemplate jdbcTemplate;

    public TenantSchemaFilter(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        String schema = TenantContext.getSchema();
        if (schema != null && !schema.isBlank()) {
            jdbcTemplate.execute("SET search_path TO " + schema + ", public");
        }
        chain.doFilter(request, response);
    }
}
