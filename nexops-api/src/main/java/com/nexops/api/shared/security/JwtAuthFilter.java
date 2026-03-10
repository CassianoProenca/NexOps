package com.nexops.api.shared.security;

import com.nexops.api.shared.tenant.TenantContext;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final TenantRepository tenantRepository;

    public JwtAuthFilter(JwtService jwtService, TenantRepository tenantRepository) {
        this.jwtService = jwtService;
        this.tenantRepository = tenantRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {
        try {
            String token = extractToken(request);

            if (token != null && jwtService.isValid(token)) {
                var userId = jwtService.extractUserId(token);
                var email = jwtService.parseToken(token).get("email", String.class);
                var tenantSlug = jwtService.extractTenantSlug(token);
                var permissions = jwtService.extractPermissions(token);

                var tenant = tenantRepository.findBySlug(tenantSlug);
                if (tenant.isPresent()) {
                    String schema = tenant.get().getSchemaName();
                    TenantContext.setSchema(schema);

                    var authenticatedUser = new AuthenticatedUser(
                            userId, email, tenantSlug, schema, permissions);
                    SecurityContext.set(authenticatedUser);

                    var authorities = permissions.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    var auth = new UsernamePasswordAuthenticationToken(
                            authenticatedUser, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    log.warn("Tenant não encontrado para slug: {}", tenantSlug);
                }
            }

            chain.doFilter(request, response);
        } finally {
            SecurityContext.clear();
            TenantContext.clear();
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER_PREFIX)) {
            return header.substring(BEARER_PREFIX.length());
        }
        return null;
    }
}
