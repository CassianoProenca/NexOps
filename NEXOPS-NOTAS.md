# NexOps — Notas do Projeto

> Documento vivo. Atualizado conforme as decisões são tomadas.

---

## Paleta de Cores

### Base (Zinc)
| Token | Hex | Uso |
|---|---|---|
| Background | `#fafafa` | zinc-50 — fundo geral |
| Surface | `#ffffff` | cards, painéis |
| Border | `#e4e4e7` | zinc-200 — divisores |
| Sidebar/Nav | `#f4f4f5` | zinc-100 |

### Texto
| Token | Hex | Uso |
|---|---|---|
| Primary | `#18181b` | zinc-900 |
| Secondary | `#71717a` | zinc-500 |
| Muted | `#a1a1aa` | zinc-400 |

### Brand (Azul corporativo — referência Atlassian)
| Token | Hex | Uso |
|---|---|---|
| Primary | `#2563eb` | blue-600 — ações principais |
| Hover | `#1d4ed8` | blue-700 |
| Subtle bg | `#eff6ff` | blue-50 — badges, highlights |

### Semânticas
| Token | Hex | Uso |
|---|---|---|
| Sucesso | `#16a34a` | green-600 |
| Atenção | `#d97706` | amber-600 |
| Erro/crítico | `#dc2626` | red-600 |
| Info | `#0891b2` | cyan-600 |

---

## Decisões de Design

- **Modo:** Light mode como padrão (corporativo)
- **Fonte:** DM Sans (400, 450, 500, 600, 700)
- **Referência visual:** Atlassian/Jira — azul corporativo, zinc base
- **Layout base:** Sidebar + Header + Footer (página própria, sem drawer)
- **Detalhe de chamado:** página própria (não drawer) — necessário pelo volume de informação: chat, timeline, criar filho, anexos

---

## Layout Base (gerado)

Arquivo: `nexops-layout.jsx`

Componentes:
- `Sidebar` — colapsável, navegação por seções, badge de contagem, avatar + logout
- `Header` — sticky, toggle sidebar, busca com ⌘K, botão "Novo Chamado", notificações
- `Footer` — versão do sistema, indicador de status operacional

---

## Perfis de Acesso

| Perfil | Descrição |
|---|---|
| **Usuário Final** | Abre chamados, acompanha os seus |
| **Técnico** | Atende chamados da sua fila de tipo |
| **Gestor** | Supervisiona, reatribui, acessa relatórios |
| **Admin** | Acesso total, configurações do tenant |

---

## Módulo Helpdesk

### Fluxo do Chamado

```
Aberto → Em Andamento → Pausado → Em Andamento → Finalizado
```

- **Prioridade:** calculada internamente por departamento — invisível ao usuário final
- **Fila:** segmentada por tipo de problema. Técnico ao logar já cai na fila do seu tipo
- **"Atender Próximo":** sistema escolhe por prioridade + carga do técnico. Qualquer técnico pode usar
- **Atribuição manual:** só quem tem permissão move chamado entre técnicos
- **Técnico não pode passar chamado** sem permissão. Com permissão, gestor/admin pode reatribuir
- **Pausado:** técnico informa motivo. Chamado permanece em Meus Trabalhos
- **Chamado Filho:** criado pelo técnico dentro do chamado pai. Pai só finaliza quando todos os filhos finalizarem. Filho herda dados do pai e vai direto pra fila do departamento de destino (ex: hardware)

### Estrutura de Categorização
- **Departamento** — origem do chamado (não do usuário, pois pessoas mudam de setor)
- **Tipo de Problema** — cadastrável pelo admin (Hardware, Software, Acessos, etc). Define a fila

### Telas — 11 telas (todas como página própria)

| # | Tela | Perfil |
|---|---|---|
| 1 | Home do usuário final | Usuário Final |
| 2 | Abrir Chamado (formulário + IA) | Usuário Final |
| 3 | Detalhe do Meu Chamado (timeline + chat + anexos) | Usuário Final |
| 4 | Fila de Chamados + botão "Atender Próximo" | Técnico |
| 5 | Meus Trabalhos (chamados atribuídos, filtros por status) | Técnico |
| 6 | Detalhe do Chamado — visão técnico (chat, pausar, finalizar, criar filho) | Técnico |
| 7 | Todos os Chamados (visão global com filtros) | Gestor / Admin |
| 8 | Detalhe do Chamado — visão gestão (+ reatribuir) | Gestor / Admin |
| 9 | Central de Notificações | Todos |
| 10 | Departamentos (CRUD) | Admin |
| 11 | Tipos de Problema (CRUD) | Admin |

---

## Módulos Pendentes de Discussão

- [ ] Inventário
- [ ] Governança / SLA
- [ ] Administração (usuários, roles, configurações do tenant, IA BYOK)
- [ ] Auth (login, primeiro acesso, onboarding do tenant)

---

## Arquivos Gerados

| Arquivo | Descrição |
|---|---|
| `nexops-layout.jsx` | Layout base — Sidebar, Header, Footer |
| `nexops-notas.md` | Este arquivo |