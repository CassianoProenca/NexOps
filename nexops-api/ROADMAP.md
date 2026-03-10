# NexOps API — Roadmap Técnico

> Gerado em 2026-03-10 a partir da leitura direta dos arquivos do projeto.

---

## 1. Estado Atual

| Pacote / Camada | Status | Observações |
|---|---|---|
| **shared/config** | | |
| `SecurityConfig` | ✅ Completo | Spring Security + CORS + JWT filter |
| **shared/security** | | |
| `JwtService` | ✅ Completo | Geração, parsing e validação de JWT |
| `JwtAuthFilter` | ✅ Completo | Intercepta requests, popula SecurityContext |
| `SecurityContext` | ✅ Completo | ThreadLocal holder do usuário autenticado |
| `AuthenticatedUser` | ✅ Completo | Record com userId, tenantId, permissions |
| `JwtProperties` | ✅ Completo | `@ConfigurationProperties` para secret/expiration |
| **shared/iam — domain** | | |
| `User` (model) | ✅ Completo | Java puro, sem Spring/JPA. Resolve permissions (role + overrides) |
| `Role` (model) | ✅ Completo | Imutável, com Set<Permission> |
| `Permission` (model) | ✅ Completo | code + description + module |
| `RefreshToken` (model) | ✅ Completo | Sem anotações de framework |
| `UserStatus` (enum) | ✅ Completo | PENDING, ACTIVE, SUSPENDED |
| `UserRepository` (port out) | ✅ Completo | Interface de persistência do domínio |
| `RefreshTokenRepository` (port out) | ✅ Completo | Interface de persistência do domínio |
| `RefreshTokenService` (domain service) | ✅ Completo | Lógica de negócio de refresh tokens |
| **shared/iam — infrastructure** | | |
| `UserJpaEntity` | ✅ Completo | @Entity com mapeamento JPA completo |
| `RoleJpaEntity` | ✅ Completo | @Entity com join table role_permissions |
| `PermissionJpaEntity` | ✅ Completo | @Entity simples |
| `RefreshTokenJpaEntity` | ✅ Completo | @Entity com token_hash |
| `UserJpaRepository` | ✅ Completo | Spring Data JPA, findByEmail |
| `RefreshTokenJpaRepository` | ✅ Completo | Spring Data JPA, findByTokenHash |
| `UserRepositoryAdapter` | ✅ Completo | Implementa port out |
| `RefreshTokenRepositoryAdapter` | ✅ Completo | Implementa port out |
| `IamMapper` | ✅ Completo | Domain ↔ JPA entity |
| `AuthController` (web adapter) | ❌ Pendente | POST /auth/login, /auth/refresh, /auth/logout |
| `InviteService` (domain service) | ❌ Pendente | Envio, validação e aceitação de convites |
| `InviteRepository` (port out) | ❌ Pendente | Interface para invite_tokens |
| `UserManagementService` (domain service) | ❌ Pendente | CRUD de usuários e roles |
| `UserController` (web adapter) | ❌ Pendente | GET/PUT /admin/users, GET/PUT /admin/roles |
| **shared/tenant — domain** | | |
| `Tenant` (model) | ✅ Completo | Java puro, com schema_name, status, plan |
| `TenantStatus` (enum) | ✅ Completo | ACTIVE, SUSPENDED, CANCELLED |
| `TenantRepository` (port out) | ✅ Completo | Interface de persistência |
| `TenantProvisioningService` (domain service) | ❌ Pendente | Cria schema + executa migrations Flyway |
| **shared/tenant — infrastructure** | | |
| `TenantContext` | ✅ Completo | ThreadLocal com schema do tenant corrente |
| `TenantAwareDataSource` | ✅ Completo | AbstractRoutingDataSource, roteia pelo TenantContext |
| `TenantSchemaInterceptor` | ✅ Completo | Hibernate StatementInspector — seta search_path |
| `TenantSchemaFilter` | ✅ Completo | Servlet filter, extrai X-Tenant-ID e popula TenantContext |
| `DataSourceConfig` | ✅ Completo | Configura TenantAwareDataSource |
| `TenantJpaEntity` | ✅ Completo | @Entity mapeando public.tenants |
| `TenantJpaRepository` | ✅ Completo | Spring Data JPA, findBySlug |
| `TenantRepositoryAdapter` | ✅ Completo | Implementa TenantRepository port |
| `TenantMapper` | ✅ Completo | Domain ↔ JPA entity |
| `TenantController` (web adapter) | ❌ Pendente | POST /tenants (provisionamento) |
| **Migrations** | | |
| `public/V1__create_tenants.sql` | ✅ Completo | Tabela tenants no schema público |
| `tenant/V1__create_iam.sql` | ✅ Completo | IAM completo + seed de roles/permissions |
| **Módulo helpdesk** | ❌ Pendente | Nenhum arquivo criado |
| **Módulo inventory** | ❌ Pendente | Nenhum arquivo criado |
| **Módulo governance** | ❌ Pendente | Nenhum arquivo criado |
| **Módulo billing** | ❌ Pendente | Nenhum arquivo criado |
| **shared/ai** | ❌ Pendente | AIProvider interface + implementações |
| **shared/storage** | ❌ Pendente | StorageProvider interface + implementações |
| **shared/events** | ❌ Pendente | RabbitMQ event bus |

