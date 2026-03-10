# NexOps Web — Roadmap Técnico

> Gerado em 2026-03-10 a partir da leitura direta dos arquivos do projeto.

---

## 1. Estado Atual

| Módulo / Tela | Arquivo | Rota | Status |
|---|---|---|---|
| **Auth** | | | |
| Login | `pages/auth/LoginPage.tsx` | `/login` | ✅ Completo |
| Primeiro Acesso | `pages/auth/FirstAccessPage.tsx` | `/primeiro-acesso` | ✅ Completo |
| Esqueci a Senha | `pages/auth/ForgotPasswordPage.tsx` | `/forgot-password` | ✅ Completo |
| Convite Expirado | `pages/auth/ExpiredInvitePage.tsx` | `/invite-expired` | ✅ Completo |
| **Shell / Layout** | | | |
| Layout base | `components/shared/Layout.tsx` | — | ✅ Completo |
| Sidebar | `components/shared/Sidebar.tsx` | — | ✅ Completo |
| Header | `components/shared/Header.tsx` | — | ✅ Completo |
| Footer | `components/shared/Footer.tsx` | — | ✅ Completo |
| **Dashboard** | | | |
| Dashboard gestor | inline em `App.tsx` | `/app/dashboard` | ⏳ Stub (mock, sem dados reais) |
| **Helpdesk — Usuário Final** | | | |
| Home do usuário | `pages/helpdesk/user/HomePage.tsx` | `/app` (index) | ✅ Completo |
| Meus Chamados | `pages/helpdesk/user/MyCasesPage.tsx` | `/app/helpdesk/meus-chamados` | ✅ Completo |
| Novo Chamado | `pages/helpdesk/user/NewCasePage.tsx` | `/app/helpdesk/novo` | ✅ Completo |
| Detalhe do Chamado (usuário) | `pages/helpdesk/user/TicketDetailUserPage.tsx` | `/app/helpdesk/meu-chamado/:id` | ✅ Completo |
| **Helpdesk — Técnico** | | | |
| Home do Técnico | `pages/helpdesk/tech/TechnicianHomePage.tsx` | `/app/helpdesk/tecnico` | ✅ Completo |
| Fila de Chamados | `pages/helpdesk/tech/TicketQueuePage.tsx` | `/app/helpdesk/fila` | ✅ Completo |
| Meus Trabalhos | `pages/helpdesk/tech/MyTicketsPage.tsx` | `/app/helpdesk/meus-trabalhos` | ✅ Completo |
| Detalhe do Chamado (técnico) | `pages/helpdesk/tech/TicketDetailTechPage.tsx` | `/app/helpdesk/chamado/:id` | ✅ Completo |
| Painel TV | `pages/helpdesk/tech/QueuePanelPage.tsx` | `/app/helpdesk/painel` | ✅ Completo |
| **Helpdesk — Gestor/Admin** | | | |
| Todos os Chamados | `pages/helpdesk/admin/AllTicketsPage.tsx` | `/app/helpdesk/todos` | ✅ Completo |
| Detalhe do Chamado (gestor) | `pages/helpdesk/admin/TicketDetailManagerPage.tsx` | `/app/helpdesk/chamado-gestor/:id` | ✅ Completo |
| Departamentos | `pages/helpdesk/admin/DepartmentsPage.tsx` | `/app/helpdesk/departamentos` | ✅ Completo |
| Tipos de Problema | `pages/helpdesk/admin/ProblemTypesPage.tsx` | `/app/helpdesk/tipos-de-problema` | ✅ Completo |
| **Governança** | | | |
| Dashboard de Governança | `pages/governance/GovernanceDashboardPage.tsx` | `/app/governance` | ✅ Completo |
| Detalhe SLA por Técnico | `pages/governance/TechnicianSLADetailPage.tsx` | `/app/governance/tecnico/:id` | ✅ Completo |
| Configuração de SLA | `pages/governance/SLAConfigPage.tsx` | `/app/governance/configuracao` | ✅ Completo |
| Notificações SLA | `pages/governance/SLANotificationsPage.tsx` | `/app/governance/notificacoes` | ✅ Completo |
| **Administração** | | | |
| Usuários | `pages/admin/UsersPage.tsx` | `/app/admin/usuarios` | ✅ Completo |
| Perfis de Acesso | `pages/admin/ProfilesPage.tsx` | `/app/admin/perfis` | ✅ Completo |
| Configurações do Tenant | `pages/admin/TenantSettingsPage.tsx` | `/app/admin/configuracoes` | ✅ Completo |
| SMTP | `pages/admin/SmtpPage.tsx` | `/app/admin/smtp` | ✅ Completo |
| Configurações de IA | `pages/admin/AISettingsPage.tsx` | `/app/admin/ia` | ✅ Completo |
| **Transversal** | | | |
| Notificações | `pages/NotificationsPage.tsx` | `/app/notificacoes` | ✅ Completo |
| **Inventário** | | | |
| Todas as telas | — | `/app/inventory/*` | ❌ Pendente |

