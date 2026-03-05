# Studyflow AI Architecture Redesign

## Goals
- Support multi-tenant (multi-user) data isolation and persistence
- Separate frontend and backend concerns for independent scaling and deployments
- Introduce API-driven data flows to replace browser-only state persistence
- Provide clear extensibility points for future integrations and AI services

## High-Level Overview
```
apps/
  backend/          # Express + TypeScript + Sequelize (SQLite/Postgres)
  frontend/         # React + Vite SPA consuming REST API
shared/
  types/            # Reusable TypeScript interfaces between tiers
```

## Backend Summary
- **Runtime:** Node.js 20+, Express, TypeScript
- **Persistence:** Sequelize ORM with SQLite by default (can swap to Postgres via env)
- **Auth:** Email/password with bcrypt hashing and JWT session tokens
- **Modules:** Users, Study Plans, Subjects, Topics, Study Logs, Error Notebook, Simulated Exams, Saved Notes
- **APIs:** RESTful endpoints under `/api` with version tag
- **Config:** `.env` for database URLs, JWT secrets, port configuration
- **Scalability:** Stateless API suitable for containerization, database-agnostic via Sequelize dialects

## Frontend Summary
- **Runtime:** React 18 + Vite + TypeScript
- **State:** React Query for server state, Context for auth session
- **UI:** Reuse existing component library with incremental refactor to API-driven data
- **Routing:** React Router for screen separation
- **Auth Flow:** Login/Register screens, fetch JWT, attach via `Authorization` header, refresh via local storage
- **Data Fetching:** `/api/v1/*` endpoints with optimistic updates where feasible

## Shared Contracts
- Hoist domain interfaces (UserProfile, StudyPlan, etc.) to `shared/types/domain.ts`
- Leverage Zod schemas for runtime validation in backend and request typing in frontend

## Deployment Notes
- Independent build pipelines: `apps/backend` produces Node server, `apps/frontend` serves static assets
- Recommend reverse proxy (e.g., Nginx) with `/api` routed to backend, `/` to frontend
- JWT secret and database URL managed via environment variables in production

## Migration Strategy
1. Scaffold backend service with core models and seed data.
2. Extract frontend into `apps/frontend`, update Vite config and imports.
3. Replace local storage logic with API calls using React Query.
4. Implement authentication screens and context provider for tokens.
5. Update documentation and provide scripts for both apps.