---

## 2. Stack e Versões Fixadas 🔒

> Derivado do `pom.xml`. Não alterar sem revisão.

| groupId:artifactId | Versão | Escopo |
|---|---|---|
| `org.springframework.boot:spring-boot-starter-parent` | **4.0.3** | parent |
| `org.springframework.boot:spring-boot-starter-web` | (BOM 4.0.3) | compile |
| `org.springframework.boot:spring-boot-starter-websocket` | (BOM) | compile |
| `org.springframework.boot:spring-boot-starter-validation` | (BOM) | compile |
| `org.springframework.boot:spring-boot-starter-security` | (BOM) | compile |
| `io.jsonwebtoken:jjwt-api` | **0.12.6** | compile |
| `io.jsonwebtoken:jjwt-impl` | **0.12.6** | runtime |
| `io.jsonwebtoken:jjwt-jackson` | **0.12.6** | runtime |
| `org.springframework.boot:spring-boot-starter-data-jpa` | (BOM) | compile |
| `org.postgresql:postgresql` | (BOM) | runtime |
| `org.springframework.boot:spring-boot-starter-flyway` | (BOM) | compile |
| `org.flywaydb:flyway-database-postgresql` | (BOM) | compile |
| `org.springframework.boot:spring-boot-starter-data-redis` | (BOM) | compile |
| `org.springframework.boot:spring-boot-starter-amqp` | (BOM) | compile |
| `org.springframework.boot:spring-boot-starter-mail` | (BOM) | compile |
| `org.springframework.boot:spring-boot-starter-actuator` | (BOM) | compile |
| `org.springdoc:springdoc-openapi-starter-webmvc-ui` | **3.0.2** | compile |
| `org.projectlombok:lombok` | (BOM) | optional |
| `org.springframework.boot:spring-boot-devtools` | (BOM) | runtime/optional |
| `org.springframework.boot:spring-boot-starter-test` | (BOM) | test |
| `org.springframework.security:spring-security-test` | (BOM) | test |
| `org.springframework.boot:spring-boot-testcontainers` | (BOM) | test |
| `org.testcontainers:testcontainers-bom` | **1.21.0** | BOM import |
| `org.testcontainers:junit-jupiter` | (TC BOM) | test |
| `org.testcontainers:postgresql` | (TC BOM) | test |
| `org.testcontainers:rabbitmq` | (TC BOM) | test |

**Runtime:** Java **21** | Maven Wrapper (`./mvnw`)

---

## 3. Decisões Arquiteturais Fixadas 🔒

### 3.1 Hexagonal — Estrutura Obrigatória de Módulo

Todo módulo de negócio segue exatamente esta árvore:

```
com.nexops.api.{modulo}/
├── domain/
│   ├── model/          → Entidades e Value Objects puros (sem Spring/JPA)
│   ├── ports/
│   │   ├── in/         → Use case interfaces (chamadas do exterior → domínio)
│   │   └── out/        → Repository/gateway interfaces (domínio → exterior)
│   └── service/        → Implementação dos use cases (pode ter @Service)
├── application/        → DTOs de entrada/saída, assemblers, mappers de request/response
└── infrastructure/
    ├── persistence/
    │   ├── entity/     → @Entity JPA
    │   ├── mapper/     → Domain ↔ JPA entity mapping
    │   ├── *JpaRepository.java   → Spring Data JPA interface
    │   └── *RepositoryAdapter.java  → Implementa port out
    └── web/
        └── *Controller.java     → @RestController, chama use cases de port in
```

**Exemplo concreto — módulo helpdesk:**

```
com.nexops.api.helpdesk/
├── domain/
│   ├── model/
│   │   ├── Ticket.java
│   │   ├── TicketStatus.java
│   │   ├── TicketPriority.java
│   │   ├── TicketComment.java
│   │   └── Department.java
│   ├── ports/
│   │   ├── in/
│   │   │   ├── CreateTicketUseCase.java
│   │   │   ├── AttendTicketUseCase.java
│   │   │   └── CloseTicketUseCase.java
│   │   └── out/
│   │       ├── TicketRepository.java
│   │       └── DepartmentRepository.java
│   └── service/
│       └── TicketService.java
├── application/
│   ├── CreateTicketRequest.java
│   ├── TicketResponse.java
│   └── TicketAssembler.java
└── infrastructure/
    ├── persistence/
    │   ├── entity/
    │   │   └── TicketJpaEntity.java
    │   ├── mapper/
    │   │   └── TicketMapper.java
    │   ├── TicketJpaRepository.java
    │   └── TicketRepositoryAdapter.java
    └── web/
        └── TicketController.java
```

