package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.ProblemType;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.security.AuthenticatedUser;
import com.nexops.api.shared.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/problem-types")
@RequiredArgsConstructor
@Tag(name = "Problem Types", description = "Problem type management")
public class ProblemTypeController {

    private final ProblemTypeRepository problemTypeRepository;

    @Operation(summary = "List problem types", description = "Retrieve all active problem types")
    @GetMapping
    public List<ProblemType> listAll() {
        return problemTypeRepository.findAllActive();
    }

    @Operation(summary = "Create problem type", description = "Create a new problem type (DEPT_MANAGE only)")
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

    @Operation(summary = "Deactivate problem type", description = "Deactivate an existing problem type by ID (DEPT_MANAGE only)")
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
