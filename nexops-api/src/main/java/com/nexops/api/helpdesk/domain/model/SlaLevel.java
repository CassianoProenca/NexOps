package com.nexops.api.helpdesk.domain.model;

public enum SlaLevel {
    N1(4),
    N2(8),
    N3(24);

    private final int hours;

    SlaLevel(int hours) { this.hours = hours; }

    public int getHours() { return hours; }
}
