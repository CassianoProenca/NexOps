package com.nexops.api.governance.domain.ports.in;

import com.nexops.api.governance.domain.model.GovernanceMetrics;
import java.time.OffsetDateTime;
import java.util.UUID;

public interface GetTechnicianMetricsUseCase {
    GovernanceMetrics execute(UUID technicianId, OffsetDateTime from, OffsetDateTime to);
}
