package com.nexops.api.shared.security;

import com.nexops.api.shared.security.config.JwtProperties;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Slf4j @Service @RequiredArgsConstructor
public class JwtService {

    private final JwtProperties props;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UUID userId, String email,
                                       String tenantSlug, Set<String> permissions) {
        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("tenant", tenantSlug)
                .claim("permissions", permissions)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusMillis(props.getExpirationMs())))
                .signWith(key())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
            return false;
        }
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parseToken(token).getSubject());
    }

    public String extractTenantSlug(String token) {
        return parseToken(token).get("tenant", String.class);
    }

    @SuppressWarnings("unchecked")
    public Set<String> extractPermissions(String token) {
        List<String> perms = parseToken(token).get("permissions", List.class);
        return perms != null ? new HashSet<>(perms) : new HashSet<>();
    }
}
