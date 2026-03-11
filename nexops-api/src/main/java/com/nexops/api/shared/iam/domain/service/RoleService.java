package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.Role;
import com.nexops.api.shared.iam.domain.ports.in.DeleteRoleUseCase;
import com.nexops.api.shared.iam.domain.ports.in.GetRolesUseCase;
import com.nexops.api.shared.iam.domain.ports.in.SaveRoleUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PermissionRepository;
import com.nexops.api.shared.iam.domain.ports.out.RoleRepository;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService implements GetRolesUseCase, SaveRoleUseCase, DeleteRoleUseCase {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public List<Role> execute() {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");
        return roleRepository.findAllByTenantId(caller.tenantId());
    }

    @Override
    @Transactional
    public Role create(String name, String description, List<String> permissions) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        if (roleRepository.existsByNameAndTenantId(name, caller.tenantId())) {
            throw new BusinessException("Já existe um perfil com este nome");
        }

        var perms = permissionRepository.findAllByCodes(permissions);
        var role = new Role(
                UUID.randomUUID(),
                caller.tenantId(),
                name,
                description,
                false,
                OffsetDateTime.now(),
                perms
        );

        return roleRepository.save(role);
    }

    @Override
    @Transactional
    public Role update(UUID id, String name, String description, List<String> permissions) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        var role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Perfil não encontrado"));

        if (!role.getTenantId().equals(caller.tenantId())) {
            throw new BusinessException("Acesso negado");
        }

        if (role.isSystem()) {
            throw new BusinessException("Perfis padrão não podem ser editados");
        }

        var perms = permissionRepository.findAllByCodes(permissions);
        var updated = new Role(
                role.getId(),
                role.getTenantId(),
                name,
                description,
                false,
                role.getCreatedAt(),
                perms
        );

        return roleRepository.save(updated);
    }

    @Override
    @Transactional
    public void execute(UUID id) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        var role = roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Perfil não encontrado"));

        if (!role.getTenantId().equals(caller.tenantId())) {
            throw new BusinessException("Acesso negado");
        }

        if (role.isSystem()) {
            throw new BusinessException("Perfis padrão não podem ser excluídos");
        }

        roleRepository.delete(id);
    }
}
