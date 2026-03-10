package com.nexops.api.inventory.domain.ports.out;

import com.nexops.api.inventory.domain.model.Asset;
import com.nexops.api.inventory.domain.model.AssetStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetRepository {
    Asset save(Asset asset);
    Optional<Asset> findById(UUID id);
    List<Asset> findAll();
    List<Asset> findByStatus(AssetStatus status);
    List<Asset> findByAssignedUserId(UUID userId);
    List<Asset> findByAssignedDepartmentId(UUID departmentId);
    boolean existsByPatrimonyNumber(String patrimonyNumber);
}
