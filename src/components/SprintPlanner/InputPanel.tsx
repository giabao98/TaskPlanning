"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  X,
  UserPlus,
  CalendarDays,
  UserCheck,
  AlignLeft,
  Clock,
  Users,
  Palmtree,
  Check,
  Flag,
  Calendar,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { isWeekend } from "@/utils/dateUtils";
import { Task } from "@/types";

interface InputPanelProps {
  members: string[];
  tasks?: Task[];
  sprintCapacity?: number;
  memberCapacities?: Record<string, number>;
  sprintStartDate?: string;
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
  onAddMember,
  onRemoveMember,
  onAddTask,
  onOpenHolidayModal,
  onOpenMemberModal,
  holidaysCount = 0,
}: InputPanelProps) {
  const t = useTranslations("DataEntry");
  const [newMember, setNewMember] = useState("");
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
    memberId: "",
    effort: 2,
    startDate: sprintStartDate || getNextWorkday(),
  });

  const handleAddMember = () => {
    const trimmed = newMember.trim();
    if (!trimmed) return;
    if (members.includes(trimmed)) {
      alert(t("memberExists"));
      return;
    }
    onAddMember(trimmed);
    setNewMember("");
  };

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

    // Provide tactile visual feedback
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 700);

    // Keep memberId and startDate for rapid sequential input, clear US title
    setNewTask((prev) => ({ ...prev, us: "" }));

    // Re-focus US input so user can quickly type next task
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

  // Helper to get workload status for a member
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

  return (
    <div className="bg-white border-b border-slate-200/80 p-4 sm:p-5 flex flex-col gap-4 shadow-xs relative z-20">
      {/* TIER 1: Team & Sprint Calendar Hub (Sub-toolbar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
        {/* Left: Team and Holiday management shortcuts & member chips */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {onOpenMemberModal && (
            <button
              onClick={onOpenMemberModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200/60 transition-all cursor-pointer shadow-xs active:scale-[0.98] shrink-0"
              title={t("manageMembers", { count: members.length })}
            >
              <Users size={14} className="text-indigo-600" />
              <span>{t("manageMembers", { count: members.length })}</span>
            </button>
          )}

          {onOpenHolidayModal && (
            <button
              onClick={onOpenHolidayModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200/60 transition-all cursor-pointer shadow-xs active:scale-[0.98] shrink-0"
              title={t("holidays", { count: holidaysCount })}
            >
              <Palmtree size={14} className="text-amber-600" />
              <span>{t("holidays", { count: holidaysCount })}</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0 mx-1" />

          {/* Member chips single-line horizontal scroll block */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 flex-1 min-w-0 [scrollbar-width:thin] scroll-smooth">
            {members.length === 0 ? (
              <span className="text-slate-400 italic text-[11px] py-1 shrink-0">
                {t("noMembersYet")}
              </span>
            ) : (
              members.map((m, i) => {
                const workload = getMemberWorkload(i, m);
                return (
                  <span
                    key={i}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full text-xs font-medium border transition-colors shadow-2xs whitespace-nowrap",
                      workload.isOverloaded
                        ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80"
                    )}
                    title={`${m} • ${workload.assigned}/${workload.capacity}d ${t("allocated")}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <span>{m}</span>
                    <button
                      onClick={() => onRemoveMember(m)}
                      className="text-slate-400 hover:text-rose-600 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Xóa thành viên"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Inline Quick Add Member */}
        <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[170px]">
            <UserPlus
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
              placeholder={t("memberPlaceholder")}
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
            />
          </div>
          <button
            onClick={handleAddMember}
            className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors shadow-2xs cursor-pointer flex items-center gap-1 shrink-0 active:scale-[0.98]"
          >
            <Plus size={13} />
            <span>{t("addMemberShort")}</span>
          </button>
        </div>
      </div>

      {/* TIER 2: Fast Task Creation Command Center */}
      <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3 sm:p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-end gap-3.5">
        {/* Field 1: User Story (Primary) */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[260px]">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlignLeft size={13} className="text-indigo-600" />
            <span>{t("usLabel")}</span>
          </label>
          <input
            ref={usInputRef}
            type="text"
            className="border border-slate-200 rounded-lg px-3.5 py-2 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all placeholder:text-slate-400 shadow-2xs w-full"
            placeholder={t("usPlaceholder")}
            value={newTask.us}
            onChange={(e) => setNewTask({ ...newTask, us: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Field 2: Assignee (PIC) with smart workload preview */}
        <div className="flex flex-col gap-1.5 w-full sm:w-[220px] lg:w-[200px] shrink-0">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck size={13} className="text-indigo-600" />
            <span>{t("selectMember")}</span>
          </label>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs cursor-pointer w-full text-slate-700"
            value={newTask.memberId}
            onChange={(e) => setNewTask({ ...newTask, memberId: e.target.value })}
            onKeyDown={handleKeyDown}
          >
            {members.length === 0 ? (
              <option value="">-- {t("selectMember")} --</option>
            ) : (
              <>
                <option value="" disabled>
                  -- {t("selectMember")} --
                </option>
                {members.map((m, i) => {
                  const workload = getMemberWorkload(i, m);
                  return (
                    <option key={i} value={i}>
                      {m} • {workload.assigned}/{workload.capacity}d{" "}
                      {workload.isOverloaded ? `⚠️ ${t("overloaded")}` : ""}
                    </option>
                  );
                })}
              </>
            )}
          </select>
        </div>

        {/* Field 3: Effort with Quick Presets */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto shrink-0">
          <div className="flex items-center justify-between gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-indigo-600" />
              <span>{t("effortLabel")}</span>
            </label>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              className="border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs w-[76px] text-center text-slate-800"
              min="0.5"
              step="0.5"
              value={newTask.effort}
              onChange={(e) =>
                setNewTask({ ...newTask, effort: Number(e.target.value) })
              }
              onKeyDown={handleKeyDown}
            />
            {/* Agile quick-effort pills */}
            <div className="flex items-center gap-1">
              {EFFORT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewTask((p) => ({ ...p, effort: preset }))}
                  className={cn(
                    "px-2 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer active:scale-95",
                    newTask.effort === preset
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  )}
                  title={`${preset} ngày`}
                >
                  {preset}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Field 4: Start Date & Quick Shortcuts */}
        <div className="flex flex-col gap-1.5 w-full sm:w-auto shrink-0">
          <div className="flex items-center justify-between gap-1">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays size={13} className="text-indigo-600" />
              <span>{t("startDateLabel")}</span>
            </label>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              className="border border-slate-200 rounded-lg px-2.5 py-2 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs w-[140px] text-slate-700"
              value={newTask.startDate}
              onChange={(e) =>
                setNewTask({ ...newTask, startDate: e.target.value })
              }
              onKeyDown={handleKeyDown}
            />
            {/* Quick date shortcuts */}
            <div className="flex items-center gap-1">
              {sprintStartDate && (
                <button
                  type="button"
                  onClick={() =>
                    setNewTask((p) => ({ ...p, startDate: sprintStartDate }))
                  }
                  className="px-2 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                  title="Gán theo ngày bắt đầu Sprint"
                >
                  <Flag size={11} className="text-emerald-500" />
                  <span>{t("sprintStart")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  setNewTask((p) => ({ ...p, startDate: getNextWorkday() }))
                }
                className="px-2 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Gán ngày hôm nay (hoặc ngày làm việc gần nhất)"
              >
                <Calendar size={11} className="text-indigo-500" />
                <span>{t("today")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Field 5: Submit Button & Shortcut Hint */}
        <div className="flex flex-col items-center justify-end shrink-0 pt-2 lg:pt-0">
          <button
            onClick={handleAddTask}
            className={cn(
              "w-full lg:w-auto h-[38px] px-5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]",
              isJustAdded
                ? "bg-emerald-600 text-white shadow-emerald-200"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-300"
            )}
            title={t("pressEnterHint")}
          >
            {isJustAdded ? (
              <>
                <Check size={16} className="text-white animate-in zoom-in" />
                <span>{t("taskAddedSuccess")}</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>{t("addTask")}</span>
              </>
            )}
          </button>
          <span className="text-[10px] font-medium text-slate-400 mt-1 hidden lg:block">
            {t("pressEnterHint")}
          </span>
        </div>
      </div>
    </div>
  );
}
