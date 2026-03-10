package com.nexops.api.governance.domain.model;

import java.time.OffsetDateTime;
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
    private final OffsetDateTime periodStart;
    private final OffsetDateTime periodEnd;

    public GovernanceMetrics(int totalTickets, int openTickets, int inProgressTickets, int closedTickets, int slaBreachCount, double slaCompliancePercent, double avgResolutionMinutes, Map<String, Integer> ticketsByProblemType, Map<String, Integer> ticketsByTechnician, OffsetDateTime periodStart, OffsetDateTime periodEnd) {
        this.totalTickets = totalTickets;
        this.openTickets = openTickets;
        this.inProgressTickets = inProgressTickets;
        this.closedTickets = closedTickets;
        this.slaBreachCount = slaBreachCount;
        this.slaCompliancePercent = slaCompliancePercent;
        this.avgResolutionMinutes = avgResolutionMinutes;
        this.ticketsByProblemType = ticketsByProblemType;
        this.ticketsByTechnician = ticketsByTechnician;
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
    public OffsetDateTime getPeriodStart() { return periodStart; }
    public OffsetDateTime getPeriodEnd() { return periodEnd; }
}