---

## 2. Stack e Versões Fixadas 🔒

> Não alterar sem revisão e alinhamento explícito.

### Dependencies

| Pacote | Versão |
|---|---|
| `react` | ^19.2.0 |
| `react-dom` | ^19.2.0 |
| `react-router-dom` | ^7.13.1 |
| `react-hook-form` | ^7.71.2 |
| `@hookform/resolvers` | ^5.2.2 |
| `zod` | ^4.3.6 |
| `recharts` | ^2.15.4 |
| `lucide-react` | ^0.577.0 |
| `radix-ui` | ^1.4.3 |
| `cmdk` | ^1.1.1 |
| `class-variance-authority` | ^0.7.1 |
| `clsx` | ^2.1.1 |
| `tailwind-merge` | ^3.5.0 |

### Dev Dependencies

| Pacote | Versão |
|---|---|
| `vite` | ^7.3.1 |
| `typescript` | ~5.9.3 |
| `tailwindcss` | ^4.2.1 |
| `@tailwindcss/vite` | ^4.2.1 |
| `tw-animate-css` | ^1.4.0 |
| `shadcn` | ^3.8.5 |
| `@vitejs/plugin-react` | ^5.1.1 |
| `@types/react` | ^19.2.7 |
| `@types/react-dom` | ^19.2.3 |
| `@types/node` | ^24.10.1 |
| `eslint` | ^9.39.1 |
| `@eslint/js` | ^9.39.1 |
| `typescript-eslint` | ^8.48.0 |
| `eslint-plugin-react-hooks` | ^7.0.1 |
| `eslint-plugin-react-refresh` | ^0.4.24 |
| `globals` | ^16.5.0 |

---

## 3. Decisões de Design Fixadas 🔒

### Paleta de Cores (valores exatos do `index.css`)

| Token CSS | Valor hex | Uso |
|---|---|---|
| `--background` | `#fafafa` | Fundo da página |
| `--surface` | `#ffffff` | Fundo de cards e painéis |
| `--border` | `#e4e4e7` | Bordas padrão |
| `--input` | `#e4e4e7` | Borda de inputs |
| `--ring` | `#4f6ef7` | Focus ring |
| `--text-primary` / `--foreground` | `#18181b` | Texto principal |
| `--text-secondary` / `--muted-foreground` | `#71717a` | Texto secundário |
| `--text-muted` | `#a1a1aa` | Texto de apoio / placeholders |
| `--brand` / `--primary` | `#4f6ef7` | Cor primária da marca |
| `--brand-hover` | `#3d5ce6` | Hover da cor primária |
| `--brand-subtle` / `--accent` | `#eef1ff` | Background de destaque suave |
| `--sidebar` / `--secondary` / `--muted` | `#f4f4f5` | Sidebar e estados secundários |
| `--success` | `#16a34a` | Status de sucesso |
| `--warning` | `#d97706` | Status de alerta |
| `--error` / `--destructive` | `#dc2626` | Status de erro |
| `--info` | `#0891b2` | Status informativo |