### 3.2 Regra do Domínio Puro

**Proibido em `domain/model/` e `domain/ports/`:**
- `@Entity`, `@Table`, `@Column`, `@Id`, `@GeneratedValue` (jakarta.persistence.*)
- `@Getter`, `@Setter`, `@Builder`, `@Data` (Lombok)
- `jakarta.*` (Persistence, Validation)
- `org.springframework.*`

**Permitido em `domain/model/`:**
- Java puro: `record`, `class`, `enum`, `interface`
- `java.util.*`, `java.time.*`, `java.util.UUID`
- Construtores, getters manuais, métodos de domínio

**Permitido em `domain/service/`:**
- `@Service` (pragmatismo — permite injeção Spring sem poluir modelo)
- Interfaces de `domain/ports/in` e `domain/ports/out`

**`infrastructure/` pode usar tudo:** `@Entity`, Lombok (`@Getter`, `@Builder`, etc.), JPA, Spring.

### 3.3 Multi-Tenancy

**Fluxo completo por request:**
1. `TenantSchemaFilter` (Servlet Filter) extrai o header `X-Tenant-ID` do request
2. Busca o slug na tabela `public.tenants` para obter o `schema_name`
3. Armazena em `TenantContext` (ThreadLocal)
4. `TenantAwareDataSource` (AbstractRoutingDataSource) retorna a key do schema atual
5. `TenantSchemaInterceptor` (Hibernate StatementInspector) injeta `SET search_path = {schema_name}` antes de cada SQL

**Provisionamento de novo tenant:**
- `TenantProvisioningService` (a ser implementado) cria o schema PostgreSQL e executa as migrations de `db/migration/tenant/` via Flyway programático
- Nunca via `flyway.locations` no `application.yaml` (que é exclusivo do schema `public`)

**Regra:** Nenhum código de domínio lê diretamente o `TenantContext`. Apenas a camada de infraestrutura (datasource/interceptor) usa o ThreadLocal.

### 3.4 RBAC e Permissões

**Resolução de permissões no login:**
1. Carrega os roles do usuário
2. Expande para o conjunto de permission codes
3. Aplica overrides da tabela `user_permission_overrides` (granted=true adiciona, granted=false remove)
4. Resultado vai como claim `permissions` no JWT (lista de strings)

**Verificação em runtime:**
```java
SecurityContext.get().hasPermission("TICKET_CREATE");
```

**Proteção de endpoints via anotação customizada** (a ser criado):
```java
@RequiresPermission("TICKET_VIEW_ALL")
```

### 3.5 IDs

- UUID gerado no **domínio**, nunca pelo banco
- Domínio: `UUID.randomUUID()` no construtor da entidade
- JPA: `@Column(updatable = false)` + sem `@GeneratedValue`

### 3.6 Lombok

- **Somente** em `infrastructure/` (entities JPA, adapters, mappers, controllers)
- Proibido em `domain/`

### 3.7 Comunicação Entre Módulos

- **Proibida** chamada direta entre domínios (ex.: helpdesk importar classe de inventory)
- **Obrigatório** usar domain events via RabbitMQ
- Eventos publicados pelo módulo de origem, consumidos pelo módulo de destino
- Interface: `DomainEventPublisher` em `shared/events/`

---

## 4. Convenções de Nomenclatura

| Tipo de classe | Sufixo | Exemplo | Pacote |
|---|---|---|---|
| Entidade de domínio | (nenhum) | `Ticket`, `User` | `domain/model/` |
| Enum de domínio | (nenhum) | `TicketStatus`, `UserStatus` | `domain/model/` |
| Use case (port in) | `UseCase` | `CreateTicketUseCase` | `domain/ports/in/` |
| Repository (port out) | `Repository` | `TicketRepository` | `domain/ports/out/` |
| Gateway (port out, serviço externo) | `Gateway` | `EmailGateway` | `domain/ports/out/` |
| Serviço de domínio | `Service` | `TicketService` | `domain/service/` |
| DTO de request | `Request` | `CreateTicketRequest` | `application/` |
| DTO de response | `Response` | `TicketResponse` | `application/` |
| Assembler/Mapper (application) | `Assembler` | `TicketAssembler` | `application/` |
| Entidade JPA | `JpaEntity` | `TicketJpaEntity` | `infrastructure/persistence/entity/` |
| Spring Data repository | `JpaRepository` | `TicketJpaRepository` | `infrastructure/persistence/` |
| Adapter de persistência | `RepositoryAdapter` | `TicketRepositoryAdapter` | `infrastructure/persistence/` |
| Mapper domain ↔ JPA | `Mapper` | `TicketMapper` | `infrastructure/persistence/mapper/` |
| Controller REST | `Controller` | `TicketController` | `infrastructure/web/` |
| Adapter de serviço externo | `Adapter` | `RabbitMqEventAdapter` | `infrastructure/` |
| Configuração Spring | `Config` | `SecurityConfig`, `DataSourceConfig` | `shared/config/` ou `infrastructure/` |
| Propriedades `@ConfigurationProperties` | `Properties` | `JwtProperties` | `shared/security/config/` |
| Filtro Servlet | `Filter` | `TenantSchemaFilter` | `infrastructure/` |

