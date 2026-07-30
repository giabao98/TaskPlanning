# 🚀 AI-First Web Template Guide

Chào mừng bạn đến với **AI-First Web Template**! Đây là một template Next.js production-ready, được thiết kế đặc biệt để kết hợp hoàn hảo với quy trình "Vibe Coding" (Lập trình với sự hỗ trợ của AI). Template đã được tích hợp sẵn mọi công nghệ từ Frontend, State Management, Authentication, Data Fetching cho đến Database ORM.

## 🛠 Tech Stack Tích Hợp

| Hạng mục | Công nghệ |
|---|---|
| **Core Framework** | Next.js 16 (App Router) + TypeScript strict |
| **Styling & UI** | Tailwind CSS v4 + shadcn/ui |
| **State Management** | Redux Toolkit + Redux Persist |
| **Data Fetching** | TanStack Query (React Query) + Axios |
| **Authentication** | NextAuth v5 (Auth.js) |
| **Database & ORM** | PostgreSQL (Docker) + Prisma ORM |
| **Đa ngôn ngữ** | next-intl (vi/en) |
| **Code Quality** | ESLint, Prettier, Husky, Commitlint, lint-staged |
| **Testing** | Jest (Unit), Playwright (E2E) |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker + Docker Compose |

---

## 🚦 Hướng Dẫn Khởi Chạy Project

### 1. Cài Đặt Dependencies

Project này dùng **Yarn Berry (v4)**. Cần có Node.js ≥ 18 và corepack:

```bash
# Kích hoạt corepack (lần đầu thôi)
corepack enable

# Cài dependencies
yarn install
```

### 2. Thiết Lập Biến Môi Trường (.env)

Copy file mẫu và điền giá trị vào:

```bash
cp .env.example .env
```

Các biến bắt buộc:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/webtemplate?schema=public"
AUTH_SECRET="your-super-secret-auth-key-change-me"
```

> **💡 Tạo AUTH_SECRET mạnh:** `openssl rand -base64 32`

### 3. Dựng Database Bằng Docker

Đảm bảo đã cài Docker Desktop. Khởi động PostgreSQL:

```bash
docker-compose up -d
```

### 4. Khởi Tạo Prisma & Sync DB

```bash
# Tạo Prisma Client types
yarn prisma generate

# Đẩy schema vào database
yarn prisma db push
```

### 5. Chạy Development Server

```bash
yarn dev
```

Mở trình duyệt: `http://localhost:3000` 🎉

---

## 🧪 Chạy Tests

```bash
# Unit tests (Jest)
yarn test

# Unit tests ở watch mode
yarn test --watch

# E2E tests (Playwright) — cần dev server đang chạy
yarn playwright test

# Typecheck
yarn tsc --noEmit

# Lint
yarn lint
```

---

## 🚀 Hướng Dẫn Khởi Tạo Dự Án Mới (Dành Cho Project Mới)

Khi bạn copy/fork template này để bắt đầu một dự án mới, hãy thực hiện lần lượt các bước sau:

### 1. Đổi Tên Project & Reset Git
```bash
# Đổi tên trong package.json
# Sửa "name": "web-template" thành tên dự án của bạn (ví dụ: "my-awesome-app")

# (Tuỳ chọn) Re-init Git nếu muốn xoá lịch sử commit cũ:
rm -rf .git
git init
```

### 2. Điền Thông Tin Context Cho AI (`.ai/PROJECT_CONTEXT.md`)
Mở file `.ai/PROJECT_CONTEXT.md` và điền mô tả ngắn về dự án, các bảng DB dự kiến, API routes. File này giúp AI (Cursor, Gemini, Claude, Copilot) **hiểu ngay bài toán mà không cần hỏi lại**.

---

## 🧠 Quy Trình "Vibe Coding" Với AI

Template này có thư mục `.ai/` — "não bộ" của AI. Bất kỳ khi nào bạn nhờ AI (Claude, GPT, Gemini, Cursor) viết code trong project này, **AI sẽ tự động đọc `.ai/` trước tiên**.

### Các file trong thư mục `.ai/`:
- **`PROJECT_CONTEXT.md`**: *(QUAN TRỌNG)* Nơi bạn điền thông tin dự án mới. Càng chi tiết, AI càng code đúng.
- **`LESSONS_LEARNED.md`**: Bộ nhớ tích lũy — AI tự ghi gotchas, bẫy kỹ thuật, và corrections từ user qua từng task.
- **`TEMPLATE_SPEC.md`**: Mẫu yêu cầu feature. Copy template, điền thông tin, paste vào chat cho AI.
- **`AI_WORKFLOW.md`**: Quy trình TDD (Test-Driven Development) và commit convention.
- **`TASTESKILL.md`**: Bộ quy chuẩn thiết kế UI/UX hiện đại (Anti-slop design system).

