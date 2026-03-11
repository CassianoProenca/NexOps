package com.nexops.api.shared.iam.domain.service;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.iam.domain.model.Role;
import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.model.UserStatus;
import com.nexops.api.shared.iam.domain.ports.in.CreateInviteUseCase;
import com.nexops.api.shared.iam.domain.ports.out.PasswordEncoderPort;
import com.nexops.api.shared.iam.domain.ports.out.RoleRepository;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InviteService implements CreateInviteUseCase {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoderPort passwordEncoder;

    @Override
    @Transactional
    public void execute(String name, String email, UUID roleId, String password) {
        log.info("Attempting to create user: {} ({}) with role: {}", name, email, roleId);
        
        var caller = SecurityContext.get();
        if (caller == null) {
            log.error("Create user failed: Not authenticated");
            throw new BusinessException("Não autenticado");
        }

        log.info("Caller: {} Permissions: {}", caller.email(), caller.permissions());

        if (!caller.hasPermission("USER_MANAGE")) {
            log.error("Create user failed: Insufficient permissions. Required: USER_MANAGE");
            throw new BusinessException("Sem permissão para gerenciar usuários");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("E-mail já cadastrado");
        }

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new BusinessException("Perfil não encontrado"));

        if (!role.getTenantId().equals(caller.tenantId())) {
            throw new BusinessException("Perfil inválido para este tenant");
        }

        String passwordHash = passwordEncoder.encode(password);

        User user = new User(
                UUID.randomUUID(),
                caller.tenantId(),
                name,
                email,
                passwordHash,
                UserStatus.PENDING,
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                null,
                new HashSet<>(Collections.singletonList(role)),
                new HashMap<>() // Corrected to HashMap for permissionOverrides
        );

        userRepository.save(user);
    }
}
