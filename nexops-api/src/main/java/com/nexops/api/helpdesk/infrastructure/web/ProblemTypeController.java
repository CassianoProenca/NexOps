package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.ProblemType;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.security.AuthenticatedUser;
import com.nexops.api.shared.security.SecurityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/problem-types")
@RequiredArgsConstructor
public class ProblemTypeController {

    private final ProblemTypeRepository problemTypeRepository;

    @GetMapping
    public List<ProblemType> listAll() {
        return problemTypeRepository.findAllActive();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemType create(@RequestBody ProblemType problemType) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar tipos de problema");
        }
        ProblemType newType = ProblemType.create(problemType.getName(), problemType.getDescription(), problemType.getSlaLevel());
        return problemTypeRepository.save(newType);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar tipos de problema");
        }
        ProblemType type = problemTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));
        type.deactivate();
        problemTypeRepository.save(type);
    }
}