### Tipografia

- **Fonte primária:** DM Sans (400, 500, 600, 700) carregada via Google Fonts em `index.html`
- Sem Syne ou outras fontes secundárias ativas no projeto

### Border Radius

Configurado via `--radius: 0.5rem` em `:root`:

| Classe Tailwind | Valor calculado |
|---|---|
| `rounded-sm` | 0.25rem |
| `rounded-md` | 0.375rem |
| `rounded-lg` | 0.5rem |
| `rounded-xl` | 0.625rem |
| `rounded-2xl` | 0.75rem |
| `rounded-3xl` | 0.875rem |
| `rounded-4xl` | 1rem |

Convenção: cards usam `rounded-xl`, inputs/botões usam `rounded-md` a `rounded-lg`.

### Biblioteca de Componentes

- **shadcn/ui** — componentes ficam em `src/components/ui/`. Nunca modificar diretamente.
- Para adicionar novos componentes: `npx shadcn add <componente>`
- Componentes existentes: `button`, `input`, `badge`, `card`, `avatar`, `dialog`, `dropdown-menu`, `popover`, `command`, `sheet`, `tooltip`, `separator`, `scroll-area`, `switch`, `chart`

### Gráficos

- **Recharts** via wrapper `components/ui/chart.tsx` (shadcn chart component)
- Sempre usar `ChartContainer` + `ChartTooltip` do `@/components/ui/chart`

### Formulários

- **React Hook Form** + **Zod** para todos os formulários
- Resolver: `@hookform/resolvers/zod`
- Nunca usar `useState` para campos de formulário

### Dark Mode

- **Somente** `QueuePanelPage` usa dark mode (bg zinc-900)
- Todas as demais páginas são exclusivamente light mode
- Não adicionar `dark:` variants em novas páginas além do painel TV

---

## 4. Convenções Obrigatórias

### Nomenclatura de Arquivos e Componentes

| Tipo | Convenção | Exemplo |
|---|---|---|
| Página | `PascalCase` + sufixo `Page` | `AssetsListPage.tsx` |
| Componente compartilhado | `PascalCase` | `AssetStatusBadge.tsx` |
| Hook personalizado | `camelCase` + prefixo `use` | `useInventoryFilters.ts` |
| Utilitário | `camelCase` | `formatCurrency.ts` |
| Tipo/Interface | `PascalCase` | `Asset`, `AssetFilters` |

### Estrutura de Pastas

```
src/
├── components/
│   ├── ui/          → shadcn/ui — não modificar
│   └── shared/      → Layout, Sidebar, Header, Footer
├── pages/
│   ├── auth/
│   ├── helpdesk/
│   │   ├── user/    → END_USER
│   │   ├── tech/    → TECHNICIAN
│   │   └── admin/   → MANAGER, ADMIN
│   ├── inventory/
│   │   ├── shared/  → telas acessíveis por TECH + MANAGER + ADMIN
│   │   └── admin/   → telas exclusivas de ADMIN
│   ├── governance/
│   ├── admin/
│   └── NotificationsPage.tsx
├── hooks/
├── lib/
│   └── utils.ts
└── index.css
```

### Padrão de Navegação

- Router: **React Router DOM v7** com `BrowserRouter` + `Routes` em `App.tsx`
- Todas as rotas autenticadas ficam dentro de `<Route path="/app" element={<AppShell />}>`
- Rotas públicas ficam fora do `AppShell`
- Paths em português com hífens: `/app/inventory/ativos`, `/app/inventory/categorias`
- Parâmetros de ID: `:id` no final do path

### Uso do Layout Base

- Importar `Layout` de `@/components/shared/Layout`
- Nunca instanciar `Layout` diretamente nas páginas — ele é injetado pelo `AppShell`
- O `AppShell` envolve `<Outlet />` com `<Layout>`, portanto páginas filhas renderizam direto

### Tabela vs Cards

| Use tabela | Use cards |
|---|---|
| Listas com muitos atributos por item (>4 colunas) | Resumos, KPIs, painéis de status |
| Operações bulk (checkbox + ação em massa) | Itens com hierarquia visual clara |
| Export/relatório | Grids de 3-4 itens por linha |
| Gestão de entidades (CRUD) | Dashboards e home pages |

### Regra do Header da Página

- O shell `Header.tsx` **não possui botão de ação primário** (ex.: "Novo Ativo")
- Cada página define seu próprio cabeçalho interno com título, breadcrumb e botões de ação
- Padrão de cabeçalho de página:

```tsx
<div className="flex items-center justify-between">
  <div>
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
      <span>Inventário</span>
      <span className="text-border">/</span>
      <span className="text-brand">Ativos</span>
    </div>
    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Ativos</h1>
  </div>
  <Button>Novo Ativo</Button>
</div>
```

### Estado Ativo na Sidebar

- Link ativo: `bg-brand/10 text-brand`
- Detectado via `useLocation().pathname` com `startsWith` para seções pai

---

## 5. Roadmap — Módulo Inventário

> Este é o único módulo de negócio pendente no frontend.
> Implementar nesta ordem: Dashboard → Ativos → Detalhe → Novo/Editar → Movimentações → Categorias/Localizações → Consumíveis → Importação.

### 5.1 InventoryDashboardPage

**Arquivo:** `src/pages/inventory/shared/InventoryDashboardPage.tsx`
**Rota:** `/app/inventory`
**Perfil de acesso:** TECNICO_SUPORTE, TECNICO_HARDWARE, GESTOR, ADMIN
**Permissão:** `INVENTORY_VIEW`

**Layout:** Grid 2 colunas no topo (KPIs) + seção de gráficos + lista de movimentações recentes.

**Seções:**
1. **Breadcrumb + Título:** `Inventário / Dashboard`
2. **KPI Cards (linha de 4):**
   - Total de Ativos (ícone `Package`, cor brand)
   - Ativos em Uso (ícone `Monitor`, cor success)
   - Em Manutenção (ícone `Wrench`, cor warning)
   - Inativos/Baixados (ícone `PackageX`, cor text-muted)
3. **Gráfico de Distribuição por Categoria** (`recharts` PieChart / BarChart — usar `ChartContainer` de `@/components/ui/chart`). Ocupa coluna da esquerda (2/3 da largura).
4. **Ativos Críticos** (coluna direita): lista dos últimos ativos com garantia expirando em 30 dias ou em manutenção há mais de 7 dias. Cada item com nome, categoria, badge de status, ícone de alerta.
5. **Movimentações Recentes:** tabela de 5 linhas com colunas: Data, Ativo, Tipo de Movimentação, Usuário responsável, Localização.

**Dados da API:**
```
GET /api/v1/inventory/dashboard
Response: {
  totalAssets: number,
  inUse: number,
  inMaintenance: number,
  inactive: number,
  byCategory: { category: string, count: number }[],
  criticalAssets: { id, name, category, status, warrantyExpiresAt? }[],
  recentMovements: { id, assetName, type, user, location, date }[]
}
```

---

### 5.2 AssetsListPage

**Arquivo:** `src/pages/inventory/shared/AssetsListPage.tsx`
**Rota:** `/app/inventory/ativos`
**Perfil de acesso:** TECNICO_SUPORTE, TECNICO_HARDWARE, GESTOR, ADMIN
**Permissão:** `INVENTORY_VIEW`

**Layout:** Cabeçalho com título + botão "Novo Ativo" (apenas para INVENTORY_WRITE) + barra de filtros + tabela paginada.

