package com.nexops.api.governance.domain.ports.out;

import com.nexops.api.governance.domain.model.SlaConfig;
import com.nexops.api.helpdesk.domain.model.SlaLevel;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SlaConfigRepository {
    List<SlaConfig> findAll();
    Optional<SlaConfig> findById(UUID id);
    Optional<SlaConfig> findByProblemTypeIdAndSlaLevel(UUID problemTypeId, SlaLevel slaLevel);
    SlaConfig save(SlaConfig config);
}
