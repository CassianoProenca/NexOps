package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Department;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
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
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
@Tag(name = "Departments", description = "Department management")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @Operation(summary = "List departments", description = "Retrieve all active departments")
    @GetMapping
    public List<Department> listAll() {
        return departmentRepository.findAllActive();
    }

    @Operation(summary = "Create department", description = "Create a new department (DEPT_MANAGE only)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Department create(@RequestBody Department department) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar departamentos");
        }
        Department newDept = Department.create(department.getName(), department.getDescription());
        return departmentRepository.save(newDept);
    }

    @Operation(summary = "Deactivate department", description = "Deactivate an existing department by ID (DEPT_MANAGE only)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id) {
        AuthenticatedUser user = SecurityContext.get();
        if (!user.hasPermission("DEPT_MANAGE")) {
            throw new AccessDeniedException("Sem permissão para gerenciar departamentos");
        }
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Departamento não encontrado"));
        dept.deactivate();
        departmentRepository.save(dept);
    }
}