### Các file trỏ luật cho từng AI tool:
- **`AGENTS.md`**: Source of truth — chứa toàn bộ code conventions (Gemini, Antigravity đọc file này).
- **`CLAUDE.md`**: Trỏ Claude đọc `AGENTS.md` + context files.
- **`.cursorrules`**: Trỏ Cursor đọc `.ai/` directory.
- **`.github/copilot-instructions.md`**: Tóm tắt rules cho GitHub Copilot.

---

## 📝 Quy Tắc Commit (Conventional Commits)

Project đã tích hợp **Husky** và **Commitlint**. Mọi commit message không đúng chuẩn sẽ bị từ chối tự động.

**Cú pháp commit:**
```text
<type>(<scope>): <mô tả ngắn>
```

**Các type hợp lệ:**
- `feat`: Thêm tính năng mới (ví dụ: `feat(auth): add Google OAuth`)
- `fix`: Sửa lỗi (ví dụ: `fix(button): prevent double click`)
- `docs`: Sửa tài liệu (ví dụ: `docs(guide): update deployment section`)
- `refactor`: Refactor code (ví dụ: `refactor(user): extract service layer`)
- `test`: Thêm/sửa test (ví dụ: `test(button): add unit tests`)
- `chore`: Cập nhật deps, build config (ví dụ: `chore(deps): upgrade next.js`)

---

## 📂 Cấu Trúc Thư Mục

```text
├── .ai/                          # "Não bộ" AI — rules, instructions, design taste
├── .github/
│   └── workflows/ci.yml          # CI: lint → typecheck → unit test → e2e test
├── prisma/
│   └── schema.prisma             # Prisma schema (NextAuth models + custom models)
├── messages/
│   ├── en.json                   # Bản dịch tiếng Anh
│   └── vi.json                   # Bản dịch tiếng Việt
├── sentry.client.config.ts       # Sentry boilerplate (client-side, opt-in)
├── sentry.server.config.ts       # Sentry boilerplate (server-side, opt-in)
├── .env.example                  # Mẫu biến môi trường — copy thành .env
├── CHANGELOG.md                  # Lịch sử thay đổi của template
├── docker-compose.yml            # PostgreSQL dev environment
└── src/
    ├── app/
    │   ├── [locale]/
    │   │   ├── layout.tsx        # Root layout (i18n + providers)
    │   │   └── page.tsx          # Trang chủ
    │   └── api/auth/             # NextAuth API endpoints
    ├── components/
    │   ├── ui/                   # shadcn/ui components (đừng sửa trực tiếp)
    │   └── common/               # Wrapper components của project
    │       ├── BrianButton.tsx   # Button với throttle + auto-loading
    │       └── ErrorBoundary.tsx # Error boundary với fallback UI
    ├── i18n/
    │   ├── routing.ts            # Cấu hình locales
    │   └── request.ts            # Server-side i18n config
    ├── lib/
    │   ├── axios.ts              # Axios instance với interceptors
    │   ├── query-provider.tsx    # TanStack Query provider
    │   ├── auth-provider.tsx     # NextAuth session provider
    │   ├── rate-limit.ts         # Rate limiting utility cho API routes
    │   ├── utils.ts              # Hàm cn() (clsx + tailwind-merge)
    │   └── validations.ts        # Zod validation schemas (opt-in)
    ├── services/
    │   └── user.service.ts       # Mẫu service layer (tách API logic khỏi component)
    ├── store/
    │   ├── index.ts              # Redux store + persist config
    │   ├── provider.tsx          # ReduxProvider với PersistGate
    │   ├── hooks.ts              # useAppDispatch / useAppSelector
    │   └── slices/
    │       └── appSlice.ts       # App slice (theme, sidebarOpen)
    ├── types/
    │   └── index.ts              # Global TypeScript types
    ├── middleware.ts              # i18n routing + Auth guard (chain middleware)
    ├── auth.ts                   # NextAuth config + Prisma client
    └── __tests__/
        └── components/
            └── BrianButton.test.tsx  # Unit tests cho BrianButton
```

---

## 🎯 Các Thành Phần Đáng Chú Ý

### 1. 🔘 `BrianButton` — Custom Button

`src/components/common/BrianButton.tsx`

Wrapper của shadcn/ui Button với 2 tính năng bổ sung:
- **Throttle**: Chống double-click bằng `lodash.throttle` (mặc định 500ms)
- **Auto Loading**: Nếu `onClick` trả về `Promise` → tự động disable button và show spinner

```tsx
import { BrianButton } from "@/components/common/BrianButton";

// Sync handler — hoạt động như button bình thường
<BrianButton onClick={() => console.log("clicked")}>Click</BrianButton>

// Async handler — tự động show loading khi đang gọi API
<BrianButton onClick={async () => {
  await apiClient.post("/api/submit", data);
}}>
  Submit
</BrianButton>
```

