package com.nexops.api.governance.domain.service;

import com.nexops.api.governance.domain.model.GovernanceMetrics;
import com.nexops.api.governance.domain.model.SlaConfig;
import com.nexops.api.governance.domain.ports.in.GetGovernanceMetricsUseCase;
import com.nexops.api.governance.domain.ports.in.GetSlaConfigsUseCase;
import com.nexops.api.governance.domain.ports.in.GetTechnicianMetricsUseCase;
import com.nexops.api.governance.domain.ports.in.UpdateSlaConfigUseCase;
import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort;
import com.nexops.api.governance.domain.ports.out.SlaBreachEventRepository;
import com.nexops.api.governance.domain.ports.out.SlaConfigRepository;
import com.nexops.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GovernanceService implements 
    GetGovernanceMetricsUseCase, GetTechnicianMetricsUseCase, 
    GetSlaConfigsUseCase, UpdateSlaConfigUseCase {

    private final GovernanceTicketQueryPort ticketQueryPort;
    private final SlaBreachEventRepository breachEventRepository;
    private final SlaConfigRepository slaConfigRepository;

    @Override
    public GovernanceMetrics execute(OffsetDateTime from, OffsetDateTime to) {
        int total = ticketQueryPort.countBetween(from, to);
        int breaches = breachEventRepository.countBreachesBetween(from, to);
        double compliance = total == 0 ? 100.0 : ((double)(total - breaches) / total) * 100.0;

        return new GovernanceMetrics(
                total,
                ticketQueryPort.countByStatusBetween("OPEN", from, to),
                ticketQueryPort.countByStatusBetween("IN_PROGRESS", from, to),
                ticketQueryPort.countByStatusBetween("CLOSED", from, to),
                breaches,
                compliance,
                ticketQueryPort.avgResolutionMinutesBetween(from, to),
                ticketQueryPort.countGroupedByProblemTypeBetween(from, to),
                ticketQueryPort.countGroupedByAssigneeBetween(from, to),
                from,
                to
        );
    }

    @Override
    public GovernanceMetrics execute(UUID technicianId, OffsetDateTime from, OffsetDateTime to) {
        int total = ticketQueryPort.countByAssigneeBetween(technicianId, from, to);
        int breaches = breachEventRepository.countBreachesByTechnicianBetween(technicianId, from, to);
        double compliance = total == 0 ? 100.0 : ((double)(total - breaches) / total) * 100.0;

        return new GovernanceMetrics(
                total,
                0, // Not applicable for technician specific metrics in this context
                0, // Not applicable
                ticketQueryPort.countByAssigneeBetween(technicianId, from, to), // This logic might need refinement based on status
                breaches,
                compliance,
                ticketQueryPort.avgResolutionMinutesByAssigneeBetween(technicianId, from, to),
                null, // Not applicable
                null, // Not applicable
                from,
                to
        );
    }

    @Override
    public List<SlaConfig> execute() {
        return slaConfigRepository.findAll();
    }

    @Override
    @Transactional
    public SlaConfig execute(UUID slaConfigId, int responseMinutes, int resolutionMinutes, int notifyManagerAtPercent) {
        SlaConfig config = slaConfigRepository.findById(slaConfigId)
                .orElseThrow(() -> new BusinessException("SLA Config não encontrada"));
        
        config.update(responseMinutes, resolutionMinutes, notifyManagerAtPercent);
        return slaConfigRepository.save(config);
    }
}