---

## 5. Padrão de Migrations

### Estrutura de diretórios

```
src/main/resources/db/
├── migration/
│   ├── public/          → Schema público (tenants table, etc.)
│   │   └── V1__create_tenants.sql
│   └── tenant/          → Schema por tenant (IAM, helpdesk, etc.)
│       └── V1__create_iam.sql
```

### Nomenclatura

```
V{N}__{descricao_em_snake_case}.sql
```
- `N`: número inteiro sequencial (1, 2, 3, ...)
- Dois underscores antes da descrição
- Descrição: snake_case, sem acentos

### Regras

1. **Nunca alterar** uma migration já aplicada (qualquer mudança quebrará o checksum do Flyway)
2. Para correções, criar nova migration `V{N+1}__fix_{descricao}.sql`
3. Migrations `public/` são executadas pelo Flyway automático do Spring Boot (configurado em `application.yaml`)
4. Migrations `tenant/` são executadas **programaticamente** pelo `TenantProvisioningService` usando Flyway em modo programático no schema do novo tenant

### Exemplo de nova migration helpdesk

```sql
-- V2__create_helpdesk.sql (em tenant/)
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE problem_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('N1', 'N2', 'N3')),
    department_id UUID REFERENCES departments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- ... resto do schema
```

---

## 6. Padrão de Endpoints REST

### Base URL

```
/api/v1/{modulo}
```

Exemplos:
- `POST   /api/v1/auth/login`
- `GET    /api/v1/helpdesk/tickets`
- `PUT    /api/v1/inventory/assets/:id`
- `GET    /api/v1/governance/sla/config`
- `GET    /api/v1/admin/users`

### Formato de Erro Padronizado

```json
{
  "timestamp": "2026-03-10T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Número de patrimônio já cadastrado",
  "path": "/api/v1/inventory/assets"
}
```

Implementar via `@RestControllerAdvice` em `shared/config/GlobalExceptionHandler.java`.

### Autenticação

- Header: `Authorization: Bearer {access_token}`
- Header de tenant: `X-Tenant-ID: {tenant_slug}`
- Rotas públicas (sem auth): `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/actuator/health`

### Paginação Padrão

```
GET /api/v1/helpdesk/tickets?page=0&size=20&sort=createdAt,desc
```

Response com `Page<T>` do Spring Data:
```json
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 8,
  "number": 0,
  "size": 20
}
```

---

## 7. Roadmap Detalhado por Módulo

---

### 7.1 shared/iam — AuthController + InviteService

**Prioridade:** Alta — necessário para conectar o frontend

#### O que implementar

**`AuthController`** (`infrastructure/web/AuthController.java`):

```
POST /api/v1/auth/login
  Body: { email, password }
  Response: { accessToken, refreshToken, user: { id, name, email, permissions[] } }

POST /api/v1/auth/refresh
  Body: { refreshToken }
  Response: { accessToken, refreshToken }

POST /api/v1/auth/logout
  Body: { refreshToken }
  Response: 204 No Content

POST /api/v1/auth/first-access
  Body: { token (invite), password, confirmPassword }
  Response: { accessToken, refreshToken }
```

**`LoginUseCase`** (`domain/ports/in/LoginUseCase.java`):
- Input: email, password, tenantSchema
- Valida senha com BCrypt
- Verifica status do usuário (ACTIVE)
- Resolve permissões (roles + overrides)
- Gera access token (JwtService) e refresh token (RefreshTokenService)

**`InviteService`** (`domain/service/InviteService.java`):
- `sendInvite(email, roleId)` — gera token hash, persiste em invite_tokens, dispara email via EmailGateway
- `validateInvite(token)` — verifica se existe, não expirado, não usado
- `acceptInvite(token, password)` — cria User com status ACTIVE, atribui role, marca invite como usado

**`InviteRepository`** (`domain/ports/out/InviteRepository.java`):
- `save(InviteToken)`
- `findByTokenHash(String)`
- `markAsUsed(UUID)`

