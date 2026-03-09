# NexOps API — Comandos

## Stack completa

```bash
# Subir tudo (build da imagem + infraestrutura + app)
docker compose up -d

# Subir tudo e acompanhar os logs em tempo real
docker compose up

# Reconstruir a imagem do app (após mudanças no código)
docker compose up -d --build

# Parar tudo
docker compose down

# Parar tudo e remover volumes (apaga dados do PostgreSQL)
docker compose down -v
```

---

## Serviços individuais

### App (API Spring Boot)

```bash
docker compose up -d app
docker compose stop app
docker compose logs -f app
```

### PostgreSQL

```bash
docker compose up -d postgres
docker compose stop postgres
docker compose logs -f postgres

# Conectar via psql
docker exec -it nexops-postgres psql -U nexops -d nexops
```

### Redis

```bash
docker compose up -d redis
docker compose stop redis
docker compose logs -f redis

# Conectar via redis-cli
docker exec -it nexops-redis redis-cli
```

### RabbitMQ

```bash
docker compose up -d rabbitmq
docker compose stop rabbitmq
docker compose logs -f rabbitmq

# Management UI: http://localhost:15672
# Usuário/senha definidos no .env (RABBIT_USER / RABBIT_PASSWORD)
```

---

## Desenvolvimento local (sem Docker para o app)

Útil quando você quer rodar o Spring Boot pelo Maven (hot reload via DevTools):

```bash
# 1. Sobe apenas a infraestrutura
docker compose up -d postgres redis rabbitmq

# 2. Roda o app localmente com variáveis do .env
export $(grep -v '^#' .env | xargs) && ./mvnw spring-boot:run
```

---

## Status e diagnóstico

```bash
# Ver status e health de todos os containers
docker compose ps

# Ver uso de recursos
docker stats

# Inspecionar logs de um serviço
docker compose logs -f <serviço>   # app | postgres | redis | rabbitmq
```
