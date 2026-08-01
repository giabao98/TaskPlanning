/**
 * Validation Schemas (Zod)
 *
 * Tập trung tất cả Zod schemas để tái sử dụng giữa client và server.
 *
 * SETUP:
 *   yarn add zod
 *
 * Sau khi cài xong, uncomment toàn bộ file này.
 *
 * @example
 * // Trong Server Action hoặc API route:
 * import { loginSchema } from "@/lib/validations";
 * const result = loginSchema.safeParse(formData);
 * if (!result.success) return { errors: result.error.flatten().fieldErrors };
 */

// import { z } from "zod";
//
// // ==========================================================================
// // Auth Schemas
// // ==========================================================================
//
// export const loginSchema = z.object({
//   email: z.string().email("Email không hợp lệ"),
//   password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
// });
//
// export const registerSchema = loginSchema
//   .extend({
//     name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").max(50),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Mật khẩu xác nhận không khớp",
//     path: ["confirmPassword"],
//   });
//
// // ==========================================================================
// // User Schemas
// // ==========================================================================
//
// export const updateProfileSchema = z.object({
//   name: z.string().min(2).max(50).optional(),
//   image: z.string().url("URL ảnh không hợp lệ").optional(),
// });
//
// // ==========================================================================
// // Inferred Types (không cần khai báo interface riêng nữa)
// // ==========================================================================
//
// export type LoginInput = z.infer<typeof loginSchema>;
// export type RegisterInput = z.infer<typeof registerSchema>;
// export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export {};
