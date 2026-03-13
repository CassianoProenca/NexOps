package com.nexops.api.governance.domain.model;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public class GovernanceMetrics {
    private final int totalTickets;
    private final int openTickets;
    private final int inProgressTickets;
    private final int closedTickets;
    private final int slaBreachCount;
    private final double slaCompliancePercent;
    private final double avgResolutionMinutes;
    private final Map<String, Integer> ticketsByProblemType;
    private final Map<String, Integer> ticketsByTechnician;
    private final Map<String, Integer> ticketsBySlaLevel;
    private final List<TimeSeriesPoint> timeSeries;
    private final Map<String, Double> slaComplianceByProblemType;
    private final Map<String, Double> slaComplianceByTechnician;
    private final Map<String, String> technicianIds; // name → UUID string
    private final OffsetDateTime periodStart;
    private final OffsetDateTime periodEnd;

    public record TimeSeriesPoint(String date, int tickets, double slaCompliance) {}

    public GovernanceMetrics(int totalTickets, int openTickets, int inProgressTickets, int closedTickets,
                             int slaBreachCount, double slaCompliancePercent, double avgResolutionMinutes,
                             Map<String, Integer> ticketsByProblemType, Map<String, Integer> ticketsByTechnician,
                             Map<String, Integer> ticketsBySlaLevel,
                             List<TimeSeriesPoint> timeSeries, Map<String, Double> slaComplianceByProblemType,
                             Map<String, Double> slaComplianceByTechnician,
                             Map<String, String> technicianIds,
                             OffsetDateTime periodStart, OffsetDateTime periodEnd) {
        this.totalTickets = totalTickets;
        this.openTickets = openTickets;
        this.inProgressTickets = inProgressTickets;
        this.closedTickets = closedTickets;
        this.slaBreachCount = slaBreachCount;
        this.slaCompliancePercent = slaCompliancePercent;
        this.avgResolutionMinutes = avgResolutionMinutes;
        this.ticketsByProblemType = ticketsByProblemType;
        this.ticketsByTechnician = ticketsByTechnician;
        this.ticketsBySlaLevel = ticketsBySlaLevel;
        this.timeSeries = timeSeries;
        this.slaComplianceByProblemType = slaComplianceByProblemType;
        this.slaComplianceByTechnician = slaComplianceByTechnician;
        this.technicianIds = technicianIds;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
    }

    public int getTotalTickets() { return totalTickets; }
    public int getOpenTickets() { return openTickets; }
    public int getInProgressTickets() { return inProgressTickets; }
    public int getClosedTickets() { return closedTickets; }
    public int getSlaBreachCount() { return slaBreachCount; }
    public double getSlaCompliancePercent() { return slaCompliancePercent; }
    public double getAvgResolutionMinutes() { return avgResolutionMinutes; }
    public Map<String, Integer> getTicketsByProblemType() { return ticketsByProblemType; }
    public Map<String, Integer> getTicketsByTechnician() { return ticketsByTechnician; }
    public Map<String, Integer> getTicketsBySlaLevel() { return ticketsBySlaLevel; }
    public List<TimeSeriesPoint> getTimeSeries() { return timeSeries; }
    public Map<String, Double> getSlaComplianceByProblemType() { return slaComplianceByProblemType; }
    public Map<String, Double> getSlaComplianceByTechnician() { return slaComplianceByTechnician; }
    public Map<String, String> getTechnicianIds() { return technicianIds; }
    public OffsetDateTime getPeriodStart() { return periodStart; }
    public OffsetDateTime getPeriodEnd() { return periodEnd; }
}
