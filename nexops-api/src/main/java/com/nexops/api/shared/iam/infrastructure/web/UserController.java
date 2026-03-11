package com.nexops.api.shared.iam.infrastructure.web;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.ports.in.CreateInviteUseCase;
import com.nexops.api.shared.iam.domain.ports.in.FirstAccessUseCase;
import com.nexops.api.shared.iam.infrastructure.web.dto.FirstAccessRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.InviteRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.TokenPairResponse;
import com.nexops.api.shared.iam.infrastructure.web.dto.UserResponse;
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
    private final com.nexops.api.shared.iam.domain.ports.in.GetUsersUseCase getUsersUseCase;

    @Operation(summary = "List users", description = "List all users for the current tenant")
    @GetMapping
    public ResponseEntity<java.util.List<UserResponse>> getUsers() {
        var users = getUsersUseCase.execute();
        var response = users.stream()
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getName(),
                        u.getEmail(),
                        u.getStatus().name(),
                        u.getCreatedAt(),
                        u.getLastLoginAt(),
                        u.getRoles().stream().map(com.nexops.api.shared.iam.domain.model.Role::getName).collect(java.util.stream.Collectors.toList())
                ))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Create user", description = "Create a new user with a temporary password (USER_MANAGE only)")
    @PostMapping("/invite")
    public ResponseEntity<Void> createInvite(@RequestBody @Valid InviteRequest request) {
        createInviteUseCase.execute(
                request.name(),
                request.email(),
                java.util.UUID.fromString(request.roleId()),
                request.password()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "Update user", description = "Update user roles and permissions (USER_MANAGE only)")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateUser(
            @PathVariable java.util.UUID id,
            @RequestBody @Valid com.nexops.api.shared.iam.infrastructure.web.dto.UserUpdateRequest request) {
        ((com.nexops.api.shared.iam.domain.ports.in.UpdateUserUseCase) getUsersUseCase).execute(
                id,
                request.roleId(),
                request.permissions()
        );
        return ResponseEntity.ok().build();
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

    @Operation(summary = "Activate account", description = "Set a definitive password for a pending account")
    @PostMapping("/activate")
    public ResponseEntity<Void> activate(@RequestBody @Valid com.nexops.api.shared.iam.infrastructure.web.dto.ActivateAccountRequest request) {
        ((com.nexops.api.shared.iam.domain.ports.in.ActivateUserUseCase) getUsersUseCase).execute(request.newPassword());
        return ResponseEntity.ok().build();
    }
}
