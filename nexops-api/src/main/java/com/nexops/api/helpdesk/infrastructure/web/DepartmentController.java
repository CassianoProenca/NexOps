package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Department;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
import com.nexops.api.helpdesk.infrastructure.web.dto.DepartmentRequest;
import com.nexops.api.helpdesk.infrastructure.web.dto.DepartmentResponse;
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
@RequestMapping("/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @Operation(summary = "List departments", description = "Retrieve all departments (active and inactive) for the current tenant")
    @GetMapping
    public List<DepartmentResponse> listAll() {
        return departmentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Operation(summary = "Create department", description = "Create a new department (DEPT_MANAGE only)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponse create(@RequestBody @Valid DepartmentRequest request) {
        AuthenticatedUser user = SecurityContext.get();
        if (user == null) throw new BusinessException("Não autenticado");
        
        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar departamentos");
        }
        
        Department newDept = Department.create(user.tenantId(), request.name(), request.description());
        return toResponse(departmentRepository.save(newDept));
    }

    @Operation(summary = "Deactivate department", description = "Deactivate an existing department by ID (DEPT_MANAGE only)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {
        AuthenticatedUser user = SecurityContext.get();
        if (user == null) throw new BusinessException("Não autenticado");

        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar departamentos");
        }
        
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Departamento não encontrado"));
        
        if (!dept.getTenantId().equals(user.tenantId())) {
            throw new BusinessException("Acesso negado");
        }
        
        dept.deactivate();
        departmentRepository.save(dept);
    }

    @Operation(summary = "Reactivate department", description = "Reactivate a previously deactivated department (DEPT_MANAGE only)")
    @PatchMapping("/{id}/reactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reactivate(@PathVariable UUID id) {
        AuthenticatedUser user = SecurityContext.get();
        if (user == null) throw new BusinessException("Não autenticado");

        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar departamentos");
        }

        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Departamento não encontrado"));

        if (!dept.getTenantId().equals(user.tenantId())) {
            throw new BusinessException("Acesso negado");
        }

        dept.reactivate();
        departmentRepository.save(dept);
    }

    private DepartmentResponse toResponse(Department d) {
        return new DepartmentResponse(d.getId(), d.getName(), d.getDescription(), d.isActive(), d.getCreatedAt());
    }
}