**Migration necessária:** nenhuma (tabela `invite_tokens` já existe em `V1__create_iam.sql`)

**`EmailGateway`** (`domain/ports/out/EmailGateway.java`):
- `sendInviteEmail(String toEmail, String inviteLink)`
- `sendPasswordResetEmail(String toEmail, String resetLink)`
- Implementação: `SmtpEmailGatewayAdapter` usando `JavaMailSender`

---

### 7.2 shared/iam — UserManagementController

**Prioridade:** Média — necessário para tela de Usuários e Perfis no frontend

#### O que implementar

**`UserController`** (`infrastructure/web/UserController.java`):

```
GET    /api/v1/admin/users?page=0&size=20&search=&status=
  Response: Page<UserResponse>

GET    /api/v1/admin/users/:id
  Response: UserResponse (com roles e overrides)

POST   /api/v1/admin/users/invite
  Body: { email, roleId }
  Permissão: USER_INVITE

PUT    /api/v1/admin/users/:id/status
  Body: { status: ACTIVE | SUSPENDED }
  Permissão: USER_MANAGE

PUT    /api/v1/admin/users/:id/roles
  Body: { roleIds: UUID[] }
  Permissão: USER_MANAGE

PUT    /api/v1/admin/users/:id/permissions
  Body: { overrides: { permissionId, granted }[] }
  Permissão: USER_MANAGE

GET    /api/v1/admin/roles
  Response: Role[]
  Permissão: ROLE_MANAGE

POST   /api/v1/admin/roles
  Body: { name, description, permissionIds[] }
  Permissão: ROLE_MANAGE

PUT    /api/v1/admin/roles/:id
  Permissão: ROLE_MANAGE

GET    /api/v1/admin/permissions
  Response: Permission[] (todos os do sistema)
```

---

### 7.3 shared/tenant — TenantProvisioningService + TenantController

**Prioridade:** Alta — necessário para onboarding de novos clientes

#### O que implementar

**`TenantProvisioningService`** (`domain/service/TenantProvisioningService.java`):
- `provision(String name, String slug)`:
  1. Gera `schema_name` = `tenant_` + slug (ex.: `tenant_prefeitura_votorantim`)
  2. Cria Tenant domain object com UUID gerado no domínio
  3. Persiste via TenantRepository
  4. Executa Flyway programático no novo schema:
     ```java
     Flyway.configure()
         .dataSource(dataSource)
         .schemas(schemaName)
         .locations("classpath:db/migration/tenant")
         .load()
         .migrate();
     ```
  5. Publica evento `TenantProvisionedEvent`

**`TenantController`** (`infrastructure/web/TenantController.java`):

```
POST /api/v1/tenants
  Body: { name, slug, plan, maxUsers }
  Auth: super-admin token (sem tenant context)
  Response: { id, name, slug, schemaName, status }

GET  /api/v1/tenants/:slug/status
  Response: { status, plan, maxUsers, userCount }
```

---

### 7.4 Módulo helpdesk

**Prioridade:** Alta — core do produto

#### Migration

