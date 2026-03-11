package com.nexops.api.shared.iam.infrastructure.web;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.ports.in.CreateInviteUseCase;
import com.nexops.api.shared.iam.domain.ports.in.FirstAccessUseCase;
import com.nexops.api.shared.iam.infrastructure.web.dto.FirstAccessRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.InviteRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.InviteResponse;
import com.nexops.api.shared.iam.infrastructure.web.dto.TokenPairResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management and invitations")
public class UserController {

    private final CreateInviteUseCase createInviteUseCase;
    private final FirstAccessUseCase firstAccessUseCase;

    @Operation(summary = "Create invite", description = "Create an invite link for a new user (ADMIN only)")
    @PostMapping("/invite")
    public ResponseEntity<InviteResponse> createInvite(@RequestBody @Valid InviteRequest request) {
        String rawToken = createInviteUseCase.execute(request.email());
        String inviteLink = "/primeiro-acesso?token=" + rawToken;
        return ResponseEntity.status(HttpStatus.CREATED).body(new InviteResponse(inviteLink));
    }

    @Operation(summary = "First access", description = "Activate account via invite token")
    @PostMapping("/first-access")
    public ResponseEntity<TokenPairResponse> firstAccess(@RequestBody @Valid FirstAccessRequest request) {
        if (!request.senha().equals(request.confirmacaoSenha())) {
            throw new BusinessException("As senhas não coincidem");
        }

        var tp = firstAccessUseCase.execute(
                request.token(),
                request.nome(),
                request.email(),
                request.senha()
        );

        return ResponseEntity.ok(new TokenPairResponse(tp.getAccessToken(), tp.getRefreshToken(), "Bearer"));
    }
}
