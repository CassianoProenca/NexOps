# NexOps - RoadMap de Implementações Pendentes

Este arquivo lista as funcionalidades que já possuem interface e banco de dados preparados, mas que ainda precisam da lógica de negócio ("vida") no backend.

---

## 1. Inteligência Artificial (BYOK - Ativação do Motor)
**Status Atual:** UI pronta e persistência de chaves de API por Tenant via `tenant_settings` concluída.

### Como vamos fazer:
- [x] **IA Service (Backend):** `AiService` no módulo `shared/ai` implementa `AiCompletionUseCase`.
- [x] **Strategy/Factory Pattern:** `AiProviderAdapter` roteia para `OpenAiProvider`, `GeminiProvider` (aceita `google`/`gemini`), `AnthropicProvider` via switch. `NullAiProvider` para casos inválidos.
- [x] **Instanciação Dinâmica:** `AiService` busca `TenantSettings` (provider, apiKey, model, enabled) no banco a cada chamada.
- [ ] **Integrações Iniciais:**
    - Sugestão automática de solução na abertura de chamados.
    - Categorização baseada no texto do usuário.
    - Resumo de conversas longas em tickets.

---

## 2. SMTP Dinâmico (Envio Real de E-mails)
**Status Atual:** UI original restaurada e persistência de parâmetros SMTP por Tenant concluída.

### Como vamos fazer:
- [x] **DynamicMailService (Backend):** `DynamicMailService` em `shared/tenant/infrastructure/mail` instancia `JavaMailSenderImpl` programaticamente por requisição, sem depender do `application.yaml`.
- [x] **JavaMailSender Manager:** Lê `TenantSettings` (host, porta, user, pass, fromEmail, fromName, useTls) do banco e constrói o sender a cada envio.
- [x] **Endpoint de teste:** `POST /v1/tenant/settings/smtp/test` chama `sender.testConnection()` e retorna resultado ao frontend. Botão "Testar Conexão" na `SmtpPage` integrado com a API real.
- [ ] **Fluxos de Disparo:**
    - Envio de e-mail de convite para novos usuários.
    - Notificação de "Chamado Aberto" e "Chamado Resolvido".
    - Alertas de SLA crítico para técnicos.

---

## 4. Limpeza pós-testes (DEV only)

- [ ] **Remover switcher de perfil de preview** após validar todos os fluxos de permissão:
  1. Deletar `nexops-web/src/hooks/useDevPermissions.ts`
  2. Em `Sidebar.tsx`: remover import de `useDevPermissions` e `FlaskConical`, remover constante `DevProfile`, remover componente `DevProfileSwitcher`, trocar `useDevPermissions(realPermissions)` por `realPermissions`, remover o bloco `{import.meta.env.DEV && <DevProfileSwitcher />}` do JSX
  3. Em `App.tsx`: remover import de `useDevPermissions`, trocar `useDevPermissions(rawPermissions)` por `rawPermissions`

---

## 3. Helpdesk & Operacional
- [ ] **Abertura de Chamados:** Conectar o formulário do usuário ao `TicketController` real.
- [ ] **Painel de Fila (Queues):** Implementar a lógica de distribuição de chamados por departamento.
- [ ] **Gestão de Ativos (Inventário):** Implementar o CRUD real de ativos e vínculo com chamados.
