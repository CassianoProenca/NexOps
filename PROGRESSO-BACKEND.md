# Progresso NexOps — Back-end (API)

## 🏗️ Estrutura e Arquitetura
- [x] Scaffolding do projeto (Spring Boot 3.x/4.x, Java 21)
- [x] Arquitetura Hexagonal (Ports & Adapters) definida
- [x] Configuração de Multi-tenancy (isolamento por schema)
- [x] Suporte a Docker Compose (PostgreSQL, Redis, RabbitMQ, Mailpit)

## 🔐 Segurança e IAM
- [x] Modelagem de IAM (User, Role, Permission)
- [x] Implementação do **JwtService** (Geração e Validação de Access Tokens)
- [x] Implementação do **RefreshTokenService** (Tokens de longa duração com hash no banco)
- [x] Configuração de propriedades de segurança via `.env` e `application.yml`
- [x] Repositórios base (UserRepository, RefreshTokenRepository)

## 🗄️ Banco de Dados
- [x] Configuração do Flyway para migrações
- [x] Migration de Schema Público (`tenants`)
- [x] Migration de Schema de Tenant (`iam`)