**Seções:**
1. **Cabeçalho da página:** título "Ativos", breadcrumb `Inventário / Ativos`, botão "Novo Ativo" (ícone `Plus`, visível somente se permissão `INVENTORY_WRITE`).
2. **Barra de filtros (linha horizontal):**
   - Input de busca (placeholder: "Buscar por nome, número de série, patrimônio...")
   - Select: Categoria (todas | Computador | Monitor | Impressora | Roteador | Periférico | Outro)
   - Select: Status (todos | Em Uso | Em Estoque | Em Manutenção | Baixado)
   - Select: Localização (dinâmico via API)
   - Botão "Limpar filtros" (aparece quando há filtros ativos)
3. **Tabela paginada** com colunas:
   - Número de Patrimônio (código)
   - Nome / Modelo
   - Categoria (badge)
   - Status (badge colorido: Em Uso = brand, Em Estoque = success, Em Manutenção = warning, Baixado = muted)
   - Localização
   - Responsável (usuário ao qual está atribuído)
   - Última movimentação (data relativa)
   - Ações (ícone olho → detalhe)
4. **Paginação:** botões Anterior/Próximo + info "Mostrando X-Y de Z ativos"
5. **Botão exportar** (ícone `Download`) ao lado do botão "Novo Ativo" — dispara `GET /api/v1/inventory/assets/export?format=xlsx`

**Navegação:**
- Clique na linha ou no ícone olho → `/app/inventory/ativo/:id`
- Botão "Novo Ativo" → `/app/inventory/ativo/novo`

**Dados da API:**
```
GET /api/v1/inventory/assets?page=0&size=20&search=&category=&status=&locationId=
Response: {
  content: Asset[],
  totalElements: number,
  totalPages: number,
  number: number
}
```

---

### 5.3 AssetDetailPage

**Arquivo:** `src/pages/inventory/shared/AssetDetailPage.tsx`
**Rota:** `/app/inventory/ativo/:id`
**Perfil de acesso:** TECNICO_SUPORTE, TECNICO_HARDWARE, GESTOR, ADMIN
**Permissão:** `INVENTORY_VIEW`

**Layout:** Duas colunas — coluna esquerda (2/3) com dados do ativo + histórico; coluna direita (1/3) com informações de responsável e ações rápidas.

**Seções:**
1. **Breadcrumb + Título:** `Inventário / Ativos / {Nome do Ativo}` + badge de status.
2. **Botões de ação (cabeçalho):**
   - "Editar" (ícone `Pencil`) → abre modal ou navega para `/app/inventory/ativo/:id/editar` — visível com `INVENTORY_WRITE`
   - "Registrar Movimentação" (ícone `ArrowRightLeft`) — visível com `INVENTORY_WRITE`
   - "Baixar Ativo" (ícone `Trash2`, cor error) — apenas ADMIN
3. **Coluna esquerda:**
   - Card "Informações Gerais": Nome, Número de Patrimônio, Número de Série, Modelo, Fabricante, Categoria, Data de Aquisição, Valor de Aquisição, Garantia até, Observações.
   - Card "Histórico de Movimentações": timeline de movimentações (data, tipo, de → para, quem registrou). Usar lista vertical com ícone de tipo à esquerda.
   - Card "Chamados Relacionados": lista de chamados abertos que referenciaram este ativo. Colunas: ID, Título, Status, Data. Clique navega para detalhe do chamado.
4. **Coluna direita:**
   - Card "Localização Atual": nome da localização + mapa textual (departamento, sala).
   - Card "Responsável Atual": avatar + nome + e-mail do usuário ao qual está atribuído (se houver).
   - Card "Dados Técnicos": especificações livres (processador, memória, disco, etc.) — renderiza JSON como pares chave-valor.

**Dados da API:**
```
GET /api/v1/inventory/assets/:id
Response: {
  id, name, patrimonyNumber, serialNumber, model, manufacturer,
  category, status, locationId, locationName, assignedUserId,
  assignedUserName, acquiredAt, acquiredValue, warrantyUntil,
  notes, specs: Record<string, string>,
  movements: { id, type, fromLocation, toLocation, movedBy, movedAt, notes }[],
  relatedTickets: { id, title, status, openedAt }[]
}
```

