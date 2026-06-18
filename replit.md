# The Guardian Network

A production-ready ERP system for RNSIT college to reduce student dropout rates, with three distinct portals for students, parents, and faculty.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxy at `/api`)
- `pnpm --filter @workspace/guardian-network run dev` — run the frontend (port 23500, proxy at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — re-seed demo data (clears all data first)
- Required env: `DATABASE_URL` (Postgres), `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TanStack Query, Wouter, Tailwind CSS, shadcn/ui
- API: Express 5, session auth via `express-session` + `connect-pg-simple`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/`)
- Build: esbuild (CJS bundle for API server)

## Where things live

- `lib/db/src/schema.ts` — Drizzle schema (source of truth for DB tables)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — generated React Query hooks and Zod schemas
- `lib/api-client-react/src/custom-fetch.ts` — fetch wrapper with `credentials: "include"`
- `artifacts/api-server/src/routes/` — all Express route handlers
- `artifacts/guardian-network/src/pages/` — Student, Parent, Faculty portal pages
- `artifacts/guardian-network/src/contexts/AuthContext.tsx` — auth state + RequireAuth guard
- `scripts/src/seed.ts` — demo data seed script

## Architecture decisions

- Session auth via PostgreSQL-backed `connect-pg-simple` (persists across server restarts); sessions table: `user_sessions`
- After login, `queryClient.setQueryData(getGetMeQueryKey(), user)` pre-populates the cache to avoid a race condition where `/api/auth/me` fires before the browser stores the Set-Cookie
- Three themed portals share one Vite app with CSS theme variables: default (student/navy `#0c2340`), `.theme-parent` (emerald), `.theme-faculty` (crimson/rose)
- wouter `<Link>` renders `<a>` natively — never nest `<a>` inside `<Link>`; always use `className` directly on `<Link>`
- Orval-generated mutation hooks wrap body as `{ data: body }` — e.g., `login({ data: { email, password } })`

## Product

- **Student portal**: Dashboard with SGPA/attendance/timetable, Academics (subject-level marks/attendance), Scholarship eligibility, Grievance filing, Timetable view, NoteGo (notes upload/browse)
- **Parent portal**: Dashboard with child's academic status and dropout-risk alerts, Proctor chat
- **Faculty portal**: Dashboard with at-risk student counts, Student management, Attendance & marks updates, NoteGo moderation, Timetable management

## User preferences

- Three distinct color themes per portal (student: indigo/navy, parent: emerald, faculty: crimson/rose)

## Admin Portal

- Hidden route: `/guardian-admin` (not linked from any nav — users must know the URL)
- Dark slate/zinc theme, separate from the three portals
- Features: System stats, User management (edit/delete/reset password), Demo data reset
- Admin credential: `admin@rnsit.ac.in` / `password123`
- After admin login, redirected to `/guardian-admin` automatically
- `POST /api/admin/reseed` — force-reseeds entire demo dataset (admin only)

## Gotchas

- `connect-pg-simple` looks for `table.sql` at runtime, which esbuild bundles incorrectly. Set `createTableIfMissing: false` and create the `user_sessions` table manually via psql before first run (already done in dev)
- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Demo credentials: student `arjun.kumar@rnsit.ac.in`, parent `parent.kumar@example.com`, faculty `dr.mehta@rnsit.ac.in` — all `password123`

## Pointers

- See `pnpm-workspace` skill for workspace structure and TypeScript setup
- See `lib/api-client-react/src/generated/api.ts` for all generated hook signatures
