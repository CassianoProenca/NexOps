package com.nexops.api.shared.iam.infrastructure.persistence;

import com.nexops.api.shared.iam.domain.model.RefreshToken;
import com.nexops.api.shared.iam.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying @Query("UPDATE RefreshToken t SET t.revoked = true WHERE t.user = :user")
    void revokeAllByUser(User user);
}
