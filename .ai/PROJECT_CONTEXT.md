# Project Context

> 📌 **Dành cho AI:** Đọc file này đầu tiên trước khi bắt đầu bất kỳ task nào. File này mô tả domain, cấu trúc, và state hiện tại của project để mày không cần "khám phá" lại codebase từ đầu mỗi lần.
>
> 📌 **Dành cho User:** Điền thông tin vào các section bên dưới khi bắt đầu dùng template cho project mới. Càng chi tiết, AI càng làm đúng hơn và nhanh hơn.

---

## 1. Thông Tin Project

```
Tên project   : [Điền tên project]
Mô tả ngắn   : [1-2 câu mô tả project làm gì]
Target users  : [Ai sẽ dùng app này?]
Tech stage    : [MVP / Beta / Production]
```

**Ví dụ:**
```
Tên project   : TaskFlow
Mô tả ngắn   : Ứng dụng quản lý công việc nhóm cho startup nhỏ, tương tự Trello nhưng đơn giản hơn
Target users  : Team lead và member trong team startup 5-20 người
Tech stage    : MVP
```

---

## 2. Database Schema (Tóm Tắt)

> Liệt kê các model chính trong Prisma schema. AI cần biết tên bảng và relations để generate code đúng.

```
[Điền tóm tắt các model chính]
```

**Ví dụ:**
```
User          - id, name, email, role(ADMIN/MEMBER), teamId
Team          - id, name, ownerId
Project       - id, name, description, teamId, status(ACTIVE/ARCHIVED)
Task          - id, title, description, status(TODO/IN_PROGRESS/DONE), assigneeId, projectId, dueDate
Comment       - id, content, taskId, authorId, createdAt
```

---

## 3. API Routes Hiện Có

> Liệt kê các API endpoints đã implement. AI sẽ tránh tạo duplicate và biết cách gọi đúng endpoint.

```
[Điền danh sách API routes]
```

**Ví dụ:**
```
POST   /api/auth/...nextauth   → NextAuth (có sẵn từ template)
GET    /api/projects           → Lấy danh sách projects của user
POST   /api/projects           → Tạo project mới
GET    /api/projects/[id]      → Chi tiết project
GET    /api/projects/[id]/tasks → Danh sách tasks của project
POST   /api/tasks              → Tạo task mới
PATCH  /api/tasks/[id]         → Cập nhật task (status, assignee)
DELETE /api/tasks/[id]         → Xóa task
```

---

## 4. Pages / Routes Hiện Có

> Liệt kê các pages đã có. AI sẽ tránh tạo duplicate và biết routing structure.

```
/ (hoặc /[locale])    → Trang chủ Sprint Planner (quản lý task, thành viên, biểu đồ Gantt)
```

**Ví dụ:**
```
/                    → Landing page (public)
/login               → Trang đăng nhập
/dashboard           → Dashboard tổng quan (protected)
/projects            → Danh sách projects (protected)
/projects/[id]       → Chi tiết project + danh sách tasks (protected)
/settings            → Cài đặt tài khoản (protected)
```

---

## 5. Services Đã Có

> Liệt kê services trong `src/services/`. AI sẽ tái sử dụng thay vì tạo duplicate.

```
[Điền danh sách services đã có]
```

**Ví dụ:**
```
UserService    → getAll, getById, update, delete
ProjectService → getAll, getById, create, update, archive
TaskService    → getByProject, create, update, delete, assign
```

---

## 6. Redux State Hiện Có

> Liệt kê các slices đang có trong `src/store/slices/`. AI sẽ biết state nào đã được quản lý tập trung.

```
appSlice  → theme (light/dark/system), sidebarOpen
[Thêm slices của project vào đây]
```

---

## 7. Business Rules Quan Trọng

> Các rule domain-specific mà AI cần biết để không generate code sai logic.

```
[Điền các business rules]
```

**Ví dụ:**
```
- Chỉ ADMIN của team mới có thể xóa project
- Task chỉ có thể assign cho member cùng team
- Project ARCHIVED không cho phép tạo task mới
- User chỉ có thể thuộc 1 team tại 1 thời điểm
- Free plan giới hạn tối đa 3 projects / team
```

---

## 8. Auth & Permissions

```
Auth provider đang dùng : [Email/Password | Google | GitHub | ...]
Session strategy        : JWT (đã config sẵn trong template)
Protected routes        : [Danh sách routes cần đăng nhập]
Role-based access       : [Có/Không — nếu có, mô tả roles]
```

---

## 9. Ghi Chú Kỹ Thuật Đặc Biệt

> Những quirks, workarounds, hoặc quyết định kỹ thuật đặc biệt mà AI cần biết để không "fix" lại những gì đã được cố tình làm vậy.

```
[Điền nếu có]
```

**Ví dụ:**
```
- Dùng optimistic update cho task status change (không await API, revert nếu fail)
- File upload dùng presigned S3 URL thay vì upload qua Next.js API (tránh 4MB limit)
- Redis cache cho project list (TTL 5 phút) — đừng thêm revalidation tags vào đây
```

---

*File này nên được cập nhật mỗi khi có thêm model, API route, hoặc page mới.*
