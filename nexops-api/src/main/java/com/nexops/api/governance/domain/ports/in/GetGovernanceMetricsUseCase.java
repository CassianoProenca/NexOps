package com.nexops.api.governance.domain.ports.in;

import com.nexops.api.governance.domain.model.GovernanceMetrics;
import java.time.OffsetDateTime;

public interface GetGovernanceMetricsUseCase {
    GovernanceMetrics execute(OffsetDateTime from, OffsetDateTime to);
}
