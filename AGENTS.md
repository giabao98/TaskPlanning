# AI-First Project Rules

> Đây là file chứa toàn bộ quy tắc bắt buộc cho **mọi AI tool** (Gemini, Claude, GPT, Copilot, Cursor, v.v.) khi làm việc trong project này. Không có ngoại lệ.

---

## ⚡ Context Files — ĐỌC TRƯỚC KHI LÀM BẤT CỨ GÌ

Trước khi viết code, AI **BẮT BUỘC** đọc các file context sau:
1. `.ai/PROJECT_CONTEXT.md` — Domain, DB schema, API routes, business rules
2. `.ai/LESSONS_LEARNED.md` — Bẫy kỹ thuật, bài học từ sessions trước
3. `.ai/AI_WORKFLOW.md` — Quy trình TDD step-by-step
4. `.ai/TASTESKILL.md` — Design guidelines (đọc trước khi viết UI)

---

## ⚠️ Lưu Ý Về Next.js Version

Template này dùng **Next.js 16 với App Router**. Đây KHÔNG phải Next.js mày đã biết từ training data — có thể có breaking changes về API, conventions, và file structure. Trước khi viết bất kỳ Next.js-specific code nào, hãy đọc docs trong `node_modules/next/dist/docs/` và để ý deprecation notices.

---

## 1. Ngôn Ngữ & Stack (Không Thương Lượng)

- **Ngôn ngữ chính:** TypeScript. Mọi file `.ts` / `.tsx` phải pass strict mode.
- **Strict Mode:** KHÔNG dùng `any`. Nếu chưa biết kiểu → dùng `unknown` rồi narrow down.
- **Framework:** Next.js App Router. React Server Components (RSC) là mặc định. Chỉ thêm `"use client"` khi cần hook (`useState`, `useEffect`, event handlers).
- **Styling:** Tailwind CSS v4 + `clsx` / `tailwind-merge` thông qua hàm `cn()` từ `@/lib/utils`.
- **Design Taste:** TUYỆT ĐỐI đọc và tuân thủ `.ai/TASTESKILL.md` trước khi viết bất kỳ UI nào.

---

## 2. Quy Chuẩn Code

- **Components:** Function component hoặc arrow function. Export named, không dùng export default cho internal components.
- **Naming:** `camelCase` cho biến/hàm, `PascalCase` cho component/class/type/interface.
- **Common Components:** PHẢI dùng wrapper trong `src/components/common/` thay vì shadcn gốc:
  - Dùng `BrianButton` thay cho `Button`
  - Dùng `ErrorBoundary` để wrap các component có thể throw
- **Imports:** Dùng alias `@/` (ví dụ: `@/lib/utils`, `@/components/common`). KHÔNG dùng relative path `../../`.

---

## 3. Cấu Trúc Thư Mục — Đọc Kỹ Trước Khi Tạo File Mới

```
src/
├── app/                     # Pages, layouts, API routes (Next.js App Router)
│   ├── [locale]/            # Tất cả pages đều wrap trong locale
│   └── api/                 # API routes
├── components/
│   ├── ui/                  # shadcn/ui components — ĐỪNG SỬA trực tiếp
│   └── common/              # Custom wrapper components của project
│       ├── BrianButton.tsx  # Button với throttle + auto-loading
│       └── ErrorBoundary.tsx# Error boundary với fallback UI
├── i18n/                    # Config next-intl
├── lib/
│   ├── axios.ts             # Axios instance với interceptors — LUÔN dùng cái này
│   ├── query-provider.tsx   # TanStack Query provider
│   ├── auth-provider.tsx    # NextAuth session provider
│   ├── rate-limit.ts        # Rate limiting cho API routes
│   ├── utils.ts             # Hàm cn() — clsx + tailwind-merge
│   └── validations.ts       # Zod schemas (uncomment sau khi yarn add zod)
├── services/                # API service layer — tách logic gọi API khỏi component
│   └── user.service.ts      # Ví dụ mẫu
├── store/                   # Redux Toolkit
│   ├── index.ts
│   ├── provider.tsx         # ReduxProvider + PersistGate
│   ├── hooks.ts             # useAppDispatch, useAppSelector
│   └── slices/
├── types/
│   └── index.ts             # Global TypeScript types — định nghĩa type ở đây
├── middleware.ts             # Auth + i18n middleware chain
└── auth.ts                  # NextAuth config + Prisma client
```

