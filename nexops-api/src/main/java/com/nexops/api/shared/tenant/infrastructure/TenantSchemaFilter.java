package com.nexops.api.shared.tenant.infrastructure;

import com.nexops.api.shared.tenant.TenantContext;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
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
    private final TenantRepository tenantRepository;

    public TenantSchemaFilter(JdbcTemplate jdbcTemplate, TenantRepository tenantRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        
        String tenantSlug = request.getHeader("X-Tenant-ID");
        
        if (tenantSlug != null && !tenantSlug.isBlank()) {
            TenantContext.setSlug(tenantSlug);
            
            tenantRepository.findBySlug(tenantSlug).ifPresent(tenant -> {
                String schema = tenant.getSchemaName();
                TenantContext.setSchema(schema);
                jdbcTemplate.execute("SET search_path TO " + schema + ", public");
            });
        }
        
        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
