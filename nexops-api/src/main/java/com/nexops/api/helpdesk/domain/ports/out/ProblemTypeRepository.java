package com.nexops.api.helpdesk.domain.ports.out;

import com.nexops.api.helpdesk.domain.model.ProblemType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProblemTypeRepository {
    ProblemType save(ProblemType problemType);
    Optional<ProblemType> findById(UUID id);
    List<ProblemType> findAll();
    List<ProblemType> findAllActive();
}
