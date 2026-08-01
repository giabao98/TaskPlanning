---
# GitHub Copilot Instructions
# For full rules, see AGENTS.md. Below is a compact summary optimized for Copilot's context window.
# Docs: https://docs.github.com/en/copilot/customizing-copilot/adding-custom-instructions-for-github-copilot
---

This project is an AI-First Next.js 16 web template. Follow ALL rules below strictly.

## Stack & Language
- TypeScript strict mode — NO `any`, use `unknown` when type is unclear
- Next.js 16 App Router — RSC by default, add `"use client"` only when needed. Read `node_modules/next/dist/docs/` for breaking changes.
- Tailwind CSS v4 + shadcn/ui — use `cn()` from `@/lib/utils` for class merging
- All imports must use `@/` alias, NOT relative paths

## Folder Structure (Where to Put New Files)
- New page → `src/app/[locale]/[feature]/page.tsx`
- New API route → `src/app/api/[feature]/route.ts`
- New UI component → `src/components/ui/` (shadcn) or `src/components/common/` (custom)
- New API service → `src/services/[feature].service.ts`
- New global type → `src/types/index.ts`
- New Redux slice → `src/store/slices/[feature]Slice.ts`
- New utility → `src/lib/[name].ts`
- New unit test → `src/__tests__/[mirror of src structure]`

## Critical Rules

### 1. Use Wrapper Components
- Use `BrianButton` (from `@/components/common`) instead of `Button`
- Wrap risky components with `ErrorBoundary` (from `@/components/common`)

### 2. Service Layer for API Calls
NEVER call `apiClient` directly in a component. Always create a service:
```typescript
// src/services/feature.service.ts
import { apiClient } from "@/lib/axios";
export const featureKeys = {
  all: ["features"] as const,
  list: () => [...featureKeys.all, "list"] as const,
};
export const FeatureService = {
  getAll: () => apiClient.get("/features"),
  create: (data: unknown) => apiClient.post("/features", data),
};
```
Then use TanStack Query with key factories:
```typescript
const { data } = useQuery({ queryKey: featureKeys.list(), queryFn: FeatureService.getAll });
```

### 3. Redux Typed Hooks Only
```typescript
// ✅ CORRECT
import { useAppDispatch, useAppSelector } from "@/store/hooks";
// ❌ WRONG
import { useDispatch, useSelector } from "react-redux";
```

### 4. i18n — No Hardcoded Strings
```typescript
import { useTranslations } from "next-intl";
const t = useTranslations("FeatureName");
return <h1>{t("title")}</h1>;
```

### 5. Rate Limit All API Routes
```typescript
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
const result = rateLimit(ip, { limit: 10, windowMs: 60_000 });
if (!result.success) {
  return Response.json({ message: "Too many requests" },
    { status: 429, headers: getRateLimitHeaders(result, 10) });
}
```

### 6. Commit Messages (Conventional Commits)
Format: `type(scope): description`
Types: feat | fix | docs | refactor | test | chore | style
Example: `feat(auth): add Google OAuth provider`
Update `CHANGELOG.md` if changes affect user-facing behavior.

## Design Rules (from .ai/TASTESKILL.md)
- Read the brief before picking an aesthetic — do NOT default to purple gradients + dark mesh
- Anti-slop: no generic glassmorphism, no cookie-cutter 3-card feature sections
- Prefer custom, purposeful animations over generic hover effects
