package com.nexops.api.governance.infrastructure.persistence;

import com.nexops.api.governance.infrastructure.persistence.entity.SlaBreachEventJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface SlaBreachEventJpaRepository extends JpaRepository<SlaBreachEventJpaEntity, UUID> {
    List<SlaBreachEventJpaEntity> findByTicketId(UUID ticketId);

    @Query("SELECT COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "WHERE e.breachedAt BETWEEN :from AND :to")
    int countBreachesBetween(@Param("from") OffsetDateTime from,
                             @Param("to") OffsetDateTime to);

    @Query("SELECT COUNT(e) FROM SlaBreachEventJpaEntity e " +
           "JOIN TicketJpaEntity t ON t.id = e.ticketId " +
           "WHERE t.assigneeId = :technicianId AND e.breachedAt BETWEEN :from AND :to")
    int countBreachesByTechnicianBetween(@Param("technicianId") UUID technicianId,
                                         @Param("from") OffsetDateTime from,
                                         @Param("to") OffsetDateTime to);
}
