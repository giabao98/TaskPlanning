"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  CalendarDays,
  UserCheck,
  AlignLeft,
  Clock,
  Check,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { isWeekend, addWorkingDays } from "@/utils/dateUtils";
import { Task } from "@/types";

interface InputPanelProps {
  members: string[];
  tasks?: Task[];
  sprintCapacity?: number;
  memberCapacities?: Record<string, number>;
  sprintStartDate?: string;
  sprintEndDate?: string;
  onAddMember: (name: string) => void;
  onRemoveMember: (name: string) => void;
  onAddTask: (task: {
    us: string;
    memberId: number;
    effort: number;
    startDate: string;
  }) => void;
  onOpenHolidayModal?: () => void;
  onOpenMemberModal?: () => void;
  holidaysCount?: number;
}

const EFFORT_PRESETS = [0.5, 1, 2, 3, 5];

export default function InputPanel({
  members,
  tasks = [],
  sprintCapacity = 10,
  memberCapacities = {},
  sprintStartDate,
  sprintEndDate,
  onAddTask,
}: InputPanelProps) {
  const t = useTranslations("DataEntry");
  const [isJustAdded, setIsJustAdded] = useState(false);
  const usInputRef = useRef<HTMLInputElement>(null);

  // Initialize start date to today (or next workday if weekend)
  const getNextWorkday = () => {
    const d = new Date();
    while (isWeekend(d)) d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [newTask, setNewTask] = useState({
    us: "",
    memberId: members.length > 0 ? "0" : "",
    effort: 2,
    startDate: sprintStartDate || getNextWorkday(),
  });

  const handleAddTask = () => {
    if (members.length === 0) {
      alert(t("alertAddMemberFirst"));
      return;
    }
    if (!newTask.us.trim()) {
      alert(t("alertEnterUs"));
      usInputRef.current?.focus();
      return;
    }
    if (newTask.memberId === "") {
      alert(t("alertSelectMember"));
      return;
    }
    if (!newTask.startDate) {
      alert(t("alertSelectDate"));
      return;
    }

    onAddTask({
      us: newTask.us.trim(),
      memberId: parseInt(newTask.memberId, 10),
      effort: Number(newTask.effort) || 1,
      startDate: newTask.startDate,
    });

    // Visual feedback
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 700);

    // Clear US title, keep member and date for rapid bulk entry
    setNewTask((prev) => ({ ...prev, us: "" }));

    setTimeout(() => {
      usInputRef.current?.focus();
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  // Workload calculator for member options
  const getMemberWorkload = (memberIndex: number, memberName: string) => {
    const assignedEffort = tasks
      .filter((t) => t.memberId === memberIndex)
      .reduce((sum, t) => sum + (t.effort || 0), 0);
    const capacity = memberCapacities[memberName] ?? sprintCapacity;
    const isOverloaded = assignedEffort > capacity;
    return {
      assigned: assignedEffort,
      capacity,
      isOverloaded,
    };
  };

  const handleAdjustDate = (offsetDays: number) => {
    const current = newTask.startDate || getNextWorkday();
    const next = addWorkingDays(current, offsetDays);
    setNewTask((p) => ({ ...p, startDate: next }));
  };

  return (
    <div className="p-4 sm:p-5 space-y-3.5 bg-white">
      {/* 4-Field Stitch Fast Creation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
        {/* Field 1: User Story / Task Spec */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label
            htmlFor="task-story-input"
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider"
          >
            <AlignLeft size={14} className="text-indigo-600" />
            <span>{t("usLabel")}</span>
          </label>
          <div className="relative">
            <input
              id="task-story-input"
              ref={usInputRef}
              type="text"
              value={newTask.us}
              onChange={(e) => setNewTask({ ...newTask, us: e.target.value })}
              onKeyDown={handleKeyDown}
              placeholder={t("usPlaceholder")}
              className="w-full bg-slate-50 text-slate-900 font-medium text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-2xs transition-all pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-mono font-bold tracking-wider uppercase pointer-events-none">
              TASK
            </span>
          </div>
        </div>

        {/* Field 2: Assignee Selector (PIC) */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <label
            htmlFor="task-assignee-select"
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider"
          >
            <UserCheck size={14} className="text-indigo-600" />
            <span>{t("selectMember")}</span>
          </label>
          <div className="relative">
            <select
              id="task-assignee-select"
              value={newTask.memberId}
              onChange={(e) => setNewTask({ ...newTask, memberId: e.target.value })}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50 text-slate-900 font-medium text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 appearance-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow-2xs transition-all cursor-pointer pr-9"
            >
              {members.length === 0 ? (
                <option value="">-- {t("selectMember")} --</option>
              ) : (
                members.map((m, i) => {
                  const workload = getMemberWorkload(i, m);
                  return (
                    <option key={i} value={i}>
                      {m} • {workload.assigned}/{workload.capacity}d{" "}
                      {workload.isOverloaded ? `⚠️ (${t("overloaded")})` : ""}
                    </option>
                  );
                })
              )}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        {/* Field 3: Effort (Days) with Quick Pills */}
        <div className="md:col-span-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <Clock size={14} className="text-indigo-600" />
              <span>{t("effortLabel")}</span>
            </label>
            <span className="font-mono text-xs text-indigo-600 font-bold">
              {newTask.effort}d Selected
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
            <input
              type="number"
              min="0.5"
              step="0.5"
              max="20"
              value={newTask.effort}
              onChange={(e) =>
                setNewTask({ ...newTask, effort: Number(e.target.value) })
              }
              onKeyDown={handleKeyDown}
              className="w-14 bg-white text-slate-900 font-mono text-sm font-bold px-2 py-1.5 text-center rounded-lg shadow-2xs border border-slate-200/60 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex items-center gap-1 flex-1 overflow-x-auto justify-end">
              {EFFORT_PRESETS.map((preset) => {
                const isActive = newTask.effort === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewTask((p) => ({ ...p, effort: preset }))}
                    className={cn(
                      "px-2 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer",
                      isActive
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-200/70"
                    )}
                  >
                    {preset}d
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Field 4: Add Task Primary Button */}
        <div className="md:col-span-2 flex flex-col justify-end">
          <button
            type="button"
            onClick={handleAddTask}
            className={cn(
              "w-full group relative overflow-hidden text-white py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer",
              isJustAdded
                ? "bg-emerald-600 shadow-emerald-200"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            )}
            title={t("pressEnterHint")}
          >
            {isJustAdded ? (
              <>
                <Check size={16} className="text-white animate-in zoom-in" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{t("addTask")}</span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded bg-white/20 text-white font-mono text-[10px] leading-none">
                  ↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Date Presets Sub-Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 bg-slate-50/70 border border-slate-200/70 rounded-xl px-3.5 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <CalendarDays size={14} className="text-indigo-600" />
            <span className="uppercase text-[10px] font-bold tracking-wider text-slate-500">
              {t("startDateLabel")}:
            </span>
            <input
              type="date"
              value={newTask.startDate}
              onChange={(e) =>
                setNewTask({ ...newTask, startDate: e.target.value })
              }
              onKeyDown={handleKeyDown}
              className="bg-white text-slate-800 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs focus:outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1">
            {sprintStartDate && (
              <button
                type="button"
                onClick={() =>
                  setNewTask((p) => ({ ...p, startDate: sprintStartDate }))
                }
                className="px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                {t("sprintStart")}
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                setNewTask((p) => ({ ...p, startDate: getNextWorkday() }))
              }
              className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60 font-medium text-xs transition-colors cursor-pointer"
            >
              {t("today")}
            </button>
            <button
              type="button"
              onClick={() => handleAdjustDate(1)}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              +1 Day
            </button>
          </div>
        </div>

        {/* Sprint Working Window indicator */}
        {sprintStartDate && sprintEndDate && (
          <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>
              Sprint Window:{" "}
              <strong className="text-slate-700 font-mono">
                {sprintStartDate} → {sprintEndDate}
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
