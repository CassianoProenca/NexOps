# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

```
NexOps/
├── nexops-web/   # React frontend (active development)
└── nexops-api/   # Spring Boot backend (scaffolded, early stage)
```

## Frontend — nexops-web

### Commands

All commands run from `nexops-web/`:

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Type-check (tsc -b) + production build
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

### Stack

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (not PostCSS)
- shadcn/ui — Zinc base, CSS variables, Tailwind v4 compatible
- lucide-react for icons
- react-router-dom v7

### Architecture

`App.tsx` is the entry point with `BrowserRouter` + `Routes`. All pages are wrapped by the `Layout` component.

**Layout composition:**
- `Layout` — manages `sidebarCollapsed` state, renders Sidebar + Header + main content + Footer
- `Sidebar` — collapsible nav (w-16 collapsed, w-64 expanded), grouped into sections: Principal, Usuário, Técnico, Gestão, Sistema
- `Header` — sticky, receives `onToggleSidebar` prop
- `Footer` — version and status

**Page routes:**

| Path | Component |
|---|---|
| `/` | `Dashboard` (inline in App.tsx) |
| `/helpdesk/user` | `pages/helpdesk/user/Home` |
| `/helpdesk/new` | `pages/helpdesk/user/NewTicket` |
| `/helpdesk/tasks` | `pages/helpdesk/tech/Tasks` |

Remaining routes fall to a placeholder. New pages go in `src/pages/<module>/<role>/`.

### Design Tokens

CSS custom properties defined in `index.css`. Always use these instead of hardcoded colors:

| Token | Role |
|---|---|
| `--background` / `--surface` | Page bg / card bg |
| `--sidebar` | Sidebar background |
| `--border` | Default border |
| `--text-primary` / `--text-secondary` / `--text-muted` | Text hierarchy |
| `--brand` / `--brand-hover` / `--brand-subtle` | Primary blue (#2563eb) |
| `--success` / `--warning` / `--error` / `--info` | Semantic states |

Reference in Tailwind as `text-brand`, `bg-brand-subtle`, `text-text-muted`, etc.

### Import Alias

`@/` resolves to `./src/` — configured in both `vite.config.ts` and `tsconfig.app.json`.

### UI Conventions

- **Default mode:** Light only (no dark mode)
- **Font:** DM Sans (loaded via Google Fonts)
- **Navigation:** Detailed views are standalone pages, not drawers or modals
- **Active nav state:** `bg-brand/10 text-brand` on matching `location.pathname`
- shadcn/ui components live in `src/components/ui/` — do not modify these directly

## Backend — nexops-api

Spring Boot 4.0 + Java 21, Maven wrapper. Currently scaffolded — no domain code yet.

```bash
cd nexops-api && ./mvnw spring-boot:run   # Run
cd nexops-api && ./mvnw test              # Run all tests
cd nexops-api && ./mvnw test -Dtest=ClassName#methodName  # Single test
```

**Planned architecture — Hexagonal (Ports & Adapters) within Modular Monolith:**

```
com.nexops/
├── helpdesk/
├── inventory/
├── governance/
├── billing/
└── shared/
    ├── iam/        # RBAC with per-user permission overrides
    ├── tenant/     # PostgreSQL schema-based multi-tenancy
    ├── ai/         # AIProvider — OpenAI, Gemini, Anthropic, Null
    ├── storage/    # StorageProvider — R2, Local
    ├── events/
    └── security/   # JWT, Spring Security
```

Each module follows: `domain/model`, `domain/ports/in`, `domain/ports/out`, `domain/service`, `application/`, `infrastructure/persistence`, `infrastructure/web`.

**Hard rule:** Nothing in `domain/` may import from Spring, JPA, or any external framework. The domain is pure Java.

Inter-module communication is via domain events only — no direct domain imports between modules.