---

### 5.4 NewAssetPage / EditAssetPage

**Arquivo:** `src/pages/inventory/admin/NewAssetPage.tsx`
**Rota:** `/app/inventory/ativo/novo` e `/app/inventory/ativo/:id/editar`
**Perfil de acesso:** TECNICO_HARDWARE, ADMIN
**Permissão:** `INVENTORY_WRITE`

**Layout:** Formulário em card único centralizado com seções agrupadas.

**Seções do formulário:**
1. **Cabeçalho:** título "Novo Ativo" ou "Editar Ativo — {nome}", breadcrumb, botão "Cancelar" (link) e botão "Salvar" (submit).
2. **Seção "Identificação":**
   - Nome do ativo (obrigatório)
   - Número de Patrimônio (obrigatório, único)
   - Número de Série
   - Categoria (Select: Computador, Monitor, Impressora, Roteador, Periférico, Servidor, Outro)
   - Fabricante
   - Modelo
3. **Seção "Aquisição":**
   - Data de Aquisição (date input)
   - Valor de Aquisição (número, prefixo R$)
   - Garantia até (date input)
4. **Seção "Localização e Responsável":**
   - Localização (Select carregado via API)
   - Responsável (Combobox de usuários com busca — carregado via API)
   - Status inicial (Em Estoque | Em Uso | Em Manutenção)
5. **Seção "Dados Técnicos" (opcional):**
   - Lista dinâmica de pares Chave/Valor (botão "+ Adicionar especificação")
6. **Observações:** textarea livre

**Validação Zod:**
- `name`: obrigatório, min 3 chars
- `patrimonyNumber`: obrigatório
- `category`: obrigatório, enum
- `status`: obrigatório, enum
- `acquiredValue`: número positivo, opcional

**Dados da API:**
```
POST /api/v1/inventory/assets          → cria
PUT  /api/v1/inventory/assets/:id      → atualiza
GET  /api/v1/inventory/locations       → lista de localizações (Select)
GET  /api/v1/users?search=             → combobox de usuários
```

---

### 5.5 MovementsPage

**Arquivo:** `src/pages/inventory/shared/MovementsPage.tsx`
**Rota:** `/app/inventory/movimentacoes`
**Perfil de acesso:** TECNICO_SUPORTE, TECNICO_HARDWARE, GESTOR, ADMIN
**Permissão:** `INVENTORY_VIEW`

**Layout:** Filtros + tabela paginada. Sem ações de edição — log somente leitura.

**Seções:**
1. **Cabeçalho:** título "Movimentações", breadcrumb, botão "Registrar Movimentação" (apenas `INVENTORY_WRITE`).
2. **Filtros:**
   - Período (date range: de / até)
   - Tipo de movimentação (todos | Entrada | Transferência | Atribuição | Baixa | Manutenção)
   - Ativo (input de busca por nome ou patrimônio)
   - Responsável (input de busca por nome)
3. **Tabela:**
   - Data/Hora
   - Ativo (link para detalhe)
   - Tipo (badge colorido)
   - De → Para (localização ou usuário)
   - Registrado por
   - Observações (truncado com tooltip)

**Modal "Registrar Movimentação"** (abre ao clicar no botão):
- Select: Ativo (busca por nome/patrimônio)
- Select: Tipo de Movimentação
- Select: Localização de destino (se Transferência)
- Select: Usuário responsável (se Atribuição)
- Textarea: Observações
- Botão Confirmar

**Dados da API:**
```
GET  /api/v1/inventory/movements?page=0&size=20&...filtros
POST /api/v1/inventory/movements
```

---

### 5.6 CategoriesPage

