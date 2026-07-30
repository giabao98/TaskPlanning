# Changelog

Tất cả thay đổi đáng kể của project sẽ được ghi lại tại đây.

Format theo [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning theo [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `src/types/index.ts` — Global TypeScript types tập trung (ApiResponse, PaginatedResponse, utility types)
- `src/components/common/ErrorBoundary.tsx` — Error Boundary component với default fallback UI và hỗ trợ custom fallback
- `src/services/user.service.ts` — Mẫu service layer, tách API logic khỏi component; kèm query keys cho TanStack Query
- `src/lib/rate-limit.ts` — Rate limiting utility (sliding window, in-memory) để bảo vệ API routes
- `src/lib/validations.ts` — Boilerplate Zod validation schemas (uncomment sau khi `yarn add zod`)
- `sentry.client.config.ts` — Sentry client-side boilerplate (uncomment sau khi `yarn add @sentry/nextjs`)
- `sentry.server.config.ts` — Sentry server-side boilerplate
- `.env.example` — File mẫu biến môi trường với ghi chú đầy đủ

### Changed
- `src/middleware.ts` — Chain NextAuth auth middleware với next-intl để hỗ trợ route protection; cập nhật matcher pattern
- `Dockerfile` — Sửa cú pháp Yarn Berry v4: `yarn --frozen-lockfile` → `yarn install --immutable`; thêm `.yarnrc.yml` vào COPY

### Fixed
- `Dockerfile` deps stage bị fail với Yarn Berry v4 do dùng cú pháp cũ

---

## [0.1.0] - 2026-07-18

### Added
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Redux Toolkit + Redux Persist
- TanStack Query (React Query) + Axios client với interceptors
- NextAuth v5 (Auth.js) với Prisma Adapter
- Prisma ORM + PostgreSQL schema (NextAuth models)
- next-intl i18n (vi/en)
- `BrianButton` — Custom button với throttle và auto-loading
- Docker Compose cho database local
- ESLint + Prettier + Husky + Commitlint + lint-staged
- Jest unit tests + Playwright E2E tests
- GitHub Actions CI pipeline