**Nguyên tắc tạo file mới:**
- Logic gọi API → `src/services/[feature].service.ts`
- Type/interface dùng nhiều nơi → `src/types/index.ts`
- Utility function → `src/lib/`
- Redux state mới → `src/store/slices/[feature]Slice.ts`
- Component dùng chung → `src/components/common/`

---

## 4. Data Fetching — Service Layer Pattern (QUAN TRỌNG)

**KHÔNG gọi API thẳng trong component.** Luôn tách ra service layer:

```typescript
// ✅ ĐÚNG — Định nghĩa trong src/services/post.service.ts
import { apiClient } from "@/lib/axios";
export const postKeys = {
  all: ["posts"] as const,
  list: () => [...postKeys.all, "list"] as const,
};
export const PostService = {
  getAll: () => apiClient.get("/posts"),
  create: (data: unknown) => apiClient.post("/posts", data),
};

// ✅ ĐÚNG — Dùng trong component với TanStack Query
const { data } = useQuery({ queryKey: postKeys.list(), queryFn: PostService.getAll });
const { mutate } = useMutation({ mutationFn: PostService.create });

// ❌ SAI — Gọi API thẳng trong component
const { data } = useQuery({ queryKey: ["posts"], queryFn: () => apiClient.get("/posts") });
```

---

## 5. Quản Lý State

- Dùng Redux Toolkit + Redux Persist cho global state.
- **BẮT BUỘC** dùng `useAppDispatch` và `useAppSelector` từ `@/store/hooks`, TUYỆT ĐỐI KHÔNG dùng `useDispatch` / `useSelector` thuần.
- State tạm thời (UI-only, không cần persist) → `useState` trong component là đủ.

---

## 6. Error Handling

- Wrap các component có thể throw bằng `ErrorBoundary` từ `@/components/common/ErrorBoundary`.
- API error → để TanStack Query handle (`error` state từ `useQuery`/`useMutation`).
- KHÔNG tạo try/catch wrap toàn bộ component render.

---

## 7. Đa Ngôn Ngữ (i18n) — BẮT BUỘC

**KHÔNG hardcode text trong component.** Mọi string hiển thị với user đều phải qua next-intl:

```typescript
// ✅ ĐÚNG
import { useTranslations } from "next-intl";
const t = useTranslations("FeatureName");
return <h1>{t("title")}</h1>;

// ❌ SAI
return <h1>Tiêu đề trang</h1>;
```

Định nghĩa key trong `messages/en.json` và `messages/vi.json` trước khi dùng.

---

## 8. API Routes — Rate Limiting

Khi tạo API route mới (`src/app/api/.../route.ts`), PHẢI thêm rate limiting:

```typescript
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const limit = 10;
  const result = rateLimit(ip, { limit, windowMs: 60_000 });
  if (!result.success) {
    return Response.json({ message: "Too many requests" },
      { status: 429, headers: getRateLimitHeaders(result, limit) });
  }
  // ... xử lý bình thường
}
```

---

## 9. Quy Trình Làm Việc (Workflow)

Tuân thủ **nghiêm ngặt** quy trình trong **`.ai/AI_WORKFLOW.md`**.

Tóm tắt: **Đọc Context & Bộ Nhớ → Plan → TDD → Implement → Verify → Cập Nhật Bộ Nhớ → Commit → Báo Cáo.**

---

## 10. Tư Duy BA (Business Analyst Mindset) & Proactive Proposals

Mọi yêu cầu của User không chỉ đơn thuần là code. Quá trình làm việc, AI **BẮT BUỘC** áp dụng tư duy Business Analyst.
- **Phản biện & Đề xuất:** Sau khi xử lý xong prompt của user (hoặc khi đang lên plan), luôn dành 1-2 gạch đầu dòng để đề xuất cải thiện nghiệp vụ, phát hiện logic hổng (edge cases, security, UX flow), hoặc gợi ý tính năng liên quan để app hoàn thiện hơn.
- Không chỉ là thợ code, hãy đóng vai trò như một Product Manager / BA đồng hành cùng User.

---

## 11. Giao Tiếp Với User

- Trả lời tiếng Việt, ngắn gọn, xưng "mày/tao".
- Tập trung vào code và kết quả, không luyên thuyên lý thuyết.
- Dùng icon emoji cho dễ đọc.
