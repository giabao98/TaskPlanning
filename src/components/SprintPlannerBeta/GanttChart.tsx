"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toPng } from "html-to-image";
import { Camera, Flag, Sparkles } from "lucide-react";
import { type Task, type Holiday } from "@/types";
import {
  todayStr,
  computeEndDate,
  workdayRange,
  addWorkingDays,
  prevWorkday,
  nextWorkday,
  parseDate,
} from "@/utils/dateUtils";
import { getTaskColor } from "@/utils/colors";

interface GanttChartProps {
  tasks: Task[];
  members: string[];
  onUpdateTask: (id: number, field: keyof Task, value: any) => void;
  holidays?: Holiday[];
  sprintStartDate?: string;
  sprintEndDate?: string;
  sessionName?: string;
}

const COL_WIDTH = 46; // pixels per day

const AVATAR_COLORS = [
  "bg-indigo-600",
  "bg-purple-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-teal-600",
  "bg-cyan-600",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function computeGanttRange(tasks: Task[], holidays?: Holiday[]) {
  if (tasks.length === 0) {
    const t = todayStr();
    return { days: workdayRange(t, addWorkingDays(t, 14, holidays)) };
  }
  let minDate = tasks[0].startDate;
  let maxDate = computeEndDate(tasks[0].startDate, tasks[0].effort, holidays);
  tasks.forEach((t) => {
    if (t.startDate < minDate) minDate = t.startDate;
    const end = computeEndDate(t.startDate, t.effort, holidays);
    if (end > maxDate) maxDate = end;
  });
  let from = minDate,
    to = maxDate;
  for (let i = 0; i < 3; i++) {
    from = prevWorkday(from, holidays);
    to = nextWorkday(to, holidays);
  }
  return { days: workdayRange(from, to), from, to };
}

function assignLanes(tasks: Task[], holidays?: Holiday[]) {
  const sorted = tasks
    .map((t) => ({
      ...t,
      _end: computeEndDate(t.startDate, t.effort, holidays),
    }))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const laneEnds: string[] = [];
  const laneMap: Record<number, number> = {};
  for (const t of sorted) {
    let lane = laneEnds.findIndex((end) => end <= t.startDate);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = t._end;
    laneMap[t.id] = lane;
  }
  return { laneMap, numLanes: Math.max(laneEnds.length, 1) };
}

export default function GanttChart({
  tasks,
  members,
  onUpdateTask,
  holidays = [],
  sprintStartDate,
  sprintEndDate,
  sessionName,
}: GanttChartProps) {
  const t = useTranslations("Gantt");
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    text: string;
    x: number;
    y: number;
  }>({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  const handleExportImage = async () => {
    if (!chartWrapperRef.current) return;
    try {
      setIsExportingImage(true);
      const dataUrl = await toPng(chartWrapperRef.current, {
        backgroundColor: "#ffffff",
        quality: 0.95,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      const name = sessionName
        ? sessionName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
        : "sprint-timeline";
      link.download = `${name}-gantt.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export image error:", err);
      alert("Error exporting image");
    } finally {
      setIsExportingImage(false);
    }
  };

  const holidayMap = new Map((holidays || []).map((h) => [h.date, h.name]));
  const { days } = computeGanttRange(tasks, holidays);
  const today = todayStr();

  // HTML5 Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData("taskId", taskId.toString());
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    e.dataTransfer.setData("offsetX", offsetX.toString());
    e.dataTransfer.effectAllowed = "move";
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newMemberId: number) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData("taskId");
    const offsetXStr = e.dataTransfer.getData("offsetX");
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr, 10);
    const offsetX = parseInt(offsetXStr, 10) || 0;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const rowEl = e.currentTarget as HTMLElement;
    const rect = rowEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left - offsetX;

    const dayIndex = Math.max(0, Math.floor(clickX / COL_WIDTH));
    let targetDay = days[dayIndex];
    if (targetDay && holidayMap.has(targetDay)) {
      targetDay = nextWorkday(targetDay, holidays);
    }

    if (targetDay) {
      if (task.memberId !== newMemberId) {
        onUpdateTask(taskId, "memberId", newMemberId);
      }
      if (task.startDate !== targetDay) {
        onUpdateTask(taskId, "startDate", targetDay);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (tooltip.show) setTooltip((prev) => ({ ...prev, show: false }));
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [tooltip.show]);

  const handlePointerEnter = (e: React.PointerEvent, text: string) => {
    setTooltip({ show: true, text, x: e.clientX + 12, y: e.clientY - 32 });
  };

  const handlePointerLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  const handleGlobalPointerMove = (e: PointerEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({ ...prev, x: e.clientX + 12, y: e.clientY - 32 }));
    }
  };

  useEffect(() => {
    if (tooltip.show) {
      window.addEventListener("pointermove", handleGlobalPointerMove);
    } else {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
    }
    return () =>
      window.removeEventListener("pointermove", handleGlobalPointerMove);
  }, [tooltip.show]);

  // Burndown calculations
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === "DONE").length;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const hasSpillover = tasks.some((t) => {
    const end = computeEndDate(t.startDate, t.effort, holidays);
    return sprintEndDate && end > sprintEndDate;
  });

  if (members.length === 0) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center p-10 min-h-[300px]">
        <div className="text-slate-400 italic text-sm flex flex-col items-center gap-3 bg-slate-50 p-8 rounded-2xl border border-slate-200/80">
          <div className="text-4xl">📊</div>
          {t("empty")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" ref={containerRef}>
      {/* Stitch Gantt Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {sprintStartDate && (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-medium">
              <Flag size={13} />
              <span>
                {t("startFlag")}: <strong>{sprintStartDate}</strong>
              </span>
            </div>
          )}
          {sprintEndDate && (
            <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200/80 px-2.5 py-1 rounded-lg font-medium">
              <Flag size={13} />
              <span>
                {t("endFlag")}: <strong>{sprintEndDate}</strong>
              </span>
            </div>
          )}
          <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-medium">Today: {today}</span>
          </div>
        </div>

        <button
          onClick={handleExportImage}
          disabled={isExportingImage}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95 ml-auto"
          title={t("exportPng")}
        >
          <Camera size={14} className="text-indigo-600" />
          <span>{isExportingImage ? t("exporting") : t("exportPng")}</span>
        </button>
      </div>

      {/* Timeline Visualizer */}
      <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar min-h-[380px]">
        <div className="min-w-max bg-white" ref={chartWrapperRef}>
          {/* Days Header */}
          <div className="flex sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-sm">
            <div className="w-[120px] min-w-[120px] sm:w-[170px] sm:min-w-[170px] bg-slate-900 text-slate-200 py-3 px-3 sm:px-4 text-[11px] font-bold uppercase tracking-wider border-r border-slate-800 sticky left-0 z-40 flex items-center">
              {t("memberCol")}
            </div>
            <div className="flex">
              {days.map((d) => {
                const parsed = parseDate(d);
                const dayNum = parsed.getDate();
                const isToday = d === today;
                const isMon = parsed.getDay() === 1;
                const isHolidayDate = holidayMap.has(d);
                const holidayName = holidayMap.get(d);
                const isSprintStart = d === sprintStartDate;
                const isSprintEnd = d === sprintEndDate;

                let headerBg = isMon
                  ? "text-white font-semibold bg-slate-800"
                  : "text-slate-400";
                if (isToday)
                  headerBg = "bg-indigo-600/30 text-indigo-300 font-bold";
                if (isHolidayDate)
                  headerBg = "bg-amber-500/25 text-amber-300 font-bold border-amber-500/30";
                if (isSprintStart)
                  headerBg = "bg-emerald-900/60 text-emerald-300 font-bold border-emerald-500/50";
                if (isSprintEnd)
                  headerBg = "bg-rose-900/60 text-rose-300 font-bold border-rose-500/50";

                return (
                  <div
                    key={d}
                    className={`w-[46px] min-w-[46px] text-center py-2 flex flex-col items-center justify-center text-[10px] border-r border-slate-800/60 select-none ${headerBg}`}
                    title={
                      isHolidayDate
                        ? `${d} - Lễ: ${holidayName}`
                        : isSprintStart
                        ? `${d} - Sprint Start`
                        : isSprintEnd
                        ? `${d} - Sprint End`
                        : d
                    }
                  >
                    {isSprintStart ? (
                      <div className="text-[8px] text-emerald-300 font-bold leading-none mb-0.5">
                        🚩START
                      </div>
                    ) : isSprintEnd ? (
                      <div className="text-[8px] text-rose-300 font-bold leading-none mb-0.5">
                        🏁END
                      </div>
                    ) : isHolidayDate ? (
                      <div className="text-[9px] text-amber-300 font-bold leading-none mb-0.5">
                        OFF
                      </div>
                    ) : isMon ? (
                      <div className="text-[8px] opacity-70 leading-none mb-0.5 font-mono">
                        {String(parsed.getMonth() + 1).padStart(2, "0")}/
                        {String(parsed.getFullYear()).slice(2)}
                      </div>
                    ) : null}
                    <div className="leading-none mt-auto font-mono font-bold">
                      {String(dayNum).padStart(2, "0")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Member Rows */}
          {members.map((member, mIdx) => {
            const memberTasks = tasks.filter((t) => t.memberId === mIdx);
            const { laneMap, numLanes } = assignLanes(memberTasks, holidays);
            const LANE_H = 34,
              LANE_GAP = 8,
              PAD = 12;
            const rowH =
              PAD + numLanes * LANE_H + (numLanes - 1) * LANE_GAP + PAD;

            return (
              <div
                key={mIdx}
                className="flex border-b border-slate-100 hover:bg-slate-50/60 transition-colors group"
              >
                {/* Sticky Member Col on Left */}
                <div
                  className="w-[120px] min-w-[120px] sm:w-[170px] sm:min-w-[170px] px-3 sm:px-4 flex items-center gap-2 font-semibold text-xs sm:text-sm border-r border-slate-200 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/90 transition-colors truncate"
                  style={{ height: rowH }}
                >
                  <div
                    className={`w-6 h-6 rounded-full ${
                      AVATAR_COLORS[mIdx % AVATAR_COLORS.length]
                    } text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {getInitials(member)}
                  </div>
                  <span className="truncate text-slate-800">{member}</span>
                </div>

                {/* Timeline Drag & Drop Zone */}
                <div
                  className="relative flex"
                  style={{ width: days.length * COL_WIDTH, height: rowH }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, mIdx)}
                >
                  {/* Background day grid cells */}
                  {days.map((d) => {
                    const isHol = holidayMap.has(d);
                    const isToday = d === today;
                    return (
                      <div
                        key={d}
                        className={`w-[46px] min-w-[46px] border-r border-slate-100 pointer-events-none ${
                          isHol
                            ? "bg-amber-50/60 border-r-amber-200/50"
                            : isToday
                            ? "bg-indigo-50/40"
                            : ""
                        }`}
                        style={{
                          height: rowH,
                          ...(isHol
                            ? {
                                backgroundImage:
                                  "repeating-linear-gradient(45deg, rgba(245,158,11,0.06) 0, rgba(245,158,11,0.06) 8px, transparent 8px, transparent 16px)",
                              }
                            : {}),
                        }}
                        title={
                          isHol ? `Lễ: ${holidayMap.get(d)}` : undefined
                        }
                      />
                    );
                  })}

                  {/* Sprint Start Boundary Line */}
                  {sprintStartDate && days.indexOf(sprintStartDate) >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 border-l-2 border-dashed border-emerald-500 pointer-events-none z-15"
                      style={{ left: days.indexOf(sprintStartDate) * COL_WIDTH }}
                      title={`Sprint Start: ${sprintStartDate}`}
                    />
                  )}

                  {/* Sprint End Boundary Line */}
                  {sprintEndDate && days.indexOf(sprintEndDate) >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500 pointer-events-none z-15"
                      style={{
                        left: (days.indexOf(sprintEndDate) + 1) * COL_WIDTH - 2,
                      }}
                      title={`Sprint End: ${sprintEndDate}`}
                    />
                  )}

                  {/* Today Vertical Line Indicator */}
                  {days.indexOf(today) >= 0 && (
                    <div
                      className="absolute top-0 bottom-0 border-l border-indigo-500/50 pointer-events-none z-15"
                      style={{ left: days.indexOf(today) * COL_WIDTH + COL_WIDTH / 2 }}
                    />
                  )}

                  {/* Task Bars */}
                  {memberTasks.map((t) => {
                    const colStart = days.indexOf(t.startDate);
                    if (colStart < 0) return null;
                    const endDate = computeEndDate(t.startDate, t.effort, holidays);
                    const colEnd = days.indexOf(endDate);
                    const spanCols =
                      colEnd > colStart ? colEnd - colStart : Math.max(1, t.effort);

                    const left = colStart * COL_WIDTH;
                    const width = Math.max(spanCols * COL_WIDTH, COL_WIDTH / 2);
                    const color = getTaskColor(t.us);
                    const lane = laneMap[t.id] || 0;
                    const top = PAD + lane * (LANE_H + LANE_GAP);
                    const isSpillover =
                      sprintEndDate && endDate > sprintEndDate;
                    const tooltipText = `${t.us} [${t.status || "TODO"}] | ${t.startDate} → ${endDate} (${t.effort}d làm việc)${
                      isSpillover ? ` ⚠️ [TRÀN SPRINT: Kết thúc sau mốc ${sprintEndDate}]` : ""
                    }`;

                    return (
                      <div
                        key={t.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onPointerEnter={(e) => handlePointerEnter(e, tooltipText)}
                        onPointerLeave={handlePointerLeave}
                        className={`absolute rounded-xl flex items-center justify-between px-2.5 text-[11px] text-white whitespace-nowrap overflow-hidden select-none transition-transform z-10 cursor-grab active:cursor-grabbing hover:scale-[1.01] shadow-sm hover:shadow-md ${
                          isSpillover
                            ? "border-2 border-rose-500 ring-2 ring-rose-500/20"
                            : "border border-white/20"
                        }`}
                        style={{
                          left,
                          top,
                          width: width - 4,
                          height: LANE_H,
                          backgroundColor: color,
                          backgroundImage:
                            "linear-gradient(to bottom, rgba(255,255,255,0.18), rgba(255,255,255,0))",
                        }}
                      >
                        <div className="flex items-center gap-1.5 min-w-0 pr-1 pointer-events-none">
                          {isSpillover && (
                            <span className="text-[11px]" title="Tràn Sprint!">
                              ⚠️
                            </span>
                          )}
                          <span className="font-bold truncate text-[11px] drop-shadow-xs">
                            {t.us}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 pointer-events-none">
                          <span className="text-[10px] font-mono opacity-90 font-semibold">
                            {t.effort}d
                          </span>
                          <div className="w-5 h-5 rounded-full bg-black/20 text-white flex items-center justify-center text-[8px] font-bold">
                            {getInitials(member)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt Footer: Sprint Velocity & Burndown Status */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>
            Total: <strong>{totalTasksCount} tasks</strong>
          </span>
          <span>•</span>
          <span>
            Progress: <strong>{completedTasksCount}/{totalTasksCount} done</strong> ({inProgressCount} in dev)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-indigo-600" />
          <span>
            Sprint Status:{" "}
            <strong
              className={
                hasSpillover
                  ? "text-rose-600"
                  : completedTasksCount === totalTasksCount && totalTasksCount > 0
                  ? "text-emerald-600"
                  : "text-indigo-600"
              }
            >
              {hasSpillover
                ? "⚠️ Schedule Risk (Tasks spill over)"
                : completedTasksCount === totalTasksCount && totalTasksCount > 0
                ? "✓ Complete"
                : "On Schedule"}
            </strong>
          </span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded-lg shadow-xl pointer-events-none z-[9999] whitespace-nowrap border border-slate-700 backdrop-blur-sm"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
