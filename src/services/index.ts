/**
 * Barrel Export — src/services
 *
 * Import từ "@/services" thay vì từng file riêng lẻ.
 * AI sẽ dễ dàng discover các services đang có và tái sử dụng thay vì tạo duplicate.
 *
 * @example
 * import { UserService, userKeys } from "@/services";
 */

export { UserService, userKeys } from "./user.service";
export type { GetUsersParams, UpdateUserPayload } from "./user.service";

// Thêm service mới vào đây khi tạo:
// export { PostService, postKeys } from "./post.service";
// export { TaskService, taskKeys } from "./task.service";
