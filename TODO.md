# NexOps - RoadMap de Implementações Pendentes

Este arquivo lista as funcionalidades que já possuem interface e banco de dados preparados, mas que ainda precisam da lógica de negócio ("vida") no backend.

---

## 1. Inteligência Artificial (BYOK - Ativação do Motor)
**Status Atual:** UI pronta e persistência de chaves de API por Tenant via `tenant_settings` concluída.

### Como vamos fazer:
- [ ] **IA Service (Backend):** Criar um serviço centralizador de IA no módulo `shared`.
- [ ] **Strategy/Factory Pattern:** Implementar o padrão Strategy para suportar múltiplos provedores (OpenAI, Google Gemini, Anthropic).
- [ ] **Instanciação Dinâmica:** O serviço deve buscar a `api_key` e o `provider` do Tenant no banco de dados no momento da requisição.
- [ ] **Integrações Iniciais:**
    - Sugestão automática de solução na abertura de chamados.
    - Categorização baseada no texto do usuário.
    - Resumo de conversas longas em tickets.

---

## 2. SMTP Dinâmico (Envio Real de E-mails)
**Status Atual:** UI original restaurada e persistência de parâmetros SMTP por Tenant concluída.

### Como vamos fazer:
- [ ] **DynamicMailService (Backend):** Criar um serviço de e-mail que ignore as configurações estáticas do `application.yaml`.
- [ ] **JavaMailSender Manager:** Implementar uma lógica que instancie um `JavaMailSenderImpl` programaticamente usando os dados (host, porta, user, pass, tls) recuperados da tabela `tenant_settings`.
- [ ] **Pooling/Cache:** (Opcional) Cachear o objeto de envio por Tenant para evitar re-instanciação frequente, com invalidação quando a config mudar.
- [ ] **Fluxos de Disparo:**
    - Envio de e-mail de convite para novos usuários.
    - Notificação de "Chamado Aberto" e "Chamado Resolvido".
    - Alertas de SLA crítico para técnicos.

---

## 3. Helpdesk & Operacional
- [ ] **Abertura de Chamados:** Conectar o formulário do usuário ao `TicketController` real.
- [ ] **Painel de Fila (Queues):** Implementar a lógica de distribuição de chamados por departamento.
- [ ] **Gestão de Ativos (Inventário):** Implementar o CRUD real de ativos e vínculo com chamados.
