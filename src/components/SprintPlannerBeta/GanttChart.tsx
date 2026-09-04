"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Camera, Flag, AlertTriangle } from "lucide-react";
import { type Task, type Holiday } from "@/types";
import {
  todayStr,
  computeEndDate,
  workdayRange,
  addWorkingDays,
  prevWorkday,
  nextWorkday,
  parseDate,
  workdaysBetween,
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

const COL_WIDTH = 44; // pixels per day

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
    .map((t) => ({ ...t, _end: computeEndDate(t.startDate, t.effort, holidays) }))
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
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({
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
      const name = sessionName ? sessionName.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "sprint-timeline";
      link.download = `${name}-gantt.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export image error:", err);
      alert("Không thể chụp ảnh Gantt timeline.");
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
    
    // Provide a neat drag image if possible, or leave it native
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
    
    const taskId = parseInt(taskIdStr);
    const clickOffsetX = parseFloat(offsetXStr) || 0;
    
    // Calculate new start date based on drop X
    const rowRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dropX = e.clientX - rowRect.left;
    const adjustedX = dropX - clickOffsetX;
    
    const dayIdx = Math.round(adjustedX / COL_WIDTH);
    const clampedIdx = Math.max(0, Math.min(dayIdx, days.length - 1));
    let newStartDate = days[clampedIdx];

    // If dropped on holiday, advance to next workday
    if (newStartDate && holidayMap.has(newStartDate)) {
      newStartDate = nextWorkday(newStartDate, holidays);
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      if (task.memberId !== newMemberId) {
        onUpdateTask(taskId, "memberId", newMemberId);
      }
      if (task.startDate !== newStartDate && newStartDate) {
        onUpdateTask(taskId, "startDate", newStartDate);
      }
    }
  };

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
    return () => window.removeEventListener("pointermove", handleGlobalPointerMove);
  }, [tooltip.show]);

  if (members.length === 0) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-10 custom-scrollbar overflow-auto">
        <div className="text-slate-400 italic text-sm flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-4xl">📊</div>
          Add members to see the Gantt chart.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden" ref={containerRef}>
      {/* Gantt Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-3">
          {sprintStartDate && (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded font-medium">
              <Flag size={12} /> Start: {sprintStartDate}
            </div>
          )}
          {sprintEndDate && (
            <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded font-medium">
              <Flag size={12} /> End: {sprintEndDate}
            </div>
          )}
        </div>
        <button
          onClick={handleExportImage}
          disabled={isExportingImage}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 border border-slate-200 px-2.5 py-1 rounded-md shadow-xs transition-all cursor-pointer"
          title="Chụp ảnh toàn bộ timeline thành file PNG"
        >
          <Camera size={13} className="text-indigo-500" />
          {isExportingImage ? "Đang chụp..." : "Xuất ảnh PNG"}
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar min-h-[400px] sm:min-h-0">
        <div className="min-w-max bg-white" ref={chartWrapperRef}>
          {/* Header */}
          <div className="flex sticky top-0 z-30 bg-slate-900 border-b border-slate-700 shadow-sm">
            <div className="w-[100px] min-w-[100px] sm:w-[160px] sm:min-w-[160px] bg-slate-900 text-slate-200 py-3 px-2 sm:px-4 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider border-r border-slate-700 sticky left-0 z-40">
              Member
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

                let headerBg = isMon ? "text-white font-semibold bg-slate-800" : "text-slate-400";
                if (isToday) headerBg = "bg-indigo-600/20 text-indigo-300 font-bold";
                if (isHolidayDate) headerBg = "bg-amber-500/25 text-amber-300 font-bold border-amber-500/30";
                if (isSprintStart) headerBg = "bg-emerald-900/60 text-emerald-300 font-bold border-emerald-500/50";
                if (isSprintEnd) headerBg = "bg-rose-900/60 text-rose-300 font-bold border-rose-500/50";

                return (
                  <div
                    key={d}
                    className={`w-[44px] min-w-[44px] text-center py-1.5 flex flex-col items-center justify-center text-[10px] border-r border-slate-800/50 select-none ${headerBg}`}
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
                      <div className="text-[8px] text-emerald-300 font-bold leading-none mb-0.5">🚩START</div>
                    ) : isSprintEnd ? (
                      <div className="text-[8px] text-rose-300 font-bold leading-none mb-0.5">🏁END</div>
                    ) : isHolidayDate ? (
                      <div className="text-[9px] leading-none mb-0.5">🎉</div>
                    ) : isMon ? (
                      <div className="text-[9px] opacity-70 leading-none mb-0.5">
                        {String(parsed.getMonth() + 1).padStart(2, "0")}/{String(parsed.getFullYear()).slice(2)}
                      </div>
                    ) : null}
                    <div className="leading-none mt-auto font-mono">{String(dayNum).padStart(2, "0")}</div>
                    {isHolidayDate && !isSprintStart && !isSprintEnd && (
                      <span className="text-[8px] opacity-80 uppercase tracking-tighter">Lễ</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        {/* Rows */}
        {members.map((member, mIdx) => {
          const memberTasks = tasks.filter((t) => t.memberId === mIdx);
          const { laneMap, numLanes } = assignLanes(memberTasks, holidays);
          const LANE_H = 34, LANE_GAP = 8, PAD = 12;
          const rowH = PAD + numLanes * LANE_H + (numLanes - 1) * LANE_GAP + PAD;

          return (
            <div 
              key={mIdx} 
              className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
            >
              <div
                className="w-[100px] min-w-[100px] sm:w-[160px] sm:min-w-[160px] px-2 sm:px-4 flex items-center font-semibold text-xs sm:text-sm border-r border-slate-200 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/80 transition-colors truncate"
                style={{ height: rowH }}
              >
                {member}
              </div>
              
              {/* Drop Zone (The Timeline for this Member) */}
              <div
                className="relative flex"
                style={{ width: days.length * COL_WIDTH, height: rowH }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, mIdx)}
              >
                {/* Background cells */}
                {days.map((d) => {
                  const isHol = holidayMap.has(d);
                  return (
                    <div
                      key={d}
                      className={`w-[44px] min-w-[44px] border-r border-slate-100/60 pointer-events-none ${
                        isHol
                          ? "bg-amber-100/35 border-r-amber-200/60"
                          : d === today
                          ? "bg-indigo-50/50"
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
                      title={isHol ? `Ngày nghỉ lễ: ${holidayMap.get(d)}` : undefined}
                    />
                  );
                })}

                {/* Sprint Boundary Lines */}
                {sprintStartDate && days.indexOf(sprintStartDate) >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-emerald-500 pointer-events-none z-15"
                    style={{ left: days.indexOf(sprintStartDate) * COL_WIDTH }}
                    title={`Sprint Start: ${sprintStartDate}`}
                  />
                )}
                {sprintEndDate && days.indexOf(sprintEndDate) >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500 pointer-events-none z-15"
                    style={{ left: (days.indexOf(sprintEndDate) + 1) * COL_WIDTH - 2 }}
                    title={`Sprint End: ${sprintEndDate}`}
                  />
                )}

                {/* Bars */}
                {memberTasks.map((t) => {
                  const colStart = days.indexOf(t.startDate);
                  if (colStart < 0) return null;
                  const endDate = computeEndDate(t.startDate, t.effort, holidays);
                  const colEnd = days.indexOf(endDate);
                  const spanCols = colEnd > colStart ? colEnd - colStart : Math.max(1, t.effort);
                  
                  const left = colStart * COL_WIDTH;
                  const width = Math.max(spanCols * COL_WIDTH, COL_WIDTH / 2);
                  const color = getTaskColor(t.us);
                  const lane = laneMap[t.id] || 0;
                  const top = PAD + lane * (LANE_H + LANE_GAP);
                  const isSpillover = sprintEndDate && endDate > sprintEndDate;
                  const tooltipText = `${t.us} [${t.status || 'TODO'}] | ${t.startDate} → ${endDate} (${t.effort}d làm việc)${
                    isSpillover ? ` ⚠️ [TRÀN SPRINT: Kết thúc sau mốc ${sprintEndDate}]` : ""
                  }`;

                  return (
                    <div
                      key={t.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      onPointerEnter={(e) => handlePointerEnter(e, tooltipText)}
                      onPointerLeave={handlePointerLeave}
                      className={`absolute rounded-md flex items-center px-2.5 text-[11px] text-white whitespace-nowrap overflow-hidden select-none transition-transform z-10 cursor-grab active:cursor-grabbing hover:brightness-110 shadow-sm hover:shadow-md ${
                        isSpillover ? "border-2 border-rose-500 ring-2 ring-rose-500/20" : "border border-black/10"
                      }`}
                      style={{
                        left,
                        top,
                        width: width - 4,
                        height: LANE_H,
                        backgroundColor: color,
                        backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))",
                      }}
                    >
                      <span className="font-semibold truncate pointer-events-none drop-shadow-sm flex items-center gap-1">
                        {isSpillover && <span title="Tràn Sprint!">⚠️</span>}
                        {t.us}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.show && (
        <div
          className="fixed bg-slate-900 text-white text-[11px] font-medium py-1.5 px-3 rounded shadow-lg pointer-events-none z-[9999] whitespace-nowrap border border-slate-700 backdrop-blur-sm bg-opacity-90"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
