"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, X, UserPlus, CalendarDays, User, AlignLeft, Clock, Users } from "lucide-react";
import { cn } from "@/utils/cn";
import { todayStr, isWeekend } from "@/utils/dateUtils";

interface InputPanelProps {
  members: string[];
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

export default function InputPanel({
  members,
  onAddMember,
  onRemoveMember,
  onAddTask,
  onOpenHolidayModal,
  onOpenMemberModal,
  holidaysCount = 0,
}: InputPanelProps) {
  const t = useTranslations("DataEntry");
  const [newMember, setNewMember] = useState("");
  
  // Initialize start date to today (or next workday if weekend)
  const initDate = () => {
    const d = new Date();
    while (isWeekend(d)) d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [newTask, setNewTask] = useState({
    us: "",
    memberId: "",
    effort: 3,
    startDate: initDate(),
  });

  const handleAddMember = () => {
    if (!newMember.trim()) return;
    onAddMember(newMember.trim());
    setNewMember("");
  };

  const handleAddTask = () => {
    if (members.length === 0) {
      alert(t("alertAddMemberFirst"));
      return;
    }
    if (!newTask.us.trim()) {
      alert(t("alertEnterUs"));
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
      memberId: parseInt(newTask.memberId),
      effort: Number(newTask.effort),
      startDate: newTask.startDate,
    });

    setNewTask((prev) => ({ ...prev, us: "" }));
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 sm:p-5 flex flex-wrap gap-4 sm:gap-6 items-end shadow-sm relative z-20">
      {/* Add Member */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <UserPlus size={14} className="text-indigo-500" /> {t("memberLabel")}
        </label>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white w-full sm:w-[160px]"
            placeholder={t("memberPlaceholder")}
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
          />
          <button
            onClick={handleAddMember}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors shadow-sm shadow-indigo-200 flex items-center gap-1 whitespace-nowrap cursor-pointer"
          >
            <Plus size={16} /> {t("addMember")}
          </button>
        </div>
      </div>

      <div className="w-px h-12 bg-slate-200 self-center hidden lg:block"></div>

      {/* Add Task */}
      <div className="flex flex-col gap-1.5 w-full sm:w-auto">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <AlignLeft size={14} className="text-indigo-500" /> {t("usLabel")}
        </label>
        <input
          type="text"
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white w-full sm:w-[220px]"
          placeholder={t("usPlaceholder")}
          value={newTask.us}
          onChange={(e) => setNewTask({ ...newTask, us: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5 w-full sm:w-auto flex-1 sm:flex-none min-w-[120px]">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <User size={14} className="text-indigo-500" /> {t("selectMember")}
        </label>
        <select
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white w-full sm:w-[140px]"
          value={newTask.memberId}
          onChange={(e) => setNewTask({ ...newTask, memberId: e.target.value })}
        >
          {members.length === 0 ? (
            <option value="">-- {t("selectMember")} --</option>
          ) : (
            <>
              <option value="" disabled>{t("selectMember")}</option>
              {members.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 w-1/2 sm:w-auto flex-1 sm:flex-none">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={14} className="text-indigo-500" /> {t("effortLabel")}
        </label>
        <input
          type="number"
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white w-full sm:w-[90px]"
          min="0.5"
          step="0.5"
          value={newTask.effort}
          onChange={(e) => setNewTask({ ...newTask, effort: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-col gap-1.5 w-1/2 sm:w-auto flex-1 sm:flex-none">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarDays size={14} className="text-indigo-500" /> {t("startDateLabel")}
        </label>
        <input
          type="date"
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white w-full sm:w-[140px]"
          value={newTask.startDate}
          onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
        />
      </div>

      <button
        onClick={handleAddTask}
        className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-4 py-1.5 text-sm font-medium transition-colors shadow-sm shadow-slate-300 flex items-center justify-center gap-1 h-[34px] w-full sm:w-auto mt-2 sm:mt-0 cursor-pointer"
      >
        <Plus size={16} /> {t("addTask")}
      </button>

      <div className="w-full h-px bg-slate-200 lg:hidden"></div>
      <div className="w-px h-12 bg-slate-200 self-center hidden lg:block"></div>

      {/* Member Chips & Actions */}
      <div className="flex flex-col gap-1.5 w-full lg:w-auto flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("memberLabel")} ({members.length})
          </label>
          <div className="flex items-center gap-2">
            {onOpenMemberModal && (
              <button
                onClick={onOpenMemberModal}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Quản lý thành viên và xem phân tích workload"
              >
                <Users size={12} /> {t("manageMembers", { count: members.length })}
              </button>
            )}
            {onOpenHolidayModal && (
              <button
                onClick={onOpenHolidayModal}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Quản lý ngày nghỉ lễ"
              >
                <span>🏖️ {t("holidays", { count: holidaysCount })}</span>
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {members.length === 0 ? (
            <span className="text-xs text-slate-400 italic py-1">No members yet</span>
          ) : (
            members.map((m, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full pl-3 pr-1.5 py-1 text-xs font-medium shadow-sm transition-all hover:bg-indigo-100"
              >
                {m}
                <button
                  onClick={() => onRemoveMember(m)}
                  className="bg-indigo-200 hover:bg-indigo-500 hover:text-white text-indigo-700 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
