<div align="center">

# NexOps

**Gestão e Governança de TI — Helpdesk inteligente, controle de ativos e SLA em um único lugar.**

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=flat-square&logo=react)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)]()

[Instagram](https://instagram.com/dev.cassiano) · [LinkedIn](https://www.linkedin.com/in/cassiano-melo-679938326/) · [Repositório](https://github.com/CassianoProenca/NexOps)

</div>

---

## A origem do projeto

Em abril de 2025, entrei como estagiário no setor de TI da Prefeitura de Votorantim. No primeiro dia, percebi que não existia nenhuma plataforma centralizada de helpdesk — chamados chegavam por WhatsApp, ramal e mensagem direta. Nada era rastreado, nada tinha histórico, nada tinha SLA.

Meu encarregado designou a mim e a mais dois estagiários a tarefa de pesquisar uma solução open source para o problema. Eu decidi ir além.

Com conhecimento apenas de Java puro — nunca havia tocado em Spring Boot, React ou qualquer framework moderno — desenvolvi em três meses a primeira versão do sistema de helpdesk que hoje está em produção na prefeitura. Em sete meses de operação, **2.243 chamados foram resolvidos**. O sistema ficou **4 meses sem nenhum patch ou correção de bug**, um recorde interno. A eficiência do time saltou de 15 para 36 chamados resolvidos por dia em média. Os chamados fora dos canais oficiais cessaram completamente. A adesão foi imediata — tanto pelo time de TI quanto pelos usuários finais.

Essa experiência me tornou desenvolvedor oficial da prefeitura ainda como estagiário. E me deu algo mais valioso: entendimento profundo do problema real que o NexOps resolve.

O código daquela primeira versão foi escrito com o conhecimento de um estagiário recém chegado. Funcionou. Mas não estava pronto para ser um produto. O NexOps é a reescrita completa, com arquitetura enterprise, qualidade de código real, e a visão de um sistema que vai além do helpdesk.

---

## O que é o NexOps

O NexOps é um software B2B de **gestão e governança de TI** composto por três pilares:

**Helpdesk inteligente** — abertura de chamados com triagem por IA, sugestões de resolução self-service, chamados pai e filho para problemas encadeados, e chat em tempo real entre técnico e usuário.

**Controle de ativos** — cadastro e movimentação de hardware, vinculação de equipamentos a usuários e setores, histórico completo de ativos, alertas de estoque crítico.

**Governança e SLA** — relatórios automáticos de performance, monitoramento de SLA por técnico e por fila, notificações proativas para gestores sobre indicadores positivos e negativos.

A IA é uma camada opcional. O sistema funciona 100% sem ela — nenhum fluxo depende de um provider externo para operar. Quando configurada, ela age sempre dentro dos limites de permissão do usuário que a acionou.

---

## Contexto acadêmico

Este projeto é o Trabalho de Conclusão de Curso de **Cassiano Augusto Proença Martins de Melo** no curso de **Ciência da Computação** da **Universidade da Cidade de São Paulo — UNICID**, com previsão de conclusão no oitavo semestre.

O TCC documenta o processo completo: da identificação do problema real na prefeitura, passando pelo desenvolvimento da v1 com recursos limitados, até a construção do NexOps como produto comercial com arquitetura enterprise. A mesma base de código serve tanto como entrega acadêmica quanto como produto SaaS em operação.

---

## Arquitetura

### Visão macro

O NexOps adota **Monólito Modular** como estratégia arquitetural principal. Cada módulo tem responsabilidade única, fronteiras bem definidas e pode ser extraído como microsserviço no futuro sem reescrita. Internamente, cada módulo segue **Arquitetura Hexagonal (Ports & Adapters)**, garantindo que o domínio de negócio seja completamente isolado de frameworks, banco de dados e dependências externas.

A comunicação entre módulos acontece exclusivamente via **eventos de domínio** — nenhum módulo acessa diretamente o domínio de outro.

### Multi-tenancy

O sistema é multi-tenant por design, com **isolamento por schema no PostgreSQL**. Cada organização tem seu próprio schema provisionado automaticamente no cadastro. O contexto do tenant é propagado por toda a requisição via `ThreadLocal` e resolvido no nível do datasource pelo Spring.

### Módulos

```
src/main/java/com/nexops/
│
├── helpdesk/                    # Chamados, chat, ciclo de vida, anexos
├── inventory/                   # Ativos, movimentações, estoque
├── governance/                  # SLA, relatórios, métricas, notificações
├── billing/                     # Stripe, contratos, planos por tenant
│
└── shared/
    ├── iam/                     # Usuários, roles, permissions, RBAC com override
    ├── tenant/                  # Provisionamento e contexto de tenant
    ├── ai/                      # AIProvider — OpenAI, Gemini, Anthropic, Null
    ├── storage/                 # StorageProvider — R2, Local
    ├── events/                  # Eventos de domínio compartilhados
    └── security/                # JWT, Spring Security, contexto de autenticação
```

### Estrutura interna de cada módulo (Hexagonal)

```
modulo/
├── domain/
│   ├── model/                   # Aggregates, Entities, Value Objects — Java puro
│   ├── ports/
│   │   ├── in/                  # Casos de uso (interfaces)
│   │   └── out/                 # Repositórios e providers (interfaces)
│   └── service/                 # Implementação dos casos de uso
│
├── application/                 # Orquestração entre casos de uso
│
└── infrastructure/
    ├── persistence/             # JPA, implementação dos repositórios
    ├── web/                     # Controllers REST
    └── [adapter específico]/    # Ex: ai/, stripe/, storage/
```

A regra central da arquitetura hexagonal é inviolável neste projeto: **nada no `domain` importa nada de fora do `domain`**. Nenhuma anotação JPA, nenhuma dependência do Spring, nenhum framework externo. O domínio é Java puro e seus testes rodam sem subir contexto algum.

### RBAC com override por usuário

O controle de acesso segue o modelo **RBAC com attribute override**. Roles definem conjuntos padrão de permissions. Cada usuário herda as permissions dos seus roles e pode ter permissions adicionais ou removidas individualmente pelo administrador do tenant — sem necessidade de criar novos roles para casos específicos.

As permissions são granulares e definidas no código (`TICKET_CREATE`, `INVENTORY_WRITE`, `REPORT_VIEW`). O que o administrador faz é compor roles e ajustar usuários. O JWT carrega as permissions resolvidas, eliminando consultas ao banco a cada requisição.

### Processamento assíncrono

Notificações, envio de e-mails e chamadas para providers de IA são processados de forma assíncrona via **RabbitMQ**. Nenhum request do usuário aguarda operações de I/O externo. O Circuit Breaker está presente em todas as chamadas para providers externos.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Back-end | Java 21 + Spring Boot 3.x |
| Front-end | React + Vite + shadcn/ui + Tailwind CSS |
| Banco de dados | PostgreSQL 16 + Flyway |
| Cache | Redis |
| Fila | RabbitMQ |
| Storage | Cloudflare R2 |
| Autenticação | Spring Security + JWT |
| IA | BYOK — OpenAI, Google Gemini, Anthropic |
| Proxy | Nginx Proxy Manager |
| Containers | Docker Compose |
| CI/CD | GitHub Actions |
| Monitoramento | Uptime Kuma |
| Testes | JUnit 5 + Testcontainers |

---

## Infraestrutura

### Ambientes

O projeto mantém dois ambientes completamente isolados rodando na mesma VPS:

**Produção** — swagger desabilitado, dados reais, deploy automático a partir da branch `main`.

**Teste** — swagger habilitado, dados de demonstração, deploy automático a partir da branch `develop`. Um job mensal automatizado executa limpeza completa do banco, preservando apenas dados marcados como seed para demonstração a clientes.

### Subdomínios

```
nexops.com.br          → Landing page
app.nexops.com.br      → Front-end produção
api.nexops.com.br      → API produção (Swagger OFF)

test.nexops.com.br     → Front-end teste
api-test.nexops.com.br → API teste (Swagger ON)
```

### Composição Docker

```
VPS (KVM4 — 8 vCPUs, 16GB RAM, 200GB NVMe)
└── Docker Compose
    ├── app          # Spring Boot
    ├── postgres     # PostgreSQL 16
    ├── redis        # Cache e rate limiting
    ├── rabbitmq     # Fila de mensagens
    └── nginx        # Nginx Proxy Manager + SSL automático

Storage externo: Cloudflare R2
Monitoramento:   Uptime Kuma
```

### CI/CD

```
push → develop  →  build  →  testes  →  deploy ambiente de teste
push → main     →  build  →  testes  →  deploy produção
```

---

## IA — Bring Your Own Key

O NexOps não cobra pelo uso de IA nem armazena chaves de forma centralizada. Cada tenant configura sua própria chave de API do provider de sua escolha. O custo de uso vai diretamente para a conta do cliente.

Providers suportados: **OpenAI**, **Google Gemini**, **Anthropic Claude**.

Quando nenhuma chave está configurada, o sistema opera normalmente em todos os fluxos. A IA nunca é um ponto único de falha.

---

## Modelo comercial

O NexOps é um SaaS B2B com precificação por número de usuários, negociada diretamente com cada cliente. Não há planos públicos com checkout automático. O onboarding é feito mediante contrato.

A integração com Stripe gerencia a cobrança recorrente após o contrato fechado. A versão utilizada como TCC é idêntica à versão comercial — a única diferença é o módulo de billing desabilitado.

---

## Build in public

O desenvolvimento do NexOps é documentado publicamente no Instagram [@dev.cassiano](https://instagram.com/dev.cassiano), com changelogs semanais incluindo decisões arquiteturais, bugs encontrados em produção, e o que realmente acontece no dia a dia de construir um produto do zero.

---

## Autor

**Cassiano Augusto Proença Martins de Melo**
Desenvolvedor · Estagiário de TI · Prefeitura de Votorantim — SP
Ciência da Computação · UNICID · 7º semestre

[LinkedIn](https://www.linkedin.com/in/cassiano-melo-679938326/) · [Instagram](https://instagram.com/dev.cassiano)

---

<div align="center">
<sub>Iniciado em fevereiro de 2026 · TCC · Produto comercial em desenvolvimento</sub>
</div>
