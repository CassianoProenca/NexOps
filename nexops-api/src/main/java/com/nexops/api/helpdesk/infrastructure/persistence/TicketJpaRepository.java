package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.infrastructure.persistence.entity.TicketJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TicketJpaRepository extends JpaRepository<TicketJpaEntity, UUID> {
    List<TicketJpaEntity> findAllByTenantId(UUID tenantId);
    List<TicketJpaEntity> findByTenantIdAndStatus(UUID tenantId, TicketStatus status);
    List<TicketJpaEntity> findByTenantIdAndAssigneeId(UUID tenantId, UUID assigneeId);
    List<TicketJpaEntity> findByTenantIdAndRequesterId(UUID tenantId, UUID requesterId);
    List<TicketJpaEntity> findByTenantIdAndProblemTypeIdAndStatus(UUID tenantId, UUID problemTypeId, TicketStatus status);
    List<TicketJpaEntity> findByParentTicketId(UUID parentTicketId);

    @Query("SELECT t FROM TicketJpaEntity t WHERE t.tenantId = :tenantId " +
           "AND t.problemTypeId = :problemTypeId " +
           "AND t.status = 'OPEN' " +
           "ORDER BY CASE t.internalPriority " +
           "WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 " +
           "WHEN 'MEDIUM' THEN 3 WHEN 'LOW' THEN 4 END, t.openedAt ASC")
    List<TicketJpaEntity> findOpenByProblemTypeOrderByPriorityAndAge(
        @Param("tenantId") UUID tenantId,
        @Param("problemTypeId") UUID problemTypeId);
}
