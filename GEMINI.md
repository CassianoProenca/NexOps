# GEMINI.md

## Project Overview

**NexOps** is a comprehensive B2B SaaS platform for IT Management and Governance, featuring intelligent helpdesk, asset/inventory control, and SLA/performance monitoring. It is designed as a Modular Monolith following Hexagonal Architecture (Ports & Adapters) for the backend and a modern React-based frontend.

### Main Technologies

*   **Front-end:** React 19 (Vite), TypeScript, Tailwind CSS, shadcn/ui, Lucide React.
*   **Back-end (per documentation):** Java 21, Spring Boot 3.x, PostgreSQL 16, Redis, RabbitMQ.
*   **Infrastructure:** Docker Compose, Cloudflare R2, Nginx Proxy Manager.
*   **AI:** Optional integration with OpenAI, Google Gemini, and Anthropic Claude.

---

## Directory Structure

*   `nexops-web/`: The core frontend application.
*   `NEXOPS-NOTAS.md`: Detailed design decisions, color palettes, and project status notes.
*   `README.md`: General project documentation, architecture, and tech stack.
*   `nexops-design-directions.html`: Visual design references and directions.

---

## Building and Running

### Front-end (`nexops-web/`)

| Action | Command |
| :--- | :--- |
| **Install Dependencies** | `npm install` |
| **Development Mode** | `npm run dev` |
| **Build for Production** | `npm run build` |
| **Linting** | `npm run lint` |
| **Preview Build** | `npm run preview` |

### Back-end

The backend code is currently not located in this specific directory tree, but according to documentation, it is built with **Spring Boot** and managed with **Docker Compose**.

---

## Development Conventions

### Architecture & Style
*   **Backend Strategy:** Modular Monolith with Hexagonal Architecture.
*   **Frontend Design:** Follows a clean, corporate "Atlassian-style" UI.
*   **Styling:** Uses Tailwind CSS with a predefined palette (Zinc base + Blue-600 primary).
*   **Design tokens:** Managed via CSS variables (e.g., `--brand`, `--surface`, `--text-primary`).

### Key UI Principles (from `NEXOPS-NOTAS.md`)
*   **Default Mode:** Light mode.
*   **Primary Font:** DM Sans.
*   **Layout:** Consistent Sidebar + Header + Footer structure.
*   **Navigation:** Detailed views (like ticket details) should be standalone pages, not drawers/modals.

### Testing
*   **Frontend:** Linting via ESLint and Type checking via TypeScript (`tsc`).
*   **Backend (per documentation):** JUnit 5 and Testcontainers for domain and integration testing.

---

## Technical Context

*   **Multi-tenancy:** The system implements schema-based isolation in PostgreSQL.
*   **RBAC:** Role-Based Access Control with attribute overrides per user.
*   **IA BYOK:** "Bring Your Own Key" model where tenants provide their own API keys for AI features.
