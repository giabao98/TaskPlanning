# AI Workflow (Quy trình làm việc cho AI)

Chào AI (Cursor, Copilot, Gemini, Claude, v.v.) 👋. Khi được giao một task trong dự án này, mày PHẢI tuân thủ các bước sau đây một cách nghiêm ngặt:

## Bước 0: Đọc Context & Bộ Nhớ Dự Án

1. Đọc **`.ai/PROJECT_CONTEXT.md`** để hiểu domain, database schema, và API đang có.
2. Đọc **`.ai/LESSONS_LEARNED.md`** để nắm các bẫy kỹ thuật và bài học từ các task trước.
3. Nếu chưa nắm rules → đọc **`AGENTS.md`** (source of truth cho code conventions).
4. Tìm kiếm trong codebase xem có components/services liên quan không (`Ctrl+Shift+F` hoặc grep).
5. Nếu yêu cầu mơ hồ → hỏi lại user **đúng 1 câu**, không hỏi dồn nhiều.

## Bước 1: Phân Tích & Tài Liệu

1. Xác định rõ: cần tạo file mới nào, sửa file nào, xóa file nào.
2. Kiểm tra xem đã có component/service tương tự chưa để tái sử dụng.
3. Lên plan ngắn gọn (3-5 bullets) trước khi code.

## Bước 2: Viết Test Trước (Test-Driven Development)

1. **Tuyệt đối không code logic ngay.**
2. Viết Unit Test bằng Jest (cho utils/hooks) hoặc React Testing Library (cho Component) trong `src/__tests__/`.
3. Đảm bảo test bao phủ happy path + edge cases quan trọng.
4. Chạy `yarn test` → xác nhận test đang đỏ (fail expected).

## Bước 3: Viết Code (Implementation)

1. Code logic/component để pass các test cases vừa tạo.
2. Tuân thủ **AGENTS.md** về conventions.
3. Dùng lại common components (`BrianButton`, `ErrorBoundary`) thay vì tự chế.
4. Service layer cho API calls, KHÔNG gọi thẳng trong component.
5. Dùng `useTranslations()` cho mọi user-facing text.

## Bước 4: Chạy Test & Verify

1. `yarn test` → phải xanh hết.
2. `yarn lint` → 0 errors.
3. `yarn tsc --noEmit` → 0 type errors.
4. Tự sửa lỗi nếu có — KHÔNG báo cáo khi còn lỗi chưa fix.

## Bước 4.5: Cập Nhật Bộ Nhớ AI (Self-Learning & Context Update)

> ⚠️ **BẮT BUỘC:** Trước khi commit, AI phải thực hiện cập nhật bộ nhớ dự án:

1. **Cập nhật `.ai/PROJECT_CONTEXT.md`**: Thêm các API endpoints mới, Prisma models mới, Redux slices mới, hoặc Pages mới vừa tạo.
2. **Cập nhật `.ai/LESSONS_LEARNED.md`** (chỉ khi cần):
   - Nếu gặp bug lạ / bẫy thư viện mà AI không thể biết từ code → Ghi vào *Bẫy Kỹ Thuật*.
   - Nếu được User sửa lưng / uốn nắn quy tắc mới → Ghi vào *Quy Tắc User Đã Chốt*.
   - **Consolidate**: Nếu file gần 100 dòng → gộp entries liên quan, xóa entries đã outdated.
   - **KHÔNG ghi log task** — đó là việc của `CHANGELOG.md` và `git log`.

## Bước 5: Commit

Commit theo **Conventional Commits**. Format bắt buộc: `type(scope): description`

| Type | Khi nào dùng | Ví dụ |
|---|---|---|
| `feat` | Thêm tính năng mới | `feat(auth): add Google OAuth` |
| `fix` | Sửa bug | `fix(button): prevent double submit` |
| `docs` | Chỉ sửa documentation | `docs(readme): update setup guide` |
| `refactor` | Refactor (không thêm feature, không fix bug) | `refactor(api): extract service layer` |
| `test` | Thêm/sửa tests | `test(button): add loading state coverage` |
| `chore` | Build, deps, config | `chore(deps): upgrade next to 16.3` |
| `style` | CSS, formatting | `style(layout): fix padding inconsistency` |

> ⚠️ Husky + Commitlint sẽ reject commit nếu không đúng format. Không bypass bằng `--no-verify`.

Nếu thay đổi ảnh hưởng user-facing behavior → **cập nhật `CHANGELOG.md`** vào section `[Unreleased]`.

## Bước 6: Báo Cáo Kết Quả

Trả lời ngắn gọn (< 5 bullets):
- ✅ Đã làm gì
- 🧪 Test kết quả (N/N pass)
- 🧠 Đã cập nhật bộ nhớ AI (`PROJECT_CONTEXT.md` & `LESSONS_LEARNED.md`)
- ⚠️ Điểm nào cần user review (nếu có)
- 🚀 Bước tiếp theo đề xuất (nếu có)

