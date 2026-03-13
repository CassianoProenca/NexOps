package com.nexops.api.helpdesk.infrastructure.persistence;

import com.nexops.api.helpdesk.domain.model.TicketStatus;
import com.nexops.api.helpdesk.infrastructure.persistence.entity.TicketJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
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

    @Query("SELECT COUNT(t) FROM TicketJpaEntity t WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :from AND :to")
    int countBetween(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT COUNT(t) FROM TicketJpaEntity t WHERE t.tenantId = :tenantId AND t.status = :status AND t.createdAt BETWEEN :from AND :to")
    int countByStatusBetween(@Param("tenantId") UUID tenantId, @Param("status") TicketStatus status, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT COUNT(t) FROM TicketJpaEntity t WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND t.createdAt BETWEEN :from AND :to")
    int countByAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("assigneeId") UUID assigneeId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT AVG(EXTRACT(EPOCH FROM t.closedAt) - EXTRACT(EPOCH FROM t.openedAt)) / 60.0 FROM TicketJpaEntity t " +
           "WHERE t.tenantId = :tenantId AND t.closedAt IS NOT NULL AND t.createdAt BETWEEN :from AND :to")
    Double avgResolutionMinutesBetween(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT AVG(EXTRACT(EPOCH FROM t.closedAt) - EXTRACT(EPOCH FROM t.openedAt)) / 60.0 FROM TicketJpaEntity t " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND t.closedAt IS NOT NULL AND t.createdAt BETWEEN :from AND :to")
    Double avgResolutionMinutesByAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("assigneeId") UUID assigneeId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT CAST(t.createdAt AS date), COUNT(t) FROM TicketJpaEntity t " +
           "WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY CAST(t.createdAt AS date)")
    List<Object[]> countByDateBetween(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT pt.name, COUNT(t) FROM TicketJpaEntity t " +
           "JOIN ProblemTypeJpaEntity pt ON pt.id = t.problemTypeId " +
           "WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY pt.name")
    List<Object[]> countGroupedByProblemTypeBetween(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT u.name, COUNT(t) FROM TicketJpaEntity t " +
           "JOIN UserJpaEntity u ON u.id = t.assigneeId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId IS NOT NULL AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY u.name")
    List<Object[]> countGroupedByAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT t.slaLevel, COUNT(t) FROM TicketJpaEntity t " +
           "WHERE t.tenantId = :tenantId AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY t.slaLevel")
    List<Object[]> countGroupedBySlaLevelBetween(@Param("tenantId") UUID tenantId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT CAST(t.createdAt AS date), COUNT(t) FROM TicketJpaEntity t " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY CAST(t.createdAt AS date)")
    List<Object[]> countByDateByAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("assigneeId") UUID assigneeId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT t.slaLevel, COUNT(t) FROM TicketJpaEntity t " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY t.slaLevel")
    List<Object[]> countGroupedBySlaLevelByAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("assigneeId") UUID assigneeId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT pt.name, COUNT(t) FROM TicketJpaEntity t " +
           "JOIN ProblemTypeJpaEntity pt ON pt.id = t.problemTypeId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY pt.name")
    List<Object[]> countGroupedByProblemTypeByAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("assigneeId") UUID assigneeId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT COUNT(t) FROM TicketJpaEntity t WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId " +
           "AND t.status = :status AND t.createdAt BETWEEN :from AND :to")
    int countByStatusAndAssigneeBetween(@Param("tenantId") UUID tenantId, @Param("assigneeId") UUID assigneeId,
                                        @Param("status") TicketStatus status,
                                        @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);

    @Query("SELECT t.id, t.title, pt.name, t.slaLevel, t.openedAt, t.closedAt, t.slaDeadline " +
           "FROM TicketJpaEntity t " +
           "JOIN ProblemTypeJpaEntity pt ON pt.id = t.problemTypeId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId " +
           "AND t.status = 'CLOSED' AND t.createdAt BETWEEN :from AND :to " +
           "ORDER BY t.closedAt DESC")
    List<Object[]> findClosedByAssigneeBetween(@Param("tenantId") UUID tenantId,
                                               @Param("assigneeId") UUID assigneeId,
                                               @Param("from") OffsetDateTime from,
                                               @Param("to") OffsetDateTime to,
                                               Pageable pageable);

    @Query("SELECT u.name, u.id FROM TicketJpaEntity t " +
           "JOIN UserJpaEntity u ON u.id = t.assigneeId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId IS NOT NULL AND t.createdAt BETWEEN :from AND :to " +
           "GROUP BY u.name, u.id")
    List<Object[]> findTechniciansByAssigneeBetween(@Param("tenantId") UUID tenantId,
                                                    @Param("from") OffsetDateTime from,
                                                    @Param("to") OffsetDateTime to);

    @Query("SELECT t.id FROM TicketJpaEntity t WHERE t.tenantId = :tenantId AND t.slaDeadline BETWEEN :now AND :threshold AND t.status <> 'CLOSED'")
    List<UUID> findTicketsNearingSlaDeadline(@Param("tenantId") UUID tenantId, @Param("now") OffsetDateTime now, @Param("threshold") OffsetDateTime threshold);

    @Query("SELECT t.id FROM TicketJpaEntity t WHERE t.tenantId = :tenantId AND t.slaDeadline < :now AND t.status <> 'CLOSED'")
    List<UUID> findBreachedTickets(@Param("tenantId") UUID tenantId, @Param("now") OffsetDateTime now);
}