---

### 2. 🛡️ `ErrorBoundary` — Bắt Lỗi Runtime

`src/components/common/ErrorBoundary.tsx`

Bắt lỗi trong React component tree, ngăn app crash toàn bộ.

```tsx
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Dùng với fallback UI mặc định (đã có sẵn)
<ErrorBoundary>
  <MyRiskyComponent />
</ErrorBoundary>

// Dùng với fallback tuỳ chỉnh
<ErrorBoundary fallback={({ error, reset }) => (
  <div>
    <p>Lỗi: {error.message}</p>
    <button onClick={reset}>Thử lại</button>
  </div>
)}>
  <MyRiskyComponent />
</ErrorBoundary>
```

---

### 3. 🌐 Cách Gọi API — Service Layer Pattern

**Bước 1:** Định nghĩa service trong `src/services/`:

```ts
// src/services/post.service.ts
import { apiClient } from "@/lib/axios";

export const postKeys = {
  all: ["posts"] as const,
  list: () => [...postKeys.all, "list"] as const,
  detail: (id: string) => [...postKeys.all, id] as const,
};

export const PostService = {
  getAll: () => apiClient.get("/posts"),
  getById: (id: string) => apiClient.get(`/posts/${id}`),
  create: (data: unknown) => apiClient.post("/posts", data),
};
```

**Bước 2:** Dùng trong component với TanStack Query:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PostService, postKeys } from "@/services/post.service";

function PostList() {
  const { data, isLoading } = useQuery({
    queryKey: postKeys.list(),
    queryFn: PostService.getAll,
  });

  const qc = useQueryClient();
  const { mutate: createPost } = useMutation({
    mutationFn: PostService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: postKeys.all }),
  });

  // ...
}
```

---

### 4. 🔒 Route Protection (Auth Guard)

Thêm route vào `PROTECTED_ROUTES` trong `src/middleware.ts`:

```ts
// src/middleware.ts
const PROTECTED_ROUTES: string[] = [
  "/dashboard",
  "/profile",
  "/settings",
];
```

Mọi request vào các route này mà chưa đăng nhập sẽ bị redirect về `/login?callbackUrl=...`.

---

### 5. 🚦 Rate Limiting — Bảo Vệ API Routes

`src/lib/rate-limit.ts`

Dùng trong các API route để chống spam:

```ts
// src/app/api/contact/route.ts
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = 5; // tối đa 5 requests/phút
  const result = rateLimit(ip, { limit, windowMs: 60_000 });

  if (!result.success) {
    return Response.json(
      { message: "Quá nhiều yêu cầu. Thử lại sau." },
      { status: 429, headers: getRateLimitHeaders(result, limit) }
    );
  }

  // Xử lý bình thường...
}
```

> ⚠️ `rate-limit.ts` dùng in-memory store — chỉ phù hợp single-instance. Multi-instance cần Redis (xem [Upstash](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)).

---

### 6. 🌍 Đa Ngôn Ngữ (i18n)

Định nghĩa text ở `messages/en.json` và `messages/vi.json`, **không** hardcode trong component:

```tsx
import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations("Index");
  return <h1>{t("title")}</h1>;
}
```

Thêm ngôn ngữ mới: cập nhật `src/i18n/routing.ts` và tạo file `messages/{locale}.json`.

---

### 7. 🗃️ State Management (Redux)

Luôn dùng typed hooks, **KHÔNG** dùng `useDispatch`/`useSelector` thuần:

```tsx
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme, toggleSidebar } from "@/store/slices/appSlice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.app.theme);

  return (
    <button onClick={() => dispatch(setTheme("dark"))}>
      Theme: {theme}
    </button>
  );
}
```

Thêm slice mới: tạo file trong `src/store/slices/`, rồi register vào `rootReducer` trong `src/store/index.ts`.

---

## 🐳 Docker — Production Build

Build và chạy production image:

```bash
docker build -t my-app .
docker run -p 3000:3000 --env-file .env my-app
```

Hoặc dùng docker-compose cho cả app + database:

```yaml
# Thêm service app vào docker-compose.yml nếu cần
```

---

## 🔌 Opt-in Features (Cần Cài Thêm)

Các tính năng sau đã có boilerplate sẵn, chỉ cần install package và uncomment code:

| Tính năng | Package | File |
|---|---|---|
| **Form Validation** | `yarn add zod` | `src/lib/validations.ts` |
| **Error Tracking** | `yarn add @sentry/nextjs` | `sentry.client.config.ts`, `sentry.server.config.ts` |
| **Auth Providers** | Không cần cài thêm | `src/auth.ts` (uncomment provider muốn dùng) |

---

Chúc bạn có những trải nghiệm "Vibe Coding" nhàn nhã và mượt mà nhất cùng AI-First Web Template! 🚀
