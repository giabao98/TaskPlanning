/**
 * Sentry Error Tracking — Client-side Configuration
 *
 * SETUP:
 *   yarn add @sentry/nextjs
 *   npx @sentry/wizard@latest -i nextjs
 *
 * Sau khi cài xong, uncomment các dòng bên dưới và điền DSN vào .env:
 *   NEXT_PUBLIC_SENTRY_DSN="https://xxxx@oyyy.ingest.sentry.io/zzz"
 */

// import * as Sentry from "@sentry/nextjs";
//
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//
//   // Chỉ gửi lỗi khi production
//   enabled: process.env.NODE_ENV === "production",
//
//   // Tỷ lệ capture performance traces (0.0 - 1.0)
//   tracesSampleRate: 0.1,
//
//   // Replay session khi có lỗi
//   replaysOnErrorSampleRate: 1.0,
//   replaysSessionSampleRate: 0.05,
//
//   integrations: [
//     Sentry.replayIntegration({
//       maskAllText: true,
//       blockAllMedia: true,
//     }),
//   ],
// });

export {};
