/**
 * Global TypeScript Types
 *
 * Chứa các type dùng chung toàn project.
 * Import từ "@/types" hoặc "@/types/specific-file"
 */

// =============================================================================
// API Response Types
// =============================================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

/** Paginated API response */
export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Standard API error */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// =============================================================================
// Utility Types
// =============================================================================

/** Make specific fields optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific fields required */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/** Deep partial — tất cả nested fields đều optional */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extract the type of array element */
export type ArrayElement<T extends readonly unknown[]> =
  T extends readonly (infer E)[] ? E : never;

/** Nullable type */
export type Nullable<T> = T | null;

/** Optional type */
export type Optional<T> = T | undefined;

// =============================================================================
// UI / Component Types
// =============================================================================

/** Các size phổ biến */
export type Size = "xs" | "sm" | "md" | "lg" | "xl";

/** Các variant màu sắc phổ biến */
export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

/** Props chung cho các component có children */
export interface WithChildren {
  children: React.ReactNode;
}

/** Props chung cho các component có className */
export interface WithClassName {
  className?: string;
}

// =============================================================================
// User / Auth Types
// =============================================================================

/** User profile (extend thêm fields tuỳ dự án) */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Form Types
// =============================================================================

/** Generic form field state */
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched?: boolean;
}

// =============================================================================
// Sprint Planner Types
// =============================================================================

export type Task = {
  id: number;
  us: string;
  memberId: number;
  effort: number;
  startDate: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
};

export type State = {
  members: string[];
  tasks: Task[];
  _nextId: number;
};