**`tenant/V2__create_helpdesk.sql`:**

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE problem_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(5) NOT NULL CHECK (tier IN ('N1', 'N2', 'N3')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE ticket_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'RESOLVED', 'CLOSED', 'CANCELLED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status NOT NULL DEFAULT 'OPEN',
    priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
    tier VARCHAR(5) NOT NULL DEFAULT 'N1',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    problem_type_id UUID REFERENCES problem_types(id) ON DELETE SET NULL,
    requester_id UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_at TIMESTAMPTZ,
    first_response_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    sla_deadline TIMESTAMPTZ,
    parent_ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL
);

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    body TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    size_bytes BIGINT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tickets_requester ON tickets(requester_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_opened_at ON tickets(opened_at DESC);
```

#### Domain Models

- `Ticket`: id, title, description, status (enum), priority (enum), tier, departmentId, problemTypeId, requesterId, assignedTo (nullable), openedAt, resolvedAt, slaDeadline, parentTicketId, comments (List<TicketComment>)
- `TicketStatus`: OPEN, ASSIGNED, IN_PROGRESS, PAUSED, RESOLVED, CLOSED, CANCELLED
- `TicketPriority`: LOW, MEDIUM, HIGH, CRITICAL
- `TicketComment`: id, ticketId, authorId, body, isInternal, createdAt
- `Department`: id, name, description
- `ProblemType`: id, name, tier, departmentId

Métodos de domínio em `Ticket`:
- `assign(UUID technicianId)` — muda status para ASSIGNED
- `startProgress()` — ASSIGNED → IN_PROGRESS, seta firstResponseAt se nulo
- `pause(String reason)` — IN_PROGRESS → PAUSED
- `resolve()` — → RESOLVED, seta resolvedAt
- `close()` — RESOLVED → CLOSED
- `cancel()` — → CANCELLED
- `addComment(TicketComment)` — valida regras (usuário final não pode adicionar nota interna)

#### Ports

**In:**
- `CreateTicketUseCase`: `Ticket create(CreateTicketCommand command)`
- `AttendTicketUseCase`: `Ticket attend(UUID ticketId, UUID technicianId)`
- `UpdateTicketStatusUseCase`: `Ticket updateStatus(UUID ticketId, TicketStatus newStatus, UUID actorId)`
- `AddCommentUseCase`: `TicketComment addComment(UUID ticketId, AddCommentCommand command)`
- `AssignTicketUseCase`: `Ticket assign(UUID ticketId, UUID technicianId, UUID actorId)`

**Out:**
- `TicketRepository`: save, findById, findByRequesterId, findAll(filters, pageable), findAssignedTo(UUID)
- `DepartmentRepository`: save, findAll, findById, deleteById
- `ProblemTypeRepository`: save, findAll, findByDepartmentId, findById, deleteById
- `TicketEventPublisher`: `publish(TicketCreatedEvent)`, `publish(TicketAssignedEvent)`, etc.

#### Endpoints

```
# Helpdesk — usuário final
POST   /api/v1/helpdesk/tickets                        TICKET_CREATE
GET    /api/v1/helpdesk/tickets/mine?page&size&status  TICKET_VIEW_OWN
GET    /api/v1/helpdesk/tickets/mine/:id               TICKET_VIEW_OWN

# Helpdesk — técnico
GET    /api/v1/helpdesk/tickets/queue?page&tier&type   TICKET_ATTEND
POST   /api/v1/helpdesk/tickets/:id/attend             TICKET_ATTEND
GET    /api/v1/helpdesk/tickets/assigned               TICKET_ATTEND
GET    /api/v1/helpdesk/tickets/:id                    TICKET_ATTEND
PUT    /api/v1/helpdesk/tickets/:id/status             TICKET_ATTEND
POST   /api/v1/helpdesk/tickets/:id/comments           TICKET_ATTEND
POST   /api/v1/helpdesk/tickets/:id/pause              TICKET_PAUSE

# Helpdesk — gestor/admin
GET    /api/v1/helpdesk/tickets?page&filters...        TICKET_VIEW_ALL
PUT    /api/v1/helpdesk/tickets/:id/assign             TICKET_ASSIGN
PUT    /api/v1/helpdesk/tickets/:id/close              TICKET_CLOSE
DELETE /api/v1/helpdesk/tickets/:id                    TICKET_CLOSE (cancelar)
GET    /api/v1/helpdesk/dashboard                      TICKET_VIEW_ALL

# Configuração
GET    /api/v1/helpdesk/departments                    (autenticado)
POST   /api/v1/helpdesk/departments                    DEPT_MANAGE
PUT    /api/v1/helpdesk/departments/:id                DEPT_MANAGE
DELETE /api/v1/helpdesk/departments/:id                DEPT_MANAGE

GET    /api/v1/helpdesk/problem-types                  (autenticado)
POST   /api/v1/helpdesk/problem-types                  DEPT_MANAGE
PUT    /api/v1/helpdesk/problem-types/:id              DEPT_MANAGE
DELETE /api/v1/helpdesk/problem-types/:id              DEPT_MANAGE
```

---

### 7.5 Módulo inventory

**Prioridade:** Média — depende do helpdesk para vínculo de chamados

#### Migration

**`tenant/V3__create_inventory.sql`:**

```sql
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_locations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    description VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE asset_status AS ENUM ('IN_STOCK', 'IN_USE', 'IN_MAINTENANCE', 'DECOMMISSIONED');

CREATE TABLE assets (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    patrimony_number VARCHAR(100) NOT NULL UNIQUE,
    serial_number VARCHAR(100),
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    category_id UUID REFERENCES asset_categories(id) ON DELETE SET NULL,
    status asset_status NOT NULL DEFAULT 'IN_STOCK',
    location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    acquired_at DATE,
    acquired_value NUMERIC(12, 2),
    warranty_until DATE,
    notes TEXT,
    specs JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE movement_type AS ENUM ('ENTRY', 'TRANSFER', 'ASSIGNMENT', 'DECOMMISSION', 'MAINTENANCE_IN', 'MAINTENANCE_OUT');

CREATE TABLE asset_movements (
    id UUID PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    type movement_type NOT NULL,
    from_location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    to_location_id UUID REFERENCES asset_locations(id) ON DELETE SET NULL,
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moved_by UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    moved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consumables (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) NOT NULL DEFAULT 'un',
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE consumable_movements (
    id UUID PRIMARY KEY,
    consumable_id UUID NOT NULL REFERENCES consumables(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('IN', 'OUT')),
    quantity INTEGER NOT NULL,
    notes TEXT,
    registered_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_patrimony ON assets(patrimony_number);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_asset_movements_asset ON asset_movements(asset_id);
```

#### Domain Models

- `Asset`: id, name, patrimonyNumber, serialNumber, model, manufacturer, categoryId, status (enum), locationId, assignedUserId, acquiredAt, acquiredValue, warrantyUntil, notes, specs (Map<String,String>)
- `AssetStatus`: IN_STOCK, IN_USE, IN_MAINTENANCE, DECOMMISSIONED
- `AssetCategory`: id, name, description, icon
- `AssetLocation`: id, name, departmentId, description
- `AssetMovement`: id, assetId, type (enum), fromLocationId, toLocationId, fromUserId, toUserId, movedBy, notes, movedAt
- `MovementType`: ENTRY, TRANSFER, ASSIGNMENT, DECOMMISSION, MAINTENANCE_IN, MAINTENANCE_OUT
- `Consumable`: id, name, category, unit, quantity, minQuantity
- `ConsumableMovement`: id, consumableId, type (IN/OUT), quantity, notes, registeredBy

#### Endpoints

```
GET    /api/v1/inventory/dashboard                         INVENTORY_VIEW
GET    /api/v1/inventory/assets?page&search&category&status&locationId  INVENTORY_VIEW
POST   /api/v1/inventory/assets                            INVENTORY_WRITE
GET    /api/v1/inventory/assets/:id                        INVENTORY_VIEW
PUT    /api/v1/inventory/assets/:id                        INVENTORY_WRITE
DELETE /api/v1/inventory/assets/:id                        INVENTORY_WRITE (baixa/decommission)
GET    /api/v1/inventory/assets/export?format=xlsx         INVENTORY_VIEW

GET    /api/v1/inventory/movements?page&type&assetId       INVENTORY_VIEW
POST   /api/v1/inventory/movements                         INVENTORY_WRITE

GET    /api/v1/inventory/categories                        INVENTORY_VIEW
POST   /api/v1/inventory/categories                        INVENTORY_WRITE
PUT    /api/v1/inventory/categories/:id                    INVENTORY_WRITE
DELETE /api/v1/inventory/categories/:id                    INVENTORY_WRITE

GET    /api/v1/inventory/locations                         INVENTORY_VIEW
POST   /api/v1/inventory/locations                         INVENTORY_WRITE
PUT    /api/v1/inventory/locations/:id                     INVENTORY_WRITE
DELETE /api/v1/inventory/locations/:id                     INVENTORY_WRITE

GET    /api/v1/inventory/consumables?page                  INVENTORY_VIEW
POST   /api/v1/inventory/consumables                       INVENTORY_WRITE
PUT    /api/v1/inventory/consumables/:id                   INVENTORY_WRITE
POST   /api/v1/inventory/consumables/:id/movements         INVENTORY_WRITE

GET    /api/v1/inventory/assets/import/template            INVENTORY_IMPORT
POST   /api/v1/inventory/assets/import/preview             INVENTORY_IMPORT
POST   /api/v1/inventory/assets/import/confirm             INVENTORY_IMPORT
```

---

### 7.6 Módulo governance

**Prioridade:** Média — telas de governança já existem no frontend com dados mock

#### Migration

**`tenant/V4__create_governance.sql`:**

```sql
CREATE TABLE sla_policies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(5) NOT NULL CHECK (tier IN ('N1', 'N2', 'N3')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    response_time_minutes INTEGER NOT NULL,
    resolution_time_minutes INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tier, priority)
);

CREATE TABLE sla_alerts (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES sla_policies(id) ON DELETE CASCADE,
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('WARNING_75', 'WARNING_90', 'BREACHED')),
    notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified_users UUID[] NOT NULL DEFAULT '{}'
);

-- Seed: políticas padrão
INSERT INTO sla_policies (id, name, tier, priority, response_time_minutes, resolution_time_minutes) VALUES
(gen_random_uuid(), 'N1 - Baixa',     'N1', 'LOW',      240, 1440),
(gen_random_uuid(), 'N1 - Média',     'N1', 'MEDIUM',   120,  480),
(gen_random_uuid(), 'N1 - Alta',      'N1', 'HIGH',      60,  240),
(gen_random_uuid(), 'N1 - Crítica',   'N1', 'CRITICAL',  30,   60),
(gen_random_uuid(), 'N2 - Baixa',     'N2', 'LOW',      480, 2880),
(gen_random_uuid(), 'N2 - Média',     'N2', 'MEDIUM',   240,  960),
(gen_random_uuid(), 'N2 - Alta',      'N2', 'HIGH',     120,  480),
(gen_random_uuid(), 'N2 - Crítica',   'N2', 'CRITICAL',  60,  120);
```

#### Domain Models

- `SLAPolicy`: id, name, tier, priority, responseTimeMinutes, resolutionTimeMinutes, isActive
- `SLAAlert`: id, ticketId, policyId, alertType (WARNING_75, WARNING_90, BREACHED), notifiedAt
- `SLAMetrics` (value object): totalTickets, compliant, breached, complianceRate, avgResolutionMinutes

#### Endpoints

```
GET  /api/v1/governance/dashboard                  REPORT_VIEW_ALL
  Response: { totalTickets, complianceRate, avgResolution, technicianMetrics[], trendData[] }

GET  /api/v1/governance/technicians/:id/sla        REPORT_VIEW_ALL
  Response: { technician, assignedCount, resolvedCount, breachCount, avgResolution, tickets[] }

GET  /api/v1/governance/sla/config                 SLA_CONFIG
  Response: SLAPolicy[]

PUT  /api/v1/governance/sla/config/:id             SLA_CONFIG
  Body: { responseTimeMinutes, resolutionTimeMinutes, isActive }

GET  /api/v1/governance/sla/alerts?page&type       REPORT_VIEW_ALL
  Response: Page<SLAAlertResponse>

PUT  /api/v1/governance/sla/alerts/:id/acknowledge REPORT_VIEW_ALL
```

#### SLA Monitoring (background)

- `SLAMonitoringService` (domain/service): scheduled job via `@Scheduled` que verifica tickets abertos e dispara alertas quando ultrapassam 75%/90%/100% do SLA
- Publica `SLABreachEvent` via RabbitMQ para envio de emails

---

### 7.7 shared/ai — AIProvider

**Prioridade:** Baixa — funcionalidade de suporte ao técnico

#### Estrutura

```
shared/ai/
├── domain/
│   └── ports/out/
│       └── AIProvider.java
└── infrastructure/
    ├── OpenAIAdapter.java
    ├── GeminiAdapter.java
    ├── AnthropicAdapter.java
    └── NullAIAdapter.java
```

**`AIProvider` interface:**
```java
public interface AIProvider {
    String suggest(String ticketTitle, String ticketDescription);
    String summarize(List<String> comments);
}
```

**Configuração:** tenant decide o provider via `ai_config` na tabela de configurações do tenant.

**Migration necessária:** `tenant/V5__create_tenant_config.sql` com tabela `tenant_config (key, value, updated_at)`.

---

### 7.8 shared/storage — StorageProvider

**Prioridade:** Baixa — necessário para anexos em tickets

**`StorageProvider` interface:**
```java
public interface StorageProvider {
    String upload(String key, InputStream data, long size, String contentType);
    InputStream download(String key);
    void delete(String key);
    String getPresignedUrl(String key, Duration expiry);
}
```

Implementações:
- `R2StorageAdapter` — Cloudflare R2 via AWS SDK S3-compatible
- `LocalStorageAdapter` — salva em disco local (desenvolvimento)

---

### 7.9 shared/events — RabbitMQ Event Bus

**Prioridade:** Baixa — necessário para desacoplamento entre módulos

**`DomainEventPublisher` interface** (`shared/events/`):
```java
public interface DomainEventPublisher {
    void publish(Object event);
}
```

**Exchanges e Routing Keys:**

| Exchange | Routing Key | Evento |
|---|---|---|
| `nexops.helpdesk` | `ticket.created` | `TicketCreatedEvent` |
| `nexops.helpdesk` | `ticket.assigned` | `TicketAssignedEvent` |
| `nexops.helpdesk` | `ticket.resolved` | `TicketResolvedEvent` |
| `nexops.governance` | `sla.breached` | `SLABreachEvent` |
| `nexops.tenant` | `tenant.provisioned` | `TenantProvisionedEvent` |

---

## 8. Próximos Passos Ordenados

1. **`GlobalExceptionHandler`** — implementar antes de qualquer controller para padronizar respostas de erro
2. **`AuthController`** — login/refresh/logout; unblocks conexão com o frontend
3. **`TenantProvisioningService`** — provisionamento de novos tenants (necessário para testes end-to-end)
4. **`UserController`** — CRUD de usuários e roles para Admin
5. **Migration V2 + módulo helpdesk** — domain models → ports → service → persistence → controller
6. **Migration V3 + módulo inventory** — seguir mesma ordem
7. **Migration V4 + módulo governance** — conectar dados reais às telas já implementadas no frontend
8. **WebSocket para notificações** — Spring WebSocket já está no classpath; implementar endpoint `/ws` com STOMP
9. **shared/storage** — necessário antes de attachment em tickets
10. **shared/ai** — integração de IA para sugestão no TechnicianHomePage
11. **shared/events** — RabbitMQ para desacoplamento após módulos estabilizarem
12. **Testes de integração** — TestContainers (PostgreSQL + RabbitMQ) para cada módulo; priorizar TicketService e AuthController
