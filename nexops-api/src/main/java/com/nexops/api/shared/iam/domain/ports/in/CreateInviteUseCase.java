package com.nexops.api.shared.iam.domain.ports.in;

public interface CreateInviteUseCase {
    String execute(String email); // returns raw token
}
