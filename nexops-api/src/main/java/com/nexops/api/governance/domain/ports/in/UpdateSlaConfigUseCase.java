package com.nexops.api.governance.domain.ports.in;

import com.nexops.api.governance.domain.model.SlaConfig;
import java.util.UUID;

public interface UpdateSlaConfigUseCase {
    SlaConfig execute(UUID slaConfigId, int responseMinutes,
                      int resolutionMinutes, int notifyManagerAtPercent);
}
