package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.TokenPair;
import com.nexops.api.shared.iam.domain.model.UserStatus;
import com.nexops.api.shared.iam.domain.ports.in.LoginUseCase;
import com.nexops.api.shared.iam.domain.ports.in.RefreshTokenUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService implements LoginUseCase, RefreshTokenUseCase {

    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final PasswordEncoderPort passwordEncoder;

    @Override
    public Optional<TokenPair> execute(String email, String senha) {
        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(senha, user.getPasswordHash()))
                .map(user -> {
                    if (user.getStatus() == UserStatus.SUSPENDED) {
                        throw new BusinessException("Usuário inativo");
                    }

                    refreshTokenService.revokeAllForUser(user.getId());

                    // Record last login
                    user.recordLogin();
                    userRepository.save(user);

                    String accessToken = jwtService.generateAccessToken(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getTenantId(),
                            user.resolvedPermissions(),
                            user.getStatus().name()
                    );

                    String refreshToken = refreshTokenService.generate(user.getId(), user.getTenantId());

                    return new TokenPair(accessToken, refreshToken);
                });
    }

    @Override
    public Optional<TokenPair> execute(String rawRefreshToken) {
        return refreshTokenService.validate(rawRefreshToken)
                .flatMap(token -> userRepository.findById(token.getUserId())
                        .map(user -> {
                            refreshTokenService.revoke(rawRefreshToken);

                            String accessToken = jwtService.generateAccessToken(
                                    user.getId(),
                                    user.getName(),
                                    user.getEmail(),
                                    user.getTenantId(),
                                    user.resolvedPermissions(),
                                    user.getStatus().name()
                            );

                            String newRefreshToken = refreshTokenService.generate(user.getId(), user.getTenantId());
                            return new TokenPair(accessToken, newRefreshToken);
                        }));
    }
}
