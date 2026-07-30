import { test, expect } from "@playwright/test"

test("homepage has title and can interact", async ({ page }) => {
  await page.goto("/")
  
  // Kiểm tra title mặc định
  await expect(page).toHaveTitle(/Next.js AI Template/)
  
  // Tương lai có thể thêm các check UI khác
})
