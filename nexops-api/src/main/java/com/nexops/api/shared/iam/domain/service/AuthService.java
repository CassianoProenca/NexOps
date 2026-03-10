package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.TokenPair;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.model.UserStatus;
import com.nexops.api.shared.iam.domain.ports.in.LoginUseCase;
import com.nexops.api.shared.iam.domain.ports.in.RefreshTokenUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.JwtService;
import com.nexops.api.shared.tenant.TenantContext;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService implements LoginUseCase, RefreshTokenUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoderPort passwordEncoder;
    private final TenantRepository tenantRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public Optional<TokenPair> execute(String email, String password, String tenantSlug) {
        // Garantir que o search_path esteja setado para este tenant
        var tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new BusinessException("Tenant não encontrado: " + tenantSlug));
        
        String schema = tenant.getSchemaName();
        TenantContext.setSlug(tenantSlug);
        TenantContext.setSchema(schema);
        jdbcTemplate.execute("SET search_path TO " + schema + ", public");

        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()))
                .map(user -> {
                    if (user.getStatus() != UserStatus.ACTIVE) {
                        throw new BusinessException("Usuário inativo ou pendente");
                    }
                    
                    refreshTokenService.revokeAllForUser(user.getId());
                    
                    String accessToken = jwtService.generateAccessToken(
                            user.getId(), 
                            user.getEmail(), 
                            tenantSlug, 
                            user.resolvedPermissions()
                    );
                    
                    String refreshToken = refreshTokenService.generate(user.getId());
                    
                    return new TokenPair(accessToken, refreshToken);
                });
    }

    @Override
    public Optional<TokenPair> execute(String rawRefreshToken) {
        return refreshTokenService.validate(rawRefreshToken)
                .flatMap(token -> userRepository.findById(token.getUserId())
                        .map(user -> {
                            refreshTokenService.revoke(rawRefreshToken);
                            
                            String tenantSlug = com.nexops.api.shared.tenant.TenantContext.getSlug();
                            if (tenantSlug == null) {
                                throw new BusinessException("Tenant ID (X-Tenant-ID) não fornecido no header");
                            }
                            
                            String accessToken = jwtService.generateAccessToken(
                                    user.getId(),
                                    user.getEmail(),
                                    tenantSlug,
                                    user.resolvedPermissions()
                            );
                            
                            String newRefreshToken = refreshTokenService.generate(user.getId());
                            return new TokenPair(accessToken, newRefreshToken);
                        }));
    }
}
