package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.model.User;
import com.nexops.api.shared.iam.domain.ports.out.UserRepository;
import com.nexops.api.shared.iam.infrastructure.persistence.mapper.IamMapper;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository jpa;

    public UserRepositoryAdapter(UserJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public User save(User user) {
        return IamMapper.toDomain(jpa.saveAndFlush(IamMapper.toEntity(user)));
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return jpa.findByEmail(email).map(IamMapper::toDomain);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return jpa.findById(id).map(IamMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpa.existsByEmail(email);
    }

    @Override
    public java.util.List<User> findAllByTenantId(UUID tenantId) {
        return jpa.findByTenantId(tenantId).stream()
                .map(IamMapper::toDomain)
                .collect(java.util.stream.Collectors.toList());
    }
}
