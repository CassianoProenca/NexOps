package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.infrastructure.persistence.entity.SlaBreachEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SlaBreachEventJpaRepository extends JpaRepository<SlaBreachEventJpaEntity, UUID> {

    @Query("SELECT e FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "WHERE e.ticketId = :ticketId AND t.tenantId = :tenantId")
    List<SlaBreachEventJpaEntity> findByTicketIdAndTenantId(@Param("tenantId") UUID tenantId,
                                                             @Param("ticketId") UUID ticketId);

    @Query("SELECT COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "WHERE t.tenantId = :tenantId AND e.breachedAt BETWEEN :from AND :to")
    int countBreachesBetween(@Param("tenantId") UUID tenantId,
                             @Param("from") OffsetDateTime from,
                             @Param("to") OffsetDateTime to);

    @Query("SELECT COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :technicianId AND e.breachedAt BETWEEN :from AND :to")
    int countBreachesByTechnicianBetween(@Param("tenantId") UUID tenantId,
                                         @Param("technicianId") UUID technicianId,
                                         @Param("from") OffsetDateTime from,
                                         @Param("to") OffsetDateTime to);

    @Query("SELECT CAST(e.breachedAt AS date), COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "WHERE t.tenantId = :tenantId AND e.breachedAt BETWEEN :from AND :to " +
           "GROUP BY CAST(e.breachedAt AS date)")
    List<Object[]> countBreachesByDateBetween(@Param("tenantId") UUID tenantId,
                                              @Param("from") OffsetDateTime from,
                                              @Param("to") OffsetDateTime to);

    @Query("SELECT pt.name, COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "JOIN ProblemTypeJpaEntity pt ON pt.id = t.problemTypeId " +
           "WHERE t.tenantId = :tenantId AND e.breachedAt BETWEEN :from AND :to " +
           "GROUP BY pt.name")
    List<Object[]> countBreachesGroupedByProblemTypeBetween(@Param("tenantId") UUID tenantId,
                                                            @Param("from") OffsetDateTime from,
                                                            @Param("to") OffsetDateTime to);

    @Query("SELECT u.name, COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "JOIN UserJpaEntity u ON u.id = t.assigneeId " +
           "WHERE t.tenantId = :tenantId AND e.breachedAt BETWEEN :from AND :to " +
           "AND t.assigneeId IS NOT NULL " +
           "GROUP BY u.name")
    List<Object[]> countBreachesGroupedByTechnicianBetween(@Param("tenantId") UUID tenantId,
                                                           @Param("from") OffsetDateTime from,
                                                           @Param("to") OffsetDateTime to);

    @Query("SELECT CAST(e.breachedAt AS date), COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND e.breachedAt BETWEEN :from AND :to " +
           "GROUP BY CAST(e.breachedAt AS date)")
    List<Object[]> countBreachesByDateByAssigneeBetween(@Param("tenantId") UUID tenantId,
                                                        @Param("assigneeId") UUID assigneeId,
                                                        @Param("from") OffsetDateTime from,
                                                        @Param("to") OffsetDateTime to);

    @Query("SELECT pt.name, COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "JOIN ProblemTypeJpaEntity pt ON pt.id = t.problemTypeId " +
           "WHERE t.tenantId = :tenantId AND t.assigneeId = :assigneeId AND e.breachedAt BETWEEN :from AND :to " +
           "GROUP BY pt.name")
    List<Object[]> countBreachesGroupedByProblemTypeByAssigneeBetween(@Param("tenantId") UUID tenantId,
                                                                      @Param("assigneeId") UUID assigneeId,
                                                                      @Param("from") OffsetDateTime from,
                                                                      @Param("to") OffsetDateTime to);
}
