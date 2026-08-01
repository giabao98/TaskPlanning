# Lessons Learned & Project Memory (Bộ Nhớ & Bài Học AI)

> 🧠 **File này là bộ nhớ tích lũy của AI qua từng task.**
> Mọi AI Tool (Gemini, Claude, Cursor, Copilot, Antigravity) **BẮT BUỘC** phải đọc file này khi bắt đầu session và tự động cập nhật khi học được bài học mới hoặc được User sửa lưng.

## ⚠️ Maintenance Rules (Chống Bloat)

- **Tổng file KHÔNG được vượt quá 100 dòng.** Nếu gần đạt → consolidate entries cũ.
- **Xóa entries đã outdated** (thư viện đã upgrade fix lỗi, pattern đã đổi).
- **Gộp entries liên quan** thành 1 entry rõ ràng hơn.
- Nếu một gotcha **đã được fix trong config** (jest.config, middleware, etc.) → xóa khỏi đây (code là source of truth).
- **KHÔNG ghi log task đã làm** — đó là việc của `CHANGELOG.md` và `git log`.

---

## 1. Bẫy Kỹ Thuật (Pitfalls & Gotchas)

> *Chỉ ghi lại các bẫy mà AI **không thể biết** từ code. Nếu đã fix bằng config → xóa.*

- **[Yarn Berry v4]**: Trong Dockerfile hoặc CI, luôn dùng `yarn install --immutable`, KHÔNG dùng `--frozen-lockfile` (syntax cũ của Yarn 1).
- **[NextAuth v5 Middleware]**: Phải chain Auth middleware ở ngoài và next-intl ở trong. Đã setup sẵn trong `src/middleware.ts`.
- **[Redux Persist + RSC]**: Bắt buộc wrap trong `PersistGate` ở `src/store/provider.tsx` để tránh hydration mismatch lỗi SSR.
- **[BrianButton Async Test]**: Khi test async rejection trong Jest, cần flush microtask qua `act()` + `Promise.resolve()` để tránh unhandled promise noise từ jsdom.
- **[Next 16 / Turbopack Cache]**: Khi chuyển đổi cấu trúc từ `app/page.tsx` sang `app/[locale]/page.tsx`, Turbopack bị xung đột bộ nhớ cũ gây trắng trang hoặc 404. Cần dừng server, xóa thư mục `.next` và chạy lại `yarn dev`.
- **[Vercel Edge Middleware > 1MB]**: Không import trực tiếp `auth` từ `src/auth.ts` vào `src/middleware.ts` vì Vercel sẽ đóng gói cả Prisma engine vượt 1MB. Tách cấu hình không Prisma vào `src/auth.config.ts` và dùng `NextAuth(authConfig)` trong middleware.
---

## 2. Quy Tắc User Đã Chốt (User Corrections & Decisions)

> *Những quyết định kiến trúc hoặc phong cách code mà User đã chốt riêng cho dự án này.*

*(Thêm vào đây khi user sửa lưng hoặc chốt quy tắc mới)*
