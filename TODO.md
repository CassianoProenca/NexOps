# NexOps - RoadMap de Implementações Pendentes

Este arquivo documenta o progresso do projeto e as metas para o Core do sistema (Helpdesk).

---

## ✅ Módulos de Configuração (Concluídos)
Configurações base e infraestrutura dinâmica por Tenant.

- [x] **Configurações de Tenant:** CRUD de informações básicas e visualização de status.
- [x] **Gestão de Identidade (IAM):** Usuários, Perfis e Permissões (RBAC).
- [x] **Estrutura Organizacional:** Departamentos e Tipos de Problema (Categorias).
- [x] **SMTP Dinâmico:** Envio real via Mailhog (ou provedor externo) com configuração por tenant e teste de conexão em tempo real.
- [x] **Inteligência Artificial (BYOK):** Integração com Groq (Llama 3) e Google Gemini. Suporte a modelos dinâmicos e segurança de chaves (mascaramento no frontend).

---

## 🚀 Próximo Passo: CORE Helpdesk (O Coração do Sistema)
Foco total na funcionalidade de atendimento e experiência do usuário.

### 1. Fluxo Conversacional de Abertura (End-User)
Transformar a abertura de chamados em um assistente humano, seja com ou sem IA.
- [x] **Triagem via IA:** Extração de título, departamento de origem e categoria a partir da descrição natural (Groq/Gemini).
- [x] **Sugestões de Autoatendimento:** Card de soluções rápidas antes de abrir o ticket.
- [ ] **Modo Manual Assistido (Fallback):** 
    - Implementar chat guiado (Decision Tree) para quando a IA estiver off.
    - O formulário real fica escondido; o chat preenche os campos passo a passo.
    - UX: "Onde você trabalha?" -> "Qual o problema?" -> Ticket gerado.

### 2. Ciclo de Vida do Ticket (Backend & Operacional)
- [ ] **Persistência Real:** Conectar o frontend ao `TicketController` para criação, atribuição e troca de status.
- [ ] **Painel de Fila (Queues):** Distribuição inteligente de chamados baseada no `problem_type` e departamento.
- [ ] **Chat em Tempo Real:** Comunicação técnico-usuário dentro do chamado (Websockets/SSE).
- [ ] **SLA Engine:** Disparo de eventos de breach e contagem de tempo dinâmica (atendimento/resolução).

### 3. Notificações Dinâmicas
- [ ] **Fluxos de E-mail:**
    - "Seu chamado #123 foi aberto com sucesso".
    - "O técnico [Nome] assumiu seu atendimento".
    - "Aguardamos sua resposta no chamado #123".
- [ ] **Alertas de Sistema:** Notificações in-app (Toast/Bell) para atualizações críticas.

---

## 📦 Gestão de Ativos (Inventário)
- [ ] **Vínculo Ticket-Ativo:** Permitir que o usuário/IA identifique o equipamento afetado durante a abertura.
- [ ] **CRUD de Ativos:** Gestão de hardware e software por tenant.

---

## 🛠️ Manutenção e Segurança
- [ ] **Proteção de Endpoints:** Validar todas as permissões (SETTINGS_EDIT, TICKET_VIEW, etc.) em cada controller.
- [ ] **Limpeza de DEV:** Remover o switcher de perfis após homologação final.
