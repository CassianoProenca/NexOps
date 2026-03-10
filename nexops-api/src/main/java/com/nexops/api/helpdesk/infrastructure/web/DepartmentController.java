package com.nexops.api.helpdesk.infrastructure.web;

import com.nexops.api.helpdesk.domain.model.Department;
import com.nexops.api.helpdesk.domain.ports.out.DepartmentRepository;
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
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public List<Department> listAll() {
        return departmentRepository.findAllActive();
    }

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
