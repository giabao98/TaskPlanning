import NextAuth from "next-auth";
import authConfig from "./auth.config";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

/**
 * Danh sách các route cần đăng nhập mới được vào.
 * Ví dụ: ["/dashboard", "/profile", "/settings"]
 */
const PROTECTED_ROUTES: string[] = [];

/**
 * Middleware được chain: Auth (ngoài) → i18n (trong)
 *
 * - Kiểm tra session NextAuth trước
 * - Nếu route nằm trong PROTECTED_ROUTES và chưa đăng nhập → redirect về /login
 * - Sau đó để next-intl xử lý locale routing bình thường
 */
export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;

  // Kiểm tra route có cần bảo vệ không
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  // Để next-intl xử lý phần còn lại (locale redirect, cookie, v.v.)
  return intlMiddleware(req);
});

export const config = {
  // Match internationalized pathnames, bỏ qua static files và api routes
  matcher: ["/", "/(vi|en|ja)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
