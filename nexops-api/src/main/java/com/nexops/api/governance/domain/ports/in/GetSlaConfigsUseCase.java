package com.nexops.api.governance.domain.ports.in;

import com.nexops.api.governance.domain.model.SlaConfig;
import java.util.List;

public interface GetSlaConfigsUseCase {
    List<SlaConfig> execute();
}
