/**
 * User Service
 *
 * Tầng service tách biệt logic gọi API khỏi component.
 * Luôn dùng apiClient từ "@/lib/axios" thay vì fetch trực tiếp.
 *
 * Pattern:
 *   Component → useQuery/useMutation (TanStack Query) → Service → apiClient (Axios)
 *
 * @example
 * // Trong component:
 * const { data } = useQuery({
 *   queryKey: userKeys.list(),
 *   queryFn: UserService.getAll,
 * })
 */

import { apiClient } from "@/lib/axios";
import type { UserProfile, PaginatedResponse } from "@/types";

// =============================================================================
// Query Keys (Dùng chung để invalidate cache đúng chỗ)
// =============================================================================

export const userKeys = {
  all: ["users"] as const,
  list: (params?: Record<string, unknown>) =>
    [...userKeys.all, "list", params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

// =============================================================================
// Request/Response Types
// =============================================================================

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UpdateUserPayload {
  name?: string;
  image?: string;
}

// =============================================================================
// Service Functions
// =============================================================================

export const UserService = {
  /** Lấy danh sách users có phân trang */
  getAll: (params?: GetUsersParams): Promise<PaginatedResponse<UserProfile>> =>
    apiClient.get("/users", { params }),

  /** Lấy chi tiết 1 user theo ID */
  getById: (id: string): Promise<UserProfile> =>
    apiClient.get(`/users/${id}`),

  /** Cập nhật profile của user */
  update: (id: string, payload: UpdateUserPayload): Promise<UserProfile> =>
    apiClient.patch(`/users/${id}`, payload),

  /** Xoá user */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/users/${id}`),
};
