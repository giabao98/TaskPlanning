"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { throttle } from "lodash"
import { Loader2 } from "lucide-react"

export interface BrianButtonProps extends ButtonProps {
  /**
   * Thời gian throttle tính bằng milliseconds
   * @default 500
   */
  throttleMs?: number
  /**
   * Nếu true, sẽ hiện icon loading khi onClick trả về một Promise
   * @default true
   */
  showLoading?: boolean
}

export const BrianButton = React.forwardRef<HTMLButtonElement, BrianButtonProps>(
  (
    {
      children,
      onClick,
      throttleMs = 500,
      showLoading = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(false)
    
    // Giữ tham chiếu mới nhất của onClick để throttle không bị stale closures
    const onClickRef = useRef(onClick)
    useEffect(() => {
      onClickRef.current = onClick
    }, [onClick])

    const handleClick = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const handler = onClickRef.current
        if (!handler) return

        const result = handler(e) as unknown
        // Nếu handler trả về Promise (như gọi API), tự động block double click và show loading
        if (result && typeof result === "object" && "then" in result && typeof (result as { then: () => void }).then === "function") {
          setIsLoading(true)
          try {
            await result
          } finally {
            setIsLoading(false)
          }
        }
      },
      []
    )

    // Tạo throttled function, tự động cancel khi unmount
    const throttledClick = React.useMemo(
      () => throttle(handleClick, throttleMs, { leading: true, trailing: false }),
      [handleClick, throttleMs]
    )

    useEffect(() => {
      return () => {
        throttledClick.cancel()
      }
    }, [throttledClick])

    const isButtonDisabled = disabled || isLoading

    return (
      <Button
        ref={ref}
        disabled={isButtonDisabled}
        onClick={throttledClick}
        {...props}
      >
        {isLoading && showLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </Button>
    )
  }
)

BrianButton.displayName = "BrianButton"
