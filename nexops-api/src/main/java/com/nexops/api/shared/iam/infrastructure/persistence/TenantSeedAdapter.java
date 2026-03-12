package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.ports.out.TenantSeedPort;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TenantSeedAdapter implements TenantSeedPort {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public Set<String> seedTenantRoles(UUID tenantId) {
        // Create ADMIN role for this tenant
        UUID adminRoleId = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO roles (id, tenant_id, name, description, system_role) VALUES (?, ?, 'ADMIN', 'Acesso total ao sistema', true)",
            adminRoleId, tenantId
        );

        // Create TECH role for this tenant
        UUID techRoleId = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO roles (id, tenant_id, name, description, system_role) VALUES (?, ?, 'TECH', 'Técnico de suporte', true)",
            techRoleId, tenantId
        );

        // Create GESTOR role for this tenant
        UUID gestorRoleId = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO roles (id, tenant_id, name, description, system_role) VALUES (?, ?, 'GESTOR', 'Gestor — acesso operacional e relatórios de SLA', true)",
            gestorRoleId, tenantId
        );

        // Create USER role for this tenant
        UUID userRoleId = UUID.randomUUID();
        jdbcTemplate.update(
            "INSERT INTO roles (id, tenant_id, name, description, system_role) VALUES (?, ?, 'USER', 'Usuário final', true)",
            userRoleId, tenantId
        );

        // Assign all permissions to ADMIN role
        jdbcTemplate.update(
            "INSERT INTO role_permissions (role_id, permission_id) SELECT ?, id FROM permissions",
            adminRoleId
        );

        // Assign TECH permissions — operação de chamados e ativos, sem relatórios
        jdbcTemplate.update(
            "INSERT INTO role_permissions (role_id, permission_id) " +
            "SELECT ?, id FROM permissions WHERE code IN (" +
            "'TICKET_CREATE', 'TICKET_VIEW_OWN', 'TICKET_VIEW_ALL', 'TICKET_MANAGE', " +
            "'TICKET_ASSIGN', 'TICKET_RESOLVE', " +
            "'ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT', 'ASSET_MOVE')",
            techRoleId
        );

        // Assign GESTOR permissions — tudo do TECH mais relatórios de SLA e convites
        jdbcTemplate.update(
            "INSERT INTO role_permissions (role_id, permission_id) " +
            "SELECT ?, id FROM permissions WHERE code IN (" +
            "'TICKET_CREATE', 'TICKET_VIEW_OWN', 'TICKET_VIEW_ALL', 'TICKET_MANAGE', " +
            "'TICKET_ASSIGN', 'TICKET_RESOLVE', 'TICKET_DELETE', " +
            "'ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT', 'ASSET_MOVE', " +
            "'REPORT_VIEW_ALL', 'SLA_CONFIG', 'INVITE_CREATE')",
            gestorRoleId
        );

        // Assign USER permissions — apenas abrir e ver os próprios chamados
        jdbcTemplate.update(
            "INSERT INTO role_permissions (role_id, permission_id) " +
            "SELECT ?, id FROM permissions WHERE code IN (" +
            "'TICKET_CREATE', 'TICKET_VIEW_OWN')",
            userRoleId
        );

        // Return all permission codes for ADMIN (all permissions)
        List<String> permCodes = jdbcTemplate.queryForList(
            "SELECT code FROM permissions", String.class
        );

        return new HashSet<>(permCodes);
    }

    @Override
    @Transactional
    public void assignAdminRole(UUID userId, UUID tenantId) {
        jdbcTemplate.update(
            "INSERT INTO user_roles (user_id, role_id) " +
            "SELECT ?, id FROM roles WHERE tenant_id = ? AND name = 'ADMIN'",
            userId, tenantId
        );
    }

    @Override
    @Transactional
    public void assignUserRole(UUID userId, UUID tenantId) {
        jdbcTemplate.update(
            "INSERT INTO user_roles (user_id, role_id) " +
            "SELECT ?, id FROM roles WHERE tenant_id = ? AND name = 'USER'",
            userId, tenantId
        );
    }
}
