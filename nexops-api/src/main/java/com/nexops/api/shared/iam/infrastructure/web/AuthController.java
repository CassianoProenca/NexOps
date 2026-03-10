package com.nexops.api.shared.iam.infrastructure.web;

import com.nexops.api.shared.iam.domain.ports.in.LoginUseCase;
import com.nexops.api.shared.iam.domain.ports.in.RefreshTokenUseCase;
import com.nexops.api.shared.iam.domain.service.RefreshTokenService;
import com.nexops.api.shared.iam.infrastructure.web.dto.LoginRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.RefreshRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.TokenPairResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Authentication and Token management")
public class AuthController {

    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final RefreshTokenService refreshTokenService;

    @Operation(summary = "Login", description = "Authenticate user and return access and refresh tokens")
    @PostMapping("/login")
    public ResponseEntity<TokenPairResponse> login(@RequestBody @Valid LoginRequest request) {
        return loginUseCase.execute(request.email(), request.password(), request.tenantSlug())
                .map(tokens -> ResponseEntity.ok(new TokenPairResponse(tokens.getAccessToken(), tokens.getRefreshToken())))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @Operation(summary = "Refresh Token", description = "Get a new access token using a valid refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<TokenPairResponse> refresh(@RequestBody @Valid RefreshRequest request) {
        return refreshTokenUseCase.execute(request.refreshToken())
                .map(tokens -> ResponseEntity.ok(new TokenPairResponse(tokens.getAccessToken(), tokens.getRefreshToken())))
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }

    @Operation(summary = "Logout", description = "Revoke a refresh token")
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestBody @Valid RefreshRequest request) {
        refreshTokenService.revoke(request.refreshToken());
    }
}
