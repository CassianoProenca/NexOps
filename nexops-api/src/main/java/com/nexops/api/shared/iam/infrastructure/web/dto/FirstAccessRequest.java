package com.nexops.api.shared.iam.infrastructure.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FirstAccessRequest(
    @NotBlank String token,
    @NotBlank @Size(min = 3) String nome,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String senha,
    @NotBlank String confirmacaoSenha
) {}