**Arquivo:** `src/pages/inventory/admin/CategoriesPage.tsx`
**Rota:** `/app/inventory/categorias`
**Perfil de acesso:** ADMIN
**Permissão:** `INVENTORY_WRITE`

**Layout:** Dois painéis side-by-side (igual ao padrão de `DepartmentsPage`): lista à esquerda, formulário à direita.

**Painel esquerdo (lista):**
- Busca por nome
- Lista de categorias com nome + contagem de ativos + botões editar/excluir
- Botão "+ Nova Categoria" no topo

**Painel direito (formulário):**
- Título: "Nova Categoria" ou "Editar: {nome}"
- Campo: Nome (obrigatório)
- Campo: Descrição
- Campo: Ícone (Select com opções: Package, Monitor, Printer, Router, Cpu, HardDrive, Smartphone, Server)
- Botões: Salvar / Cancelar

**Dados da API:**
```
GET    /api/v1/inventory/categories
POST   /api/v1/inventory/categories
PUT    /api/v1/inventory/categories/:id
DELETE /api/v1/inventory/categories/:id
```

---

### 5.7 LocationsPage

**Arquivo:** `src/pages/inventory/admin/LocationsPage.tsx`
**Rota:** `/app/inventory/localizacoes`
**Perfil de acesso:** ADMIN
**Permissão:** `INVENTORY_WRITE`

**Layout:** Dois painéis side-by-side (mesmo padrão de CategoriesPage).

**Painel esquerdo:**
- Busca por nome ou departamento
- Árvore de localizações agrupada por departamento (expandível)
- Contagem de ativos por localização
- Botões editar/excluir

**Painel direito (formulário):**
- Nome da Localização (obrigatório, ex.: "Sala 203 — Secretaria")
- Departamento (Select, carregado via `GET /api/v1/helpdesk/departments`)
- Descrição livre
- Botões: Salvar / Cancelar

**Dados da API:**
```
GET    /api/v1/inventory/locations
POST   /api/v1/inventory/locations
PUT    /api/v1/inventory/locations/:id
DELETE /api/v1/inventory/locations/:id
```

---

### 5.8 ConsumablesPage

**Arquivo:** `src/pages/inventory/shared/ConsumablesPage.tsx`
**Rota:** `/app/inventory/consumiveis`
**Perfil de acesso:** TECNICO_HARDWARE, GESTOR, ADMIN
**Permissão:** `INVENTORY_VIEW`

**Layout:** Cabeçalho + KPI cards de estoque + tabela de consumíveis.

**Seções:**
1. **Cabeçalho:** título "Consumíveis e Estoque", breadcrumb, botão "Adicionar Consumível" (apenas `INVENTORY_WRITE`).
2. **KPI Cards (linha de 3):**
   - Total de itens em estoque
   - Abaixo do estoque mínimo (badge vermelho com count)
   - Entradas no mês
3. **Tabela:**
   - Nome do consumível
   - Categoria (ex.: Suprimento, Cabo, Acessório)
   - Quantidade em estoque (destacar em vermelho se < mínimo)
   - Estoque mínimo
   - Unidade (un, cx, m, kg)
   - Última movimentação
   - Ações: + Entrada, - Saída, Editar

**Modal Entrada/Saída:**
- Tipo (Entrada / Saída)
- Quantidade
- Motivo / Observações
- Botão Confirmar

**Dados da API:**
```
GET  /api/v1/inventory/consumables?page=0&size=20
POST /api/v1/inventory/consumables
PUT  /api/v1/inventory/consumables/:id
POST /api/v1/inventory/consumables/:id/movements
```

---

### 5.9 ImportPage

**Arquivo:** `src/pages/inventory/admin/ImportPage.tsx`
**Rota:** `/app/inventory/importar`
**Perfil de acesso:** ADMIN
**Permissão:** `INVENTORY_IMPORT`

**Layout:** Wizard de 3 passos em card centralizado.

