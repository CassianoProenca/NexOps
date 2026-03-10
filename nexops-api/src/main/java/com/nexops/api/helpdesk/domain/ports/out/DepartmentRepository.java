package com.nexops.api.helpdesk.domain.ports.out;

import com.nexops.api.helpdesk.domain.model.Department;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartmentRepository {
    Department save(Department department);
    Optional<Department> findById(UUID id);
    List<Department> findAll();
    List<Department> findAllActive();
}
