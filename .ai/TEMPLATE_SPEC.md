# Yêu Cầu Tính Năng (Template Spec)

> Khi cần AI làm một feature mới, copy section **"Template Điền"** bên dưới, điền thông tin, và paste vào chat.
> Càng chi tiết, AI càng ít hỏi lại và code càng đúng ngay từ đầu.

---

## 📋 Template Điền

```
## Feature: [Tên tính năng]

### Mô tả
[1-3 câu mô tả feature làm gì và tại sao cần]

### Acceptance Criteria (User sẽ thấy/làm được gì?)
- [ ] [Tiêu chí 1]
- [ ] [Tiêu chí 2]
- [ ] [UI mong muốn: ví dụ "Form với 2 input email + password, 1 BrianButton Submit"]

### API
- Endpoint cần gọi: [GET/POST/... /api/...]
- Request body: [Cấu trúc JSON nếu có]
- Response: [Cấu trúc response mong đợi]

### Edge Cases cần test
- [ ] [Ví dụ: Network timeout xử lý thế nào?]
- [ ] [Ví dụ: User submit form 2 lần liên tục?]
- [ ] [Ví dụ: Input validation fail thì thông báo gì?]

### Notes / Constraints
- [Thư viện bắt buộc/cấm dùng nếu có]
- [Yêu cầu performance nếu có]
- [Cần dùng route protection không?]
```

---

## ✅ Ví Dụ Đã Điền (Feature: Task Status Update)

```
## Feature: Task Status Update

### Mô tả
Cho phép user thay đổi status của task bằng cách click vào badge status.
Cần update ngay trên UI (optimistic), rồi gọi API ở background.

### Acceptance Criteria
- [ ] Click vào badge status → xuất hiện dropdown với 3 options: TODO, IN_PROGRESS, DONE
- [ ] Chọn option → badge đổi màu ngay lập tức (optimistic update)
- [ ] Nếu API fail → revert về status cũ + show toast error
- [ ] Button không thể click khi đang loading

### API
- Endpoint: PATCH /api/tasks/[id]
- Request body: { "status": "TODO" | "IN_PROGRESS" | "DONE" }
- Response: { data: Task, message: string, success: boolean }

### Edge Cases cần test
- [ ] Click liên tục nhiều lần trước khi API respond
- [ ] Mạng chậm (> 3 giây) thì show loading state
- [ ] Task đã DONE, user đổi về TODO rồi đổi lại

### Notes
- Dùng BrianButton để tránh double-click issue
- Optimistic update: dùng useMutation onMutate + onError (rollback)
- Không cần route protection riêng (task page đã protected rồi)
```

---

## ✅ Ví Dụ Đã Điền (Feature: Google OAuth Login)

```
## Feature: Google OAuth Login

### Mô tả
Thêm nút "Đăng nhập với Google" vào trang login.
Template đã có NextAuth v5 config sẵn, chỉ cần thêm Google provider.

### Acceptance Criteria
- [ ] Trang /login hiển thị nút "Continue with Google" (có Google icon)
- [ ] Click → redirect sang Google consent screen
- [ ] Login thành công → redirect về /dashboard
- [ ] User mới → tự động tạo record trong DB (NextAuth Prisma adapter đã xử lý)

### API
- Endpoint: /api/auth/... (NextAuth tự handle, không cần tạo thêm)
- Cần thêm env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

### Edge Cases
- [ ] User cancel Google consent → redirect về /login với error message
- [ ] Email đã tồn tại với provider khác → thông báo "Email này đã được đăng ký"

### Notes
- Uncomment Google provider trong src/auth.ts
- Thêm GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET vào .env và .env.example
- Redirect URL cần whitelist trong Google Cloud Console: {domain}/api/auth/callback/google
```
