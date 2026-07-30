"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { type Task } from "@/types";
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
}

const COL_WIDTH = 44; // pixels per day

function computeGanttRange(tasks: Task[]) {
  if (tasks.length === 0) {
    const t = todayStr();
    return { days: workdayRange(t, addWorkingDays(t, 14)) };
  }
  let minDate = tasks[0].startDate;
  let maxDate = computeEndDate(tasks[0].startDate, tasks[0].effort);
  tasks.forEach((t) => {
    if (t.startDate < minDate) minDate = t.startDate;
    const end = computeEndDate(t.startDate, t.effort);
    if (end > maxDate) maxDate = end;
  });
  let from = minDate,
    to = maxDate;
  for (let i = 0; i < 3; i++) {
    from = prevWorkday(from);
    to = nextWorkday(to);
  }
  return { days: workdayRange(from, to), from, to };
}

function assignLanes(tasks: Task[]) {
  const sorted = tasks
    .map((t) => ({ ...t, _end: computeEndDate(t.startDate, t.effort) }))
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

export default function GanttChart({ tasks, members, onUpdateTask }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number }>({
    show: false,
    text: "",
    x: 0,
    y: 0,
  });

  const { days } = computeGanttRange(tasks);
  const today = todayStr();

  // Dragging state
  const [dragState, setDragState] = useState<{
    taskId: number | null;
    startX: number;
    origLeft: number;
    currentLeft: number;
  }>({
    taskId: null,
    startX: 0,
    origLeft: 0,
    currentLeft: 0,
  });

  const handlePointerDown = (e: React.PointerEvent, taskId: number, origLeft: number) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragState({
      taskId,
      startX: e.clientX,
      origLeft,
      currentLeft: origLeft,
    });
    setTooltip((prev) => ({ ...prev, show: false })); // Hide tooltip on drag
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragState.taskId === null) return;
    const dx = e.clientX - dragState.startX;
    const newLeft = Math.max(0, dragState.origLeft + dx);
    const maxLeft = (days.length - 1) * COL_WIDTH;
    setDragState((prev) => ({
      ...prev,
      currentLeft: Math.min(newLeft, maxLeft),
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragState.taskId === null) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    
    // Snap to column
    const dayIdx = Math.round(dragState.currentLeft / COL_WIDTH);
    const clampedIdx = Math.max(0, Math.min(dayIdx, days.length - 1));
    const newStartDate = days[clampedIdx];

    if (newStartDate) {
      const task = tasks.find((t) => t.id === dragState.taskId);
      if (task && task.startDate !== newStartDate) {
        onUpdateTask(dragState.taskId, "startDate", newStartDate);
      }
    }

    setDragState({ taskId: null, startX: 0, origLeft: 0, currentLeft: 0 });
  };

  const handlePointerEnter = (e: React.PointerEvent, text: string) => {
    if (dragState.taskId !== null) return;
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
    <div className="flex-1 overflow-auto bg-slate-50 relative custom-scrollbar min-h-[400px] sm:min-h-0" ref={containerRef}>
      <div className="min-w-max bg-white">
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
              return (
                <div
                  key={d}
                  className={`w-[44px] min-w-[44px] text-center py-2 flex flex-col items-center justify-center text-[10px] border-r border-slate-800/50 select-none ${
                    isMon ? "text-white font-semibold bg-slate-800" : "text-slate-400"
                  } ${isToday ? "bg-indigo-600/20 text-indigo-300 font-bold" : ""}`}
                  title={d}
                >
                  {isMon && (
                    <div className="text-[9px] opacity-70 leading-none mb-0.5">
                      {String(parsed.getMonth() + 1).padStart(2, "0")}/{String(parsed.getFullYear()).slice(2)}
                    </div>
                  )}
                  <div className="leading-none mt-auto">{String(dayNum).padStart(2, "0")}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rows */}
        {members.map((member, mIdx) => {
          const memberTasks = tasks.filter((t) => t.memberId === mIdx);
          const { laneMap, numLanes } = assignLanes(memberTasks);
          const LANE_H = 34,
            LANE_GAP = 8,
            PAD = 12;
          const rowH = PAD + numLanes * LANE_H + (numLanes - 1) * LANE_GAP + PAD;

          return (
            <div key={mIdx} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
              <div
                className="w-[100px] min-w-[100px] sm:w-[160px] sm:min-w-[160px] px-2 sm:px-4 flex items-center font-semibold text-xs sm:text-sm border-r border-slate-200 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/80 transition-colors truncate"
                style={{ height: rowH }}
              >
                {member}
              </div>
              <div
                className="relative flex"
                style={{ width: days.length * COL_WIDTH, height: rowH }}
              >
                {/* Background cells */}
                {days.map((d, i) => {
                  const isToday = d === today;
                  return (
                    <div
                      key={d}
                      className={`w-[44px] min-w-[44px] border-r border-slate-100/60 ${
                        isToday ? "bg-indigo-50/50" : ""
                      }`}
                      style={{ height: rowH }}
                    ></div>
                  );
                })}

                {/* Bars */}
                {memberTasks.map((t) => {
                  const colStart = days.indexOf(t.startDate);
                  if (colStart < 0) return null;
                  const endDate = computeEndDate(t.startDate, t.effort);
                  const barDays = workdaysBetween(t.startDate, endDate) || t.effort;
                  
                  const isDragging = dragState.taskId === t.id;
                  const left = isDragging ? dragState.currentLeft : colStart * COL_WIDTH;
                  const width = Math.max(barDays * COL_WIDTH, COL_WIDTH / 2);
                  const color = getTaskColor(t.us);
                  const lane = laneMap[t.id] || 0;
                  const top = PAD + lane * (LANE_H + LANE_GAP);
                  const tooltipText = `${t.us} | ${t.startDate} → ${endDate} (${t.effort}d)`;

                  return (
                    <div
                      key={t.id}
                      className={`absolute rounded-md flex items-center px-2.5 text-[11px] text-white whitespace-nowrap overflow-hidden select-none transition-[filter,box-shadow,opacity] will-change-transform z-10 ${
                        isDragging ? "cursor-grabbing opacity-90 shadow-lg z-50 ring-2 ring-white/50" : "cursor-grab shadow-sm hover:brightness-110"
                      }`}
                      style={{
                        left,
                        top,
                        width: width - 4, // 4px gap for padding between consecutive bars
                        height: LANE_H,
                        backgroundColor: color,
                        backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0))",
                      }}
                      onPointerDown={(e) => handlePointerDown(e, t.id, colStart * COL_WIDTH)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerEnter={(e) => handlePointerEnter(e, tooltipText)}
                      onPointerLeave={handlePointerLeave}
                    >
                      <span className="font-semibold truncate pointer-events-none drop-shadow-sm">{t.us}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
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
