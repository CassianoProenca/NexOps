package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.ProblemType;
import com.nexops.api.helpdesk.domain.ports.out.ProblemTypeRepository;
import com.nexops.api.helpdesk.infrastructure.web.dto.ProblemTypeRequest;
import com.nexops.api.helpdesk.infrastructure.web.dto.ProblemTypeResponse;
import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.security.AuthenticatedUser;
import com.nexops.api.shared.security.SecurityContext;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/problem-types")
@RequiredArgsConstructor
@Tag(name = "Problem Types", description = "Problem type management")
public class ProblemTypeController {

    private final ProblemTypeRepository problemTypeRepository;

    @Operation(summary = "List problem types", description = "Retrieve all problem types (active and inactive) for the current tenant")
    @GetMapping
    public List<ProblemTypeResponse> listAll() {
        return problemTypeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Create problem type", description = "Create a new problem type (DEPT_MANAGE only)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProblemTypeResponse create(@RequestBody @Valid ProblemTypeRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        if (user == null) throw new BusinessException("Não autenticado");

        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar tipos de problema");
        }
        
        ProblemType newType = ProblemType.create(
            user.tenantId(), 
            request.name(), 
            request.description(), 
            request.slaLevel()
        );
        return toResponse(problemTypeRepository.save(newType));
    }

    @Operation(summary = "Deactivate problem type", description = "Deactivate an existing problem type by ID (DEPT_MANAGE only)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {
        AuthenticatedUser user = SecurityContext.get();
        if (user == null) throw new BusinessException("Não autenticado");

        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar tipos de problema");
        }
        
        ProblemType pt = problemTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));
        
        if (!pt.getTenantId().equals(user.tenantId())) {
            throw new BusinessException("Acesso negado");
        }
        
        pt.deactivate();
        problemTypeRepository.save(pt);
    }

    @Operation(summary = "Reactivate problem type", description = "Reactivate a previously deactivated problem type (DEPT_MANAGE only)")
    @PatchMapping("/{id}/reactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reactivate(@PathVariable UUID id) {
        AuthenticatedUser user = SecurityContext.get();
        if (user == null) throw new BusinessException("Não autenticado");

        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar tipos de problema");
        }

        ProblemType pt = problemTypeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Tipo de problema não encontrado"));

        if (!pt.getTenantId().equals(user.tenantId())) {
            throw new BusinessException("Acesso negado");
        }

        pt.reactivate();
        problemTypeRepository.save(pt);
    }

    private ProblemTypeResponse toResponse(ProblemType p) {
        return new ProblemTypeResponse(p.getId(), p.getName(), p.getDescription(), p.getSlaLevel(), p.isActive(), p.getCreatedAt());
    }
}
