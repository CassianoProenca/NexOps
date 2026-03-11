package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.Permission;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.model.UserStatus;
import com.nexops.api.shared.iam.domain.ports.in.ActivateUserUseCase;
import com.nexops.api.shared.iam.domain.ports.in.GetUsersUseCase;
import com.nexops.api.shared.iam.domain.ports.in.UpdateUserUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.PermissionRepository;
import com.nexops.api.shared.iam.domain.ports.out.RoleRepository;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor 
public class UserService implements GetUsersUseCase, ActivateUserUseCase, UpdateUserUseCase {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoderPort passwordEncoder;

    @Override
    public List<User> execute() {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");
        return userRepository.findAllByTenantId(caller.tenantId());
    }

    @Override
    @Transactional
    public void execute(UUID userId, UUID roleId, List<String> permissions) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        if (!caller.hasPermission("USER_MANAGE")) {
            throw new BusinessException("Sem permissão para gerenciar usuários");
        }

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (!user.getTenantId().equals(caller.tenantId())) {
            throw new BusinessException("Acesso negado");
        }

        // 1. Busca a nova Role
        var role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException("Perfil não encontrado"));

        // 2. Calcula as permissões personalizadas (Overrides)
        // Se a permissão está na lista mas NÃO está na role -> override = true (grant)
        // Se a permissão NÃO está na lista mas ESTÁ na role -> override = false (revoke)
        // Por agora, para simplificar o modelo de dados atual que salva Set<PermissionJpaEntity>
        // vamos apenas carregar os objetos de permissão e salvar.
        
        var selectedPerms = permissionRepository.findAllByCodes(permissions);
        
        // Criar o mapeamento de overrides para o modelo de domínio
        // No momento nosso User domain model usa Map<Permission, Boolean>
        Map<Permission, Boolean> overrides = new HashMap<>();
        
        // Permissões que estão na lista mas não na role -> True (Adicionais)
        Set<String> rolePermCodes = role.getPermissions().stream().map(Permission::getCode).collect(Collectors.toSet());
        selectedPerms.stream()
            .filter(p -> !rolePermCodes.contains(p.getCode()))
            .forEach(p -> overrides.put(p, true));
            
        // Permissões que estão na role mas não na lista -> False (Removidas)
        role.getPermissions().stream()
            .filter(p -> !permissions.contains(p.getCode()))
            .forEach(p -> overrides.put(p, false));

        var updated = new User(
                user.getId(),
                user.getTenantId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getStatus(),
                user.getCreatedAt(),
                OffsetDateTime.now(),
                user.getLastLoginAt(),
                new HashSet<>(Collections.singletonList(role)),
                overrides
        );

        userRepository.save(updated);
    }

    @Override
    @Transactional
    public void execute(String newPassword) {
        var caller = SecurityContext.get();
        if (caller == null) throw new BusinessException("Não autenticado");

        var user = userRepository.findById(caller.userId())
                .orElseThrow(() -> new BusinessException("Usuário não encontrado"));

        if (user.getStatus() != UserStatus.PENDING) {
            throw new BusinessException("Usuário já está ativo");
        }

        var updated = new User(
                user.getId(),
                user.getTenantId(),
                user.getName(),
                user.getEmail(),
                passwordEncoder.encode(newPassword),
                UserStatus.ACTIVE,
                user.getCreatedAt(),
                OffsetDateTime.now(),
                user.getLastLoginAt(),
                user.getRoles(),
                user.getPermissionOverrides()
        );

        userRepository.save(updated);
    }
}
