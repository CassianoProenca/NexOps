package com.nexops.api.shared.iam.infrastructure.web.dto;

public record TokenPairResponse(
    String accessToken,
    String refreshToken,
    String tokenType
) {
    public TokenPairResponse(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, "Bearer");
    }
}
