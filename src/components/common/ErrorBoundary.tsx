"use client";

import React, { Component, ErrorInfo } from "react";

// =============================================================================
// Types
// =============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Component hiển thị khi có lỗi. Nhận error và reset function */
  fallback?: (props: { error: Error; reset: () => void }) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// =============================================================================
// Default Fallback UI
// =============================================================================

function DefaultFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg
          className="h-8 w-8 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Có gì đó không ổn rồi 😅
        </h2>
        <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {error.message || "Đã xảy ra lỗi không mong muốn. Thử reload trang hoặc liên hệ hỗ trợ."}
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Thử lại
      </button>
    </div>
  );
}

// =============================================================================
// Error Boundary Class Component
// =============================================================================

/**
 * ErrorBoundary — Bắt lỗi runtime của React component tree.
 *
 * @example
 * // Dùng với fallback mặc định
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * @example
 * // Dùng với fallback tuỳ chỉnh
 * <ErrorBoundary fallback={({ error, reset }) => (
 *   <div>
 *     <p>Lỗi: {error.message}</p>
 *     <button onClick={reset}>Thử lại</button>
 *   </div>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Gửi lỗi lên error tracking service (Sentry, v.v.)
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback({ error, reset: this.reset });
      }
      return <DefaultFallback error={error} reset={this.reset} />;
    }

    return children;
  }
}
