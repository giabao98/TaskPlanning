"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useHistoryState } from "@/hooks/useHistoryState";
import { type State, type Task, type Holiday } from "@/types";
import { addWorkingDays, computeEndDate, todayStr } from "@/utils/dateUtils";
import {
  Calendar,
  Clock,
  PlusSquare,
  ListTodo,
  BarChart2,
  Undo2,
  Redo2,
  ChevronUp,
  ChevronDown,
  Users,
  Palmtree,
  UserPlus,
} from "lucide-react";
import InputPanel from "./InputPanel";
import TaskTable from "./TaskTable";
import GanttChart from "./GanttChart";
import FooterBar from "./FooterBar";
import HolidayDialog from "./HolidayDialog";
import MemberManagementDialog from "./MemberManagementDialog";
import FilterBar from "./FilterBar";
import LanguageSwitcher from "./LanguageSwitcher";

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

const SectionHeader = ({
  title,
  icon: Icon,
  badgeBg = "bg-indigo-50 text-indigo-600",
  isOpen,
  onToggle,
  extra,
}: {
  title: string;
  icon: any;
  badgeBg?: string;
  isOpen: boolean;
  onToggle: () => void;
  extra?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between w-full px-4 sm:px-5 py-2.5 bg-white border-b border-slate-200/80 text-slate-800 transition-colors z-20 sticky top-0 shadow-2xs">
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 text-left cursor-pointer group"
    >
      <span
        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${badgeBg}`}
      >
        <Icon size={15} />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 group-hover:text-indigo-600 transition-colors">
        {title}
      </span>
      {isOpen ? (
        <ChevronUp size={15} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
      ) : (
        <ChevronDown size={15} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
      )}
    </button>
    {extra && <div className="flex items-center gap-2">{extra}</div>}
  </div>
);

export default function SprintPlanner() {
  const tHeader = useTranslations("Header");
  const tSection = useTranslations("Section");

  const {
    state,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    resetHistory,
  } = useHistoryState<State>({
    members: [],
    tasks: [],
    _nextId: 1,
    holidays: [],
  });

  const [showInput, setShowInput] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [showGantt, setShowGantt] = useState(true);
  const [capacityInput, setCapacityInput] = useState("10");
  const [nameInput, setNameInput] = useState("Sprint Planning");
  const [quickMemberName, setQuickMemberName] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Effective sprint dates
  const effectiveStartDate =
    state.sprintStartDate || (state.tasks.length > 0 ? state.tasks[0].startDate : todayStr());
  const effectiveEndDate = computeEndDate(
    effectiveStartDate,
    state.sprintCapacity || 10,
    state.holidays
  );

  // Filtered tasks
  const filteredTasks = state.tasks.filter((t) => {
    if (searchQuery && !t.us.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (memberFilter !== "all" && t.memberId !== parseInt(memberFilter, 10)) return false;
    if (statusFilter !== "all" && (t.status || "TODO") !== statusFilter) return false;
    return true;
  });

  // Calculate executive capacity metrics
  const defaultMemberCap = state.sprintCapacity || 10;
  const totalTeamCapacity =
    state.members.length > 0
      ? state.members.reduce(
          (sum, m) => sum + (state.memberCapacities?.[m] ?? defaultMemberCap),
          0
        )
      : defaultMemberCap;

  const totalPlannedEffort = state.tasks.reduce(
    (sum, t) => sum + (t.effort || 0),
    0
  );

  const remainingEffort = Math.max(0, totalTeamCapacity - totalPlannedEffort);
  const plannedPercentage =
    totalTeamCapacity > 0
      ? Math.round((totalPlannedEffort / totalTeamCapacity) * 100)
      : 0;
  const remainingPercentage = Math.max(0, 100 - plannedPercentage);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState =
      localStorage.getItem("sprintPlannerState") ||
      localStorage.getItem("sprintPlannerBetaState");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (Array.isArray(parsed.members) && Array.isArray(parsed.tasks)) {
          resetHistory(parsed);
          setCapacityInput((parsed.sprintCapacity || 10).toString());
          setNameInput(parsed.sessionName || "Sprint Planning");
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    } else {
      const savedCap =
        localStorage.getItem("sprintPlannerCapacity") ||
        localStorage.getItem("sprintPlannerBetaCapacity");
      if (savedCap) {
        const cap = parseInt(savedCap, 10) || 10;
        resetHistory({
          members: [],
          tasks: [],
          _nextId: 1,
          sprintCapacity: cap,
          sessionName: "Sprint Planning",
        });
        setCapacityInput(cap.toString());
      }
    }
    setIsLoaded(true);
  }, [resetHistory]);

  // Save state to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sprintPlannerState", JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Sync text inputs with state on external changes (Undo, Redo, Load)
  useEffect(() => {
    setCapacityInput((state.sprintCapacity || 10).toString());
    setNameInput(state.sessionName || "Sprint Planning");
  }, [state.sprintCapacity, state.sessionName]);

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleAddMember = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (state.members.includes(trimmed)) {
      alert("Member already exists");
      return;
    }
    setState((prev) => ({
      ...prev,
      members: [...prev.members, trimmed],
    }));
  };

  const handleQuickAddMember = () => {
    if (!quickMemberName.trim()) return;
    handleAddMember(quickMemberName);
    setQuickMemberName("");
  };

  const handleRemoveMember = (name: string) => {
    const hasTasks = state.tasks.some((t) => state.members[t.memberId] === name);
    if (hasTasks) {
      if (!confirm(`Remove member "${name}"? Their tasks will also be deleted.`)) return;
    }

    setState((prev) => {
      const idx = prev.members.indexOf(name);
      let newTasks = prev.tasks.filter((t) => t.memberId !== idx);
      newTasks = newTasks.map((t) => {
        if (t.memberId > idx) return { ...t, memberId: t.memberId - 1 };
        return t;
      });
      return {
        ...prev,
        members: prev.members.filter((m) => m !== name),
        tasks: newTasks,
      };
    });
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { ...task, id: prev._nextId }],
      _nextId: prev._nextId + 1,
    }));
  };

  const handleUpdateTask = (id: number, field: keyof Task, value: any) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id === id) {
          if (field === "effort") {
            const v = parseFloat(value);
            if (!isNaN(v) && v > 0) return { ...t, effort: v };
          }
          if (field === "startDate" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return { ...t, startDate: value };
          }
          return { ...t, [field]: value };
        }
        return t;
      }),
    }));
  };

  const handleDeleteTask = (id: number) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const handleSaveHolidays = (holidays: Holiday[]) => {
    setState((prev) => ({ ...prev, holidays }));
  };

  const handleRenameMember = (idx: number, newName: string) => {
    setState((prev) => {
      const newMembers = [...prev.members];
      newMembers[idx] = newName;
      return { ...prev, members: newMembers };
    });
  };

  const handleUpdateMemberCapacity = (name: string, capacity: number) => {
    setState((prev) => ({
      ...prev,
      memberCapacities: {
        ...(prev.memberCapacities || {}),
        [name]: capacity,
      },
    }));
  };

  const handleDeleteMemberWithOption = (idx: number, reassignToMemberIndex?: number) => {
    setState((prev) => {
      let newTasks = [...prev.tasks];
      if (reassignToMemberIndex !== undefined && reassignToMemberIndex !== idx) {
        newTasks = newTasks.map((t) => {
          if (t.memberId === idx) {
            return { ...t, memberId: reassignToMemberIndex };
          }
          return t;
        });
      } else {
        newTasks = newTasks.filter((t) => t.memberId !== idx);
      }

      newTasks = newTasks.map((t) => {
        if (t.memberId > idx) return { ...t, memberId: t.memberId - 1 };
        return t;
      });

      const newMembers = prev.members.filter((_, i) => i !== idx);
      return {
        ...prev,
        members: newMembers,
        tasks: newTasks,
      };
    });
  };

  const handleAutoSchedule = () => {
    setState((prev) => {
      const newTasks = [...prev.tasks];
      prev.members.forEach((_, idx) => {
        const memberTasks = newTasks
          .filter((t) => t.memberId === idx)
          .sort((a, b) => a.id - b.id);
        if (memberTasks.length === 0) return;

        let currentDateStr = memberTasks[0].startDate;

        memberTasks.forEach((task) => {
          task.startDate = currentDateStr;
          currentDateStr = addWorkingDays(currentDateStr, task.effort, prev.holidays);
        });
      });
      return { ...prev, tasks: newTasks };
    });
  };

  const handleLoadState = (newState: State) => {
    if (!newState._nextId) {
      newState._nextId = Math.max(0, ...newState.tasks.map((t) => t.id)) + 1;
    }
    setState(newState);
    setCapacityInput((newState.sprintCapacity || 10).toString());
    setNameInput(newState.sessionName || "Sprint Planning");
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-100 text-slate-800 font-sans overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Stitch Midnight Navy Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between shadow-md relative z-30 flex-none border-b border-slate-800">
        {/* Left branding and sprint window */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_2px_8px_rgba(79,70,229,0.35)] shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={() => {
                    const finalName = nameInput.trim() || tHeader("defaultSessionName");
                    setNameInput(finalName);
                    setState((p) => ({ ...p, sessionName: finalName }));
                  }}
                  className="text-base sm:text-lg font-bold tracking-tight bg-transparent outline-none border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-white w-[130px] sm:w-[200px] transition-colors placeholder:text-slate-500 truncate"
                  placeholder={tHeader("defaultSessionName")}
                  title={tHeader("renameTitle")}
                />
                <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  {tHeader("proBadge")}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium leading-none">
                {tHeader("byAuthor")}
              </span>
            </div>
          </div>

          {/* Sprint Date Window Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/80 text-xs">
            <Clock size={14} className="text-indigo-400 shrink-0" />
            <span className="text-slate-400 font-medium">{tHeader("sprintStart")}</span>
            <input
              type="date"
              value={effectiveStartDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setState((p) => ({ ...p, sprintStartDate: val }));
              }}
              className="bg-transparent text-white outline-none cursor-pointer font-mono font-medium hover:text-indigo-300 transition-colors"
              title={tHeader("sprintStartTitle")}
            />
            <span className="text-slate-500">→</span>
            <span className="text-slate-400 font-medium">{tHeader("sprintEnd")}</span>
            <span
              className="font-bold font-mono text-rose-400"
              title={tHeader("sprintEndTitle")}
            >
              {effectiveEndDate}
            </span>
          </div>

          {/* Capacity Pill on Desktop */}
          <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300">{tHeader("capacity")}</span>
            <input
              type="text"
              value={capacityInput}
              onChange={(e) => setCapacityInput(e.target.value)}
              onBlur={() => {
                let parsed = parseInt(capacityInput, 10);
                if (isNaN(parsed) || parsed <= 0) parsed = 10;
                setCapacityInput(parsed.toString());
                setState((p) => ({ ...p, sprintCapacity: parsed }));
              }}
              className="bg-transparent text-white w-8 outline-none text-center font-bold"
              title="Sprint Capacity"
            />
            <span className="text-slate-400 text-[11px] font-mono">
              {tHeader("capacityHrs", {
                days: capacityInput,
                hrs: (parseInt(capacityInput, 10) || 10) * 8,
              })}
            </span>
          </div>
        </div>

        {/* Right tools: Language switcher, Undo/Redo */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <LanguageSwitcher />

          <div className="flex items-center gap-0.5 border-l border-slate-700/80 pl-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                canUndo
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 cursor-not-allowed"
              }`}
              title={tHeader("undo")}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                canRedo
                  ? "text-slate-300 hover:text-white hover:bg-slate-800"
                  : "text-slate-600 cursor-not-allowed"
              }`}
              title={tHeader("redo")}
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Mobile/Tablet Fallback Capacity */}
          <div className="flex 2xl:hidden items-center bg-slate-800 rounded-lg px-2 py-1 border border-slate-700 text-xs">
            <input
              type="text"
              value={capacityInput}
              onChange={(e) => setCapacityInput(e.target.value)}
              onBlur={() => {
                let parsed = parseInt(capacityInput, 10);
                if (isNaN(parsed) || parsed <= 0) parsed = 10;
                setCapacityInput(parsed.toString());
                setState((p) => ({ ...p, sprintCapacity: parsed }));
              }}
              className="bg-transparent text-white w-8 outline-none text-center font-bold"
              title="Sprint Capacity"
            />
            <span className="text-slate-400 text-[11px] ml-0.5">{tHeader("days")}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative z-10 bg-slate-100 custom-scrollbar">
        {/* Stitch Top Team & Capacity Summary Ribbon */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 m-3 sm:m-4 flex-none">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Team Members Button & Avatar Disc Stack */}
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer group shadow-2xs active:scale-[0.98]"
              title="Quản lý thành viên đội ngũ"
            >
              <Users size={16} className="text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-xs text-slate-800">
                Members ({state.members.length})
              </span>

              {/* Overlapping Avatar Stack */}
              {state.members.length > 0 && (
                <div className="flex items-center -space-x-2 ml-1">
                  {state.members.slice(0, 5).map((m, idx) => {
                    const memberEffort = state.tasks
                      .filter((t) => t.memberId === idx)
                      .reduce((sum, t) => sum + (t.effort || 0), 0);
                    const memberCap = state.memberCapacities?.[m] ?? defaultMemberCap;
                    const isOverloaded = memberEffort > memberCap;
                    const isAtCap = memberEffort === memberCap;

                    return (
                      <div
                        key={m}
                        className="relative group/avatar"
                        title={`${m}: ${memberEffort}/${memberCap}d`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full ${
                            AVATAR_COLORS[idx % AVATAR_COLORS.length]
                          } flex items-center justify-center text-white font-bold text-[9px] ring-2 ring-white`}
                        >
                          {getInitials(m)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white ${
                            isOverloaded
                              ? "bg-rose-500"
                              : isAtCap
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                      </div>
                    );
                  })}
                  {state.members.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                      +{state.members.length - 5}
                    </div>
                  )}
                </div>
              )}
            </button>

            {/* Holidays Pill */}
            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              title="Quản lý ngày nghỉ lễ"
            >
              <Palmtree size={15} className="text-amber-600" />
              <span className="font-semibold text-xs">
                Holidays ({state.holidays?.length || 0})
              </span>
            </button>

            {/* Inline Quick Add Member */}
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-2 py-1 shadow-2xs">
              <UserPlus size={14} className="text-slate-400 ml-1 shrink-0" />
              <input
                type="text"
                className="bg-transparent text-slate-800 placeholder:text-slate-400 text-xs px-2 py-0.5 focus:outline-none w-28 sm:w-36 font-medium"
                placeholder={tHeader("quickAddPlaceholder")}
                value={quickMemberName}
                onChange={(e) => setQuickMemberName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickAddMember()}
              />
              <button
                onClick={handleQuickAddMember}
                className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-indigo-600 transition-colors shrink-0 cursor-pointer active:scale-95"
              >
                {tHeader("addTeammate")}
              </button>
            </div>
          </div>

          {/* Sprint Capacity Metrics Strip */}
          <div className="flex items-center flex-wrap gap-2.5 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {tHeader("capacityTitle")}
              </span>
              <span className="font-mono font-bold text-slate-800">
                {totalTeamCapacity}d ({totalTeamCapacity * 8}h)
              </span>
            </div>
            <span className="text-slate-300 font-mono">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {tHeader("plannedTitle")}
              </span>
              <span className="font-mono font-bold text-indigo-600">
                {totalPlannedEffort}d ({plannedPercentage}%)
              </span>
            </div>
            <span className="text-slate-300 font-mono">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {tHeader("remainingTitle")}
              </span>
              <span className="font-mono font-bold text-emerald-600">
                {remainingEffort}d ({remainingPercentage}%)
              </span>
            </div>

            {/* Micro visual progress meter */}
            <div className="w-20 sm:w-24 h-2 bg-slate-200 rounded-full overflow-hidden ml-1 hidden sm:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  plannedPercentage > 100
                    ? "bg-rose-500"
                    : plannedPercentage === 100
                    ? "bg-amber-500"
                    : "bg-indigo-600"
                }`}
                style={{ width: `${Math.min(100, plannedPercentage)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section 1: Data Entry Module (Collapsible) */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 mx-3 sm:mx-4 mb-4 flex-none overflow-hidden transition-all">
          <SectionHeader
            title={tSection("dataEntry")}
            icon={PlusSquare}
            badgeBg="bg-indigo-50 text-indigo-600"
            isOpen={showInput}
            onToggle={() => setShowInput(!showInput)}
          />
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showInput ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <InputPanel
              members={state.members}
              tasks={state.tasks}
              sprintCapacity={state.sprintCapacity || 10}
              memberCapacities={state.memberCapacities || {}}
              sprintStartDate={effectiveStartDate}
              sprintEndDate={effectiveEndDate}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onAddTask={handleAddTask}
              onOpenHolidayModal={() => setIsHolidayModalOpen(true)}
              onOpenMemberModal={() => setIsMemberModalOpen(true)}
              holidaysCount={state.holidays?.length || 0}
            />
          </div>
        </div>

        {/* Section 2: Task Breakdown Table (Collapsible) */}
        <div className="bg-white rounded-xl shadow-2xs border border-slate-200/80 mx-3 sm:mx-4 mb-4 flex-none overflow-hidden transition-all">
          <SectionHeader
            title={tSection("taskList")}
            icon={ListTodo}
            badgeBg="bg-blue-50 text-blue-600"
            isOpen={showTable}
            onToggle={() => setShowTable(!showTable)}
            extra={
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                {filteredTasks.length} / {state.tasks.length} Tasks
              </span>
            }
          />
          <div
            className={`transition-all duration-300 overflow-hidden ${
              showTable ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-3 sm:p-4 pb-2 border-b border-slate-100">
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                memberFilter={memberFilter}
                onMemberFilterChange={setMemberFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                members={state.members}
                totalTasks={state.tasks.length}
                filteredCount={filteredTasks.length}
              />
            </div>
            <TaskTable
              tasks={filteredTasks}
              allTasks={state.tasks}
              members={state.members}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAutoSchedule={handleAutoSchedule}
              sprintCapacity={state.sprintCapacity || 10}
              memberCapacities={state.memberCapacities || {}}
              sprintEndDate={effectiveEndDate}
              holidays={state.holidays || []}
            />
          </div>
        </div>

        {/* Section 3: Gantt Timeline Schedule (Collapsible) */}
        <div
          className={`bg-white rounded-xl shadow-2xs border border-slate-200/80 mx-3 sm:mx-4 mb-16 overflow-hidden transition-all ${
            showGantt ? "flex-1 min-h-[460px]" : "flex-none"
          }`}
        >
          <SectionHeader
            title={tSection("ganttTimeline")}
            icon={BarChart2}
            badgeBg="bg-indigo-50 text-indigo-600"
            isOpen={showGantt}
            onToggle={() => setShowGantt(!showGantt)}
          />
          <div
            className={`flex flex-col transition-all duration-300 ${
              showGantt ? "flex-1 opacity-100 h-full" : "h-0 opacity-0 overflow-hidden"
            }`}
          >
            {showGantt && (
              <GanttChart
                tasks={filteredTasks}
                members={state.members}
                onUpdateTask={handleUpdateTask}
                holidays={state.holidays || []}
                sprintStartDate={effectiveStartDate}
                sprintEndDate={effectiveEndDate}
                sessionName={state.sessionName}
              />
            )}
          </div>
        </div>
      </main>

      {/* Stitch Glassmorphism Sticky Footer Bar */}
      <FooterBar state={state} onLoadState={handleLoadState} />

      {/* Holiday Dialog */}
      <HolidayDialog
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        holidays={state.holidays || []}
        onSaveHolidays={handleSaveHolidays}
      />

      {/* Member Management Dialog */}
      <MemberManagementDialog
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={state.members}
        tasks={state.tasks}
        sprintCapacity={state.sprintCapacity || 10}
        memberCapacities={state.memberCapacities || {}}
        onAddMember={handleAddMember}
        onRenameMember={handleRenameMember}
        onDeleteMember={handleDeleteMemberWithOption}
        onUpdateMemberCapacity={handleUpdateMemberCapacity}
      />
    </div>
  );
}
