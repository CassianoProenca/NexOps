package com.nexops.api.shared.iam.domain.ports.in;

public interface ActivateUserUseCase {
    void execute(String newPassword);
}
