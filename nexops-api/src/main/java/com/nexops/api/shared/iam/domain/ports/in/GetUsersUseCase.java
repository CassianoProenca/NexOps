package com.nexops.api.shared.iam.domain.ports.in;

import com.nexops.api.shared.iam.domain.model.User;
import java.util.List;

public interface GetUsersUseCase {
    List<User> execute();
}
