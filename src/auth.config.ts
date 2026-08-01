import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    // Thêm các providers của mày vào đây (Google, GitHub, Credentials, v.v.)
    // Ví dụ:
    // GitHub({
    //   clientId: process.env.GITHUB_CLIENT_ID,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET,
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
