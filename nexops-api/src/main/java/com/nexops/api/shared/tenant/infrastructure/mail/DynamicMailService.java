package com.nexops.api.shared.tenant.infrastructure.mail;

import com.nexops.api.shared.exception.BusinessException;
import com.nexops.api.shared.tenant.domain.model.TenantSettings;
import com.nexops.api.shared.tenant.domain.ports.in.SendEmailUseCase;
import com.nexops.api.shared.tenant.domain.ports.in.TestSmtpConnectionUseCase;
import com.nexops.api.shared.tenant.domain.ports.out.TenantSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DynamicMailService implements SendEmailUseCase, TestSmtpConnectionUseCase {

    private final TenantSettingsRepository settingsRepository;

    @Override
    public void send(UUID tenantId, String to, String subject, String htmlBody) {
        var sender = buildSender(tenantId);
        var settings = requireSettings(tenantId);
        try {
            var message = sender.createMimeMessage();
            var helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(settings.getSmtpFromEmail(), settings.getSmtpFromName() != null ? settings.getSmtpFromName() : settings.getSmtpFromEmail());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            sender.send(message);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Falha ao enviar e-mail: " + e.getMessage());
        }
    }

    @Override
    public void test(String host, Integer port, String user, String pass, Boolean useTls) {
        if (host == null || host.isBlank()) {
            throw new BusinessException("Servidor SMTP não informado");
        }

        var sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port != null ? port : 587);
        
        if (user != null && !user.isBlank()) {
            sender.setUsername(user);
            sender.setPassword(pass);
        }

        var props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        
        if (user != null && !user.isBlank()) {
            props.put("mail.smtp.auth", "true");
        } else {
            props.put("mail.smtp.auth", "false");
        }

        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.connectiontimeout", "5000");
        
        if (Boolean.TRUE.equals(useTls)) {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        }

        try {
            sender.testConnection();
        } catch (Exception e) {
            throw new BusinessException("Falha ao conectar ao servidor SMTP: " + e.getMessage());
        }
    }

    private JavaMailSenderImpl buildSender(UUID tenantId) {
        var settings = requireSettings(tenantId);

        if (settings.getSmtpHost() == null || settings.getSmtpHost().isBlank()) {
            throw new BusinessException("SMTP não configurado para este tenant");
        }

        var sender = new JavaMailSenderImpl();
        sender.setHost(settings.getSmtpHost());
        sender.setPort(settings.getSmtpPort() != null ? settings.getSmtpPort() : 587);
        
        boolean hasAuth = settings.getSmtpUsername() != null && !settings.getSmtpUsername().isBlank();
        if (hasAuth) {
            sender.setUsername(settings.getSmtpUsername());
            sender.setPassword(settings.getSmtpPassword());
        }
        
        sender.setDefaultEncoding("UTF-8");

        var props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", hasAuth ? "true" : "false");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.connectiontimeout", "10000");
        
        if (Boolean.TRUE.equals(settings.getSmtpUseTls())) {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        }

        return sender;
    }

    private TenantSettings requireSettings(UUID tenantId) {
        return settingsRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new BusinessException("Configurações de e-mail não encontradas para este tenant"));
    }
}
