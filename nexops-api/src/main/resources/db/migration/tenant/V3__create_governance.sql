-- SLA configurations per problem type
CREATE TABLE sla_configs (
    id              UUID PRIMARY KEY,
    problem_type_id UUID NOT NULL REFERENCES problem_types(id),
    sla_level       VARCHAR(20) NOT NULL,   -- N1, N2, N3
    response_minutes INT NOT NULL,           -- time to first assignment
    resolution_minutes INT NOT NULL,         -- time to close
    notify_manager_at_percent INT NOT NULL DEFAULT 80,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(problem_type_id, sla_level)
);

-- SLA breach events (immutable log)
CREATE TABLE sla_breach_events (
    id          UUID PRIMARY KEY,
    ticket_id   UUID NOT NULL REFERENCES tickets(id),
    breach_type VARCHAR(30) NOT NULL,  -- RESPONSE_BREACH, RESOLUTION_BREACH
    breached_at TIMESTAMPTZ NOT NULL,
    sla_deadline TIMESTAMPTZ NOT NULL,
    minutes_overdue INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification log
CREATE TABLE sla_notifications (
    id              UUID PRIMARY KEY,
    ticket_id       UUID NOT NULL REFERENCES tickets(id),
    recipient_id    UUID NOT NULL,
    notification_type VARCHAR(50) NOT NULL,  -- SLA_WARNING, SLA_BREACH, DAILY_SUMMARY
    channel         VARCHAR(20) NOT NULL,    -- IN_APP, EMAIL
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);

-- Seed: default SLA configs for each SLA level
INSERT INTO sla_configs (id, problem_type_id, sla_level, response_minutes, resolution_minutes, notify_manager_at_percent)
SELECT
    gen_random_uuid(),
    pt.id,
    level.sla_level,
    level.response_minutes,
    level.resolution_minutes,
    80
FROM problem_types pt
CROSS JOIN (VALUES
    ('N1', 30, 120),
    ('N2', 60, 480),
    ('N3', 240, 2880)
) AS level(sla_level, response_minutes, resolution_minutes)
WHERE pt.active = TRUE;
