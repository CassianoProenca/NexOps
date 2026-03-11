package com.nexops.api.shared.iam.infrastructure.web;

import com.nexops.api.shared.iam.domain.model.Permission;
import com.nexops.api.shared.iam.domain.ports.in.DeleteRoleUseCase;
import com.nexops.api.shared.iam.domain.ports.in.GetRolesUseCase;
import com.nexops.api.shared.iam.domain.ports.in.SaveRoleUseCase;
import com.nexops.api.shared.iam.infrastructure.web.dto.RoleRequest;
import com.nexops.api.shared.iam.infrastructure.web.dto.RoleResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Access profile management")
public class RoleController {

    private final GetRolesUseCase getRolesUseCase;
    private final SaveRoleUseCase saveRoleUseCase;
    private final DeleteRoleUseCase deleteRoleUseCase;

    @GetMapping
    @Operation(summary = "List roles", description = "List all access profiles for the current tenant")
    public ResponseEntity<List<RoleResponse>> getRoles() {
        var roles = getRolesUseCase.execute();
        var response = roles.stream()
                .map(r -> new RoleResponse(
                        r.getId(),
                        r.getName(),
                        r.getDescription(),
                        r.isSystem(),
                        0, // Count can be added later
                        r.getPermissions().stream().map(Permission::getCode).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Create role", description = "Create a new custom access profile")
    public ResponseEntity<RoleResponse> createRole(@RequestBody @Valid RoleRequest request) {
        var r = saveRoleUseCase.create(request.name(), request.description(), request.permissions());
        var response = new RoleResponse(
                r.getId(),
                r.getName(),
                r.getDescription(),
                r.isSystem(),
                0,
                r.getPermissions().stream().map(Permission::getCode).collect(Collectors.toList())
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Update an existing custom access profile")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable UUID id,
            @RequestBody @Valid RoleRequest request) {
        var r = saveRoleUseCase.update(id, request.name(), request.description(), request.permissions());
        var response = new RoleResponse(
                r.getId(),
                r.getName(),
                r.getDescription(),
                r.isSystem(),
                0,
                r.getPermissions().stream().map(Permission::getCode).collect(Collectors.toList())
        );
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Delete a custom access profile")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID id) {
        deleteRoleUseCase.execute(id);
        return ResponseEntity.noContent().build();
    }
}
