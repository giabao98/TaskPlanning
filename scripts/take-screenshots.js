/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require("playwright")
const fs = require("fs")
const path = require("path")

async function capture() {
  const browser = await chromium.launch({
    channel: "msedge",
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2, // HiDPI crispness
  })

  const page = await context.newPage()

  const docsDir = path.resolve(__dirname, "../docs/screenshots")
  const publicDir = path.resolve(__dirname, "../public/screenshots")

  const saveBoth = async (buffer, filename) => {
    fs.writeFileSync(path.join(docsDir, filename), buffer)
    fs.writeFileSync(path.join(publicDir, filename), buffer)
    console.log(`Saved ${filename}`)
  }

  // 1. Initial navigation to set localStorage
  await page.goto("http://localhost:3005/vi", { waitUntil: "networkidle" })

  const sampleState = {
    members: [
      "Hoàng Nam (Tech Lead)",
      "Minh Trang (Frontend)",
      "Quốc Bảo (Backend)",
      "Thu Hà (Tester)",
    ],
    tasks: [
      {
        id: 1,
        us: "US-101: Thiết kế kiến trúc & CI/CD pipeline",
        memberId: 0,
        effort: 2,
        startDate: "2026-10-22",
        status: "DONE",
      },
      {
        id: 2,
        us: "US-102: Xây dựng UI Component Library & Theme Switcher",
        memberId: 1,
        effort: 3,
        startDate: "2026-10-22",
        status: "IN_PROGRESS",
      },
      {
        id: 3,
        us: "US-103: Hiện thực REST API & JWT Authentication",
        memberId: 2,
        effort: 4,
        startDate: "2026-10-22",
        status: "IN_PROGRESS",
      },
      {
        id: 4,
        us: "US-104: Viết Automation E2E test cho Auth flow",
        memberId: 3,
        effort: 3,
        startDate: "2026-10-24",
        status: "TODO",
      },
      {
        id: 5,
        us: "US-105: Tối ưu hóa hiệu năng & Core Web Vitals",
        memberId: 1,
        effort: 2,
        startDate: "2026-10-27",
        status: "TODO",
      },
      {
        id: 6,
        us: "US-106: Tích hợp Payment Gateway (VNPAY / MoMo)",
        memberId: 2,
        effort: 3,
        startDate: "2026-10-28",
        status: "TODO",
      },
    ],
    _nextId: 7,
    sprintCapacity: 10,
    sessionName: "Sprint 14: Core Features & Launch",
    sprintStartDate: "2026-10-22",
    holidays: [{ id: "h1", date: "2026-10-26", name: "Team Building Day" }],
    memberCapacities: {
      "Hoàng Nam (Tech Lead)": 10,
      "Minh Trang (Frontend)": 10,
      "Quốc Bảo (Backend)": 10,
      "Thu Hà (Tester)": 8,
    },
  }

  await page.evaluate((state) => {
    localStorage.setItem("sprintPlannerState", JSON.stringify(state))
  }, sampleState)

  // Reload to reflect loaded state
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(1000)

  // 1. Overview Screen
  const overviewBuffer = await page.screenshot({ fullPage: false })
  await saveBoth(overviewBuffer, "overview.png")

  // 2. Full Page Dashboard
  const fullPageBuffer = await page.screenshot({ fullPage: true })
  await saveBoth(fullPageBuffer, "full-dashboard.png")

  // 3. Member Management Modal
  const memberBtn = page.locator("button:has-text('Members')").first()
  if ((await memberBtn.count()) > 0) {
    await memberBtn.click()
    await page.waitForTimeout(600)
    const modalBuffer = await page.screenshot()
    await saveBoth(modalBuffer, "member-management.png")
  }

  // Reload page to reset modal state cleanly
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(800)

  // 4. Holiday Modal
  const holidayBtn = page.locator("button:has-text('Holidays')").first()
  if ((await holidayBtn.count()) > 0) {
    await holidayBtn.click()
    await page.waitForTimeout(600)
    const holidayBuffer = await page.screenshot()
    await saveBoth(holidayBuffer, "holiday-management.png")
  }

  // Reload page to reset modal state cleanly
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(800)

  // 5. Scroll to Gantt Timeline and take screenshot
  const ganttHeader = page
    .locator("button:has-text('GANTT TIMELINE SCHEDULE')")
    .first()
  if ((await ganttHeader.count()) > 0) {
    await ganttHeader.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    const ganttViewBuffer = await page.screenshot()
    await saveBoth(ganttViewBuffer, "gantt-timeline.png")
  }

  await browser.close()
  console.log("All screenshots captured successfully!")
}

capture().catch((err) => {
  console.error("Capture failed:", err)
  process.exit(1)
})