**Passo 1 — Upload:**
- Área de drop (drag & drop) para arquivo `.csv` ou `.xlsx`
- Botão "Baixar modelo" (link para `GET /api/v1/inventory/assets/import/template`)
- Botão "Próximo" (ativado após upload)

**Passo 2 — Mapeamento de Colunas:**
- Tabela com duas colunas: "Coluna do arquivo" | "Campo NexOps"
- Para cada coluna detectada no arquivo, um Select com os campos disponíveis
- Preview das primeiras 3 linhas

**Passo 3 — Confirmação:**
- Resumo: X ativos a importar, Y erros detectados
- Lista de erros (linha, campo, problema) — se houver
- Botão "Importar" (ativado somente se sem erros críticos)
- Botão "Voltar"

**Feedback pós-importação:**
- Banner verde: "{N} ativos importados com sucesso"
- Link "Ver ativos importados" → `AssetsListPage` com filtro pré-aplicado

**Dados da API:**
```
GET  /api/v1/inventory/assets/import/template   → download do modelo
POST /api/v1/inventory/assets/import/preview    → multipart/form-data, retorna preview + erros
POST /api/v1/inventory/assets/import/confirm    → confirma a importação
```

---

### Atualizar `App.tsx` após implementar o Inventário

Substituir o bloco de inventário por:

```tsx
{/* ── Inventário ── */}
<Route path="inventory"                     element={<InventoryDashboardPage />} />
<Route path="inventory/ativos"              element={<AssetsListPage />} />
<Route path="inventory/ativo/novo"          element={<NewAssetPage />} />
<Route path="inventory/ativo/:id"           element={<AssetDetailPage />} />
<Route path="inventory/ativo/:id/editar"    element={<NewAssetPage />} />
<Route path="inventory/movimentacoes"       element={<MovementsPage />} />
<Route path="inventory/categorias"          element={<CategoriesPage />} />
<Route path="inventory/localizacoes"        element={<LocationsPage />} />
<Route path="inventory/consumiveis"         element={<ConsumablesPage />} />
<Route path="inventory/importar"            element={<ImportPage />} />
```

### Atualizar `Sidebar.tsx`

Adicionar links de inventário na seção correspondente:
- `/app/inventory` — Dashboard de Inventário (ícone `LayoutDashboard`)
- `/app/inventory/ativos` — Ativos (ícone `Package`)
- `/app/inventory/movimentacoes` — Movimentações (ícone `ArrowRightLeft`)
- `/app/inventory/consumiveis` — Consumíveis (ícone `Archive`)
- `/app/inventory/categorias` — Categorias (ícone `Tag`, apenas ADMIN)
- `/app/inventory/localizacoes` — Localizações (ícone `MapPin`, apenas ADMIN)
- `/app/inventory/importar` — Importação (ícone `Upload`, apenas ADMIN)

---

## 6. Próximos Passos Ordenados

1. **Implementar módulo de Inventário** — conforme seção 5 acima (9 telas)
2. **Conectar todas as telas à API real** — hoje os dados são todos mockados em estado local; criar camada `services/` com funções `fetch` tipadas (ou instalar `@tanstack/react-query` para cache + loading states)
3. **Implementar autenticação real** — `LoginPage` existe mas não faz POST real; criar `AuthContext` com JWT, refresh token automático e redirect por role
4. **Implementar guarda de rotas** — criar `ProtectedRoute` component que verifica autenticação e permissões antes de renderizar a página
5. **Dashboard gestor** — evoluir o stub inline em `App.tsx` para componente real com dados da API (`/api/v1/helpdesk/dashboard` + `/api/v1/inventory/dashboard`)
6. **Notificações em tempo real** — conectar `NotificationsPage` ao WebSocket (`/api/ws`) para badge de contagem no Header
7. **Testes de integração** — configurar Vitest + Testing Library para as páginas críticas (NewCasePage, NewAssetPage)
8. **Billing** — quando módulo de billing for implementado no backend, criar telas de planos e faturamento em `pages/billing/`
