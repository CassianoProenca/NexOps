package com.nexops.api.shared.security;

import com.nexops.api.shared.tenant.TenantContext;
import com.nexops.api.shared.tenant.domain.ports.out.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final TenantRepository tenantRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor
                .getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Tenant handling
            String tenantSlug = accessor.getFirstNativeHeader("X-Tenant-ID");
            if (tenantSlug != null) {
                // TODO: WebSocket tenant isolation — review when migrating to RabbitMQ STOMP broker
                tenantRepository.findBySlug(tenantSlug).ifPresent(tenant -> {
                    TenantContext.setSlug(tenantSlug);
                    TenantContext.setSchema(tenant.getSchemaName());
                });
            }

            // Auth handling
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtService.isValid(token)) {
                    UUID userId = jwtService.extractUserId(token);
                    Set<String> permissions = jwtService.extractPermissions(token);

                    var authorities = permissions.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    var auth = new UsernamePasswordAuthenticationToken(
                            userId.toString(), null, authorities);
                    accessor.setUser(auth);
                }
            }
        }
        return message;
    }
}
