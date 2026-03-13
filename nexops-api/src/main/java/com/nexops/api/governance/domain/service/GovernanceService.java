package com.nexops.api.governance.domain.service;

import com.nexops.api.governance.domain.model.GovernanceMetrics;
import com.nexops.api.governance.domain.model.SlaConfig;
import com.nexops.api.governance.domain.ports.in.GetGovernanceMetricsUseCase;
import com.nexops.api.governance.domain.ports.in.GetSlaConfigsUseCase;
import com.nexops.api.governance.domain.ports.in.GetTechnicianMetricsUseCase;
import com.nexops.api.governance.domain.ports.in.GetTechnicianTicketsUseCase;
import com.nexops.api.governance.domain.ports.in.UpdateSlaConfigUseCase;
import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort;
import com.nexops.api.governance.domain.ports.out.GovernanceTicketQueryPort.TicketSummary;
import com.nexops.api.governance.domain.ports.out.SlaBreachEventRepository;
import com.nexops.api.governance.domain.ports.out.SlaConfigRepository;
import com.nexops.api.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GovernanceService implements
    GetGovernanceMetricsUseCase, GetTechnicianMetricsUseCase,
    GetTechnicianTicketsUseCase, GetSlaConfigsUseCase, UpdateSlaConfigUseCase {

    private final GovernanceTicketQueryPort ticketQueryPort;
    private final SlaBreachEventRepository breachEventRepository;
    private final SlaConfigRepository slaConfigRepository;

    @Override
    public GovernanceMetrics execute(UUID tenantId, OffsetDateTime from, OffsetDateTime to) {
        int total = ticketQueryPort.countBetween(tenantId, from, to);
        int breachesTotal = breachEventRepository.countBreachesBetween(tenantId, from, to);
        double complianceTotal = total == 0 ? 100.0 : ((double)(total - breachesTotal) / total) * 100.0;

        Map<String, Integer> ticketsByDate = ticketQueryPort.countByDateBetween(tenantId, from, to);
        Map<String, Integer> breachesByDate = breachEventRepository.countBreachesByDateBetween(tenantId, from, to);

        List<GovernanceMetrics.TimeSeriesPoint> timeSeries = ticketsByDate.entrySet().stream()
                .map(e -> {
                    int tCount = e.getValue();
                    int bCount = breachesByDate.getOrDefault(e.getKey(), 0);
                    double compliance = tCount == 0 ? 100.0 : ((double)(tCount - bCount) / tCount) * 100.0;
                    return new GovernanceMetrics.TimeSeriesPoint(e.getKey(), tCount, compliance);
                })
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .collect(Collectors.toList());

        Map<String, Integer> ticketsByType = ticketQueryPort.countGroupedByProblemTypeBetween(tenantId, from, to);
        Map<String, Integer> breachesByType = breachEventRepository.countBreachesGroupedByProblemTypeBetween(tenantId, from, to);
        Map<String, Double> complianceByType = ticketsByType.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            int tCount = e.getValue();
                            int bCount = breachesByType.getOrDefault(e.getKey(), 0);
                            return tCount == 0 ? 100.0 : ((double)(tCount - bCount) / tCount) * 100.0;
                        }
                ));

        Map<String, Integer> ticketsByTech = ticketQueryPort.countGroupedByAssigneeBetween(tenantId, from, to);
        Map<String, Integer> breachesByTech = breachEventRepository.countBreachesGroupedByTechnicianBetween(tenantId, from, to);
        Map<String, Double> complianceByTech = ticketsByTech.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            int tCount = e.getValue();
                            int bCount = breachesByTech.getOrDefault(e.getKey(), 0);
                            return tCount == 0 ? 100.0 : ((double)(tCount - bCount) / tCount) * 100.0;
                        }
                ));

        Map<String, String> technicianIds = ticketQueryPort.findTechnicianIdsByAssigneeBetween(tenantId, from, to);

        return new GovernanceMetrics(
                total,
                ticketQueryPort.countByStatusBetween(tenantId, "OPEN", from, to),
                ticketQueryPort.countByStatusBetween(tenantId, "IN_PROGRESS", from, to),
                ticketQueryPort.countByStatusBetween(tenantId, "CLOSED", from, to),
                breachesTotal,
                complianceTotal,
                ticketQueryPort.avgResolutionMinutesBetween(tenantId, from, to),
                ticketsByType,
                ticketsByTech,
                ticketQueryPort.countGroupedBySlaLevelBetween(tenantId, from, to),
                timeSeries,
                complianceByType,
                complianceByTech,
                technicianIds,
                from,
                to
        );
    }

    @Override
    public GovernanceMetrics execute(UUID tenantId, UUID technicianId, OffsetDateTime from, OffsetDateTime to) {
        int total = ticketQueryPort.countByAssigneeBetween(tenantId, technicianId, from, to);
        int breachesTotal = breachEventRepository.countBreachesByTechnicianBetween(tenantId, technicianId, from, to);
        double complianceTotal = total == 0 ? 100.0 : ((double)(total - breachesTotal) / total) * 100.0;

        Map<String, Integer> ticketsByDate = ticketQueryPort.countByDateByAssigneeBetween(tenantId, technicianId, from, to);
        Map<String, Integer> breachesByDate = breachEventRepository.countBreachesByDateByAssigneeBetween(tenantId, technicianId, from, to);

        List<GovernanceMetrics.TimeSeriesPoint> timeSeries = ticketsByDate.entrySet().stream()
                .map(e -> {
                    int tCount = e.getValue();
                    int bCount = breachesByDate.getOrDefault(e.getKey(), 0);
                    double compliance = tCount == 0 ? 100.0 : ((double)(tCount - bCount) / tCount) * 100.0;
                    return new GovernanceMetrics.TimeSeriesPoint(e.getKey(), tCount, compliance);
                })
                .sorted((a, b) -> a.date().compareTo(b.date()))
                .collect(Collectors.toList());

        Map<String, Integer> ticketsByType = ticketQueryPort.countGroupedByProblemTypeByAssigneeBetween(tenantId, technicianId, from, to);
        Map<String, Integer> breachesByType = breachEventRepository.countBreachesGroupedByProblemTypeByAssigneeBetween(tenantId, technicianId, from, to);
        Map<String, Double> complianceByType = ticketsByType.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            int tCount = e.getValue();
                            int bCount = breachesByType.getOrDefault(e.getKey(), 0);
                            return tCount == 0 ? 100.0 : ((double)(tCount - bCount) / tCount) * 100.0;
                        }
                ));

        int open       = ticketQueryPort.countByStatusAndAssigneeBetween(tenantId, technicianId, "OPEN", from, to);
        int inProgress = ticketQueryPort.countByStatusAndAssigneeBetween(tenantId, technicianId, "IN_PROGRESS", from, to);
        int closed     = ticketQueryPort.countByStatusAndAssigneeBetween(tenantId, technicianId, "CLOSED", from, to);

        return new GovernanceMetrics(
                total,
                open,
                inProgress,
                closed,
                breachesTotal,
                complianceTotal,
                ticketQueryPort.avgResolutionMinutesByAssigneeBetween(tenantId, technicianId, from, to),
                ticketsByType,
                Map.of(),
                ticketQueryPort.countGroupedBySlaLevelByAssigneeBetween(tenantId, technicianId, from, to),
                timeSeries,
                complianceByType,
                Map.of(),
                Map.of(),
                from,
                to
        );
    }

    @Override
    public List<TicketSummary> execute(UUID tenantId, UUID technicianId, OffsetDateTime from, OffsetDateTime to, int page, int size) {
        return ticketQueryPort.findClosedTicketsByAssigneeBetween(tenantId, technicianId, from, to, page, size);
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
