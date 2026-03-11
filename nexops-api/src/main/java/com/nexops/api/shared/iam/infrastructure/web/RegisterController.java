package com.nexops.api.shared.iam.infrastructure.web;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.ports.in.RegisterTenantUseCase;
import com.nexops.api.shared.iam.infrastructure.web.dto.RegisterRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.TokenPairResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1")
@RequiredArgsConstructor
@Tag(name = "Registration", description = "Company registration")
public class RegisterController {

    private final RegisterTenantUseCase registerTenantUseCase;

    @Operation(summary = "Register company", description = "Register a new company and create the admin user")
    @PostMapping("/register")
    public ResponseEntity<TokenPairResponse> register(@RequestBody @Valid RegisterRequest request) {
        if (!request.senha().equals(request.confirmacaoSenha())) {
            throw new BusinessException("As senhas não coincidem");
        }

        var tp = registerTenantUseCase.execute(
                request.cnpj(),
                request.nomeFantasia(),
                request.email(),
                request.senha()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new TokenPairResponse(tp.getAccessToken(), tp.getRefreshToken(), "Bearer"));
    }
}
