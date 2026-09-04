"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useHistoryState } from "@/hooks/useHistoryState";
import { type State, type Task, type Holiday } from "@/types";
import { addWorkingDays, computeEndDate, todayStr } from "@/utils/dateUtils";
import { ChevronUp, ChevronDown, PlusSquare, ListTodo, BarChart2, Undo2, Redo2, Flag } from "lucide-react";
import InputPanel from "./InputPanel";
import TaskTable from "./TaskTable";
import GanttChart from "./GanttChart";
import FooterBar from "./FooterBar";
import HolidayDialog from "./HolidayDialog";
import MemberManagementDialog from "./MemberManagementDialog";
import FilterBar from "./FilterBar";
import LanguageSwitcher from "./LanguageSwitcher";

const SectionHeader = ({ title, icon: Icon, isOpen, onToggle }: { title: string; icon: any; isOpen: boolean; onToggle: () => void }) => (
  <button 
    onClick={onToggle}
    className="flex items-center justify-between w-full px-4 sm:px-5 py-2 bg-slate-50/80 border-b border-slate-200/80 text-slate-700 hover:bg-slate-100 transition-colors backdrop-blur-sm z-20 sticky top-0"
  >
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
      <Icon size={14} className="text-indigo-500" />
      {title}
    </div>
    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
  </button>
);

export default function SprintPlannerBeta() {
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
    if (memberFilter !== "all" && t.memberId !== parseInt(memberFilter)) return false;
    if (statusFilter !== "all" && (t.status || "TODO") !== statusFilter) return false;
    return true;
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sprintPlannerBetaState");
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
      const savedCap = localStorage.getItem("sprintPlannerBetaCapacity");
      if (savedCap) {
        const cap = parseInt(savedCap, 10) || 10;
        resetHistory({ members: [], tasks: [], _nextId: 1, sprintCapacity: cap, sessionName: "Sprint Planning" });
        setCapacityInput(cap.toString());
      }
    }
    setIsLoaded(true);
  }, [resetHistory]);

  // Save state to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sprintPlannerBetaState", JSON.stringify(state));
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
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if (canRedo) redo();
        } else {
          if (canUndo) undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  const handleAddMember = (name: string) => {
    if (state.members.includes(name)) {
      alert("Member already exists");
      return;
    }
    setState((prev) => ({
      ...prev,
      members: [...prev.members, name],
    }));
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
        // Reassign tasks to the chosen member
        newTasks = newTasks.map((t) => {
          if (t.memberId === idx) {
            return { ...t, memberId: reassignToMemberIndex };
          }
          return t;
        });
      } else {
        // Delete tasks of this member
        newTasks = newTasks.filter((t) => t.memberId !== idx);
      }

      // Remap memberId for indices greater than idx
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
        const memberTasks = newTasks.filter((t) => t.memberId === idx).sort((a, b) => a.id - b.id);
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
    <div className="flex flex-col h-[100dvh] bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4 shadow-md relative z-30 flex-none">
        <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-inner shadow-indigo-400/50">
          <span className="text-xl">🗓</span>
        </div>
        <input 
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          onBlur={() => {
            const finalName = nameInput.trim() || tHeader("defaultSessionName");
            setNameInput(finalName);
            setState(p => ({ ...p, sessionName: finalName }));
          }}
          className="text-xl font-bold tracking-wide bg-transparent outline-none border-b border-transparent hover:border-slate-700 focus:border-indigo-500 text-white w-[160px] sm:w-[250px] transition-colors placeholder:text-slate-500 truncate"
          placeholder={tHeader("defaultSessionName")}
          title={tHeader("renameTitle")}
        />
        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ml-2 hidden sm:inline-block">
          {tHeader("ganttApp")}
        </span>
        <div className="ml-auto flex items-center gap-2 sm:gap-3 text-sm">
          {/* Language Switcher */}
          <LanguageSwitcher />

          <div className="flex items-center gap-1 mr-1 sm:mr-2 sm:border-r sm:border-slate-700 sm:pr-3">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'}`}
              title={tHeader("undo")}
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-slate-300 hover:text-white hover:bg-slate-700' : 'text-slate-600 cursor-not-allowed'}`}
              title={tHeader("redo")}
            >
              <Redo2 size={16} />
            </button>
          </div>

          {/* Sprint Start / End Date */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800 rounded px-2.5 py-1 border border-slate-700 text-xs">
            <Flag size={13} className="text-emerald-400 shrink-0" />
            <span className="text-slate-400">{tHeader("sprintStart")}</span>
            <input
              type="date"
              value={effectiveStartDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val) setState((p) => ({ ...p, sprintStartDate: val }));
              }}
              className="bg-transparent text-white outline-none cursor-pointer font-medium hover:text-indigo-300 transition-colors"
              title={tHeader("sprintStartTitle")}
            />
            <span className="text-slate-500">→</span>
            <span className="text-slate-400">{tHeader("sprintEnd")}</span>
            <span className="font-bold text-rose-400" title={tHeader("sprintEndTitle")}>
              {effectiveEndDate}
            </span>
          </div>

          <span className="text-slate-300 font-medium hidden sm:inline-block">{tHeader("capacity")}</span>
          <div className="flex items-center bg-slate-800 rounded px-2 py-1 border border-slate-700">
            <input 
              type="text" 
              value={capacityInput} 
              onChange={(e) => setCapacityInput(e.target.value)}
              onBlur={() => {
                let parsed = parseInt(capacityInput, 10);
                if (isNaN(parsed) || parsed <= 0) parsed = 10;
                setCapacityInput(parsed.toString());
                setState(p => ({ ...p, sprintCapacity: parsed }));
              }}
              className="bg-transparent text-white w-10 sm:w-12 outline-none text-center font-bold"
              title="Sprint Capacity"
            />
            <span className="text-slate-400 text-[10px] sm:text-xs ml-1">{tHeader("days")}</span>
          </div>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative z-10 bg-white">
        
        {/* Input Panel Section */}
        <div className="flex flex-col flex-none">
          <SectionHeader title={tSection("dataEntry")} icon={PlusSquare} isOpen={showInput} onToggle={() => setShowInput(!showInput)} />
          <div className={`transition-all duration-300 overflow-hidden ${showInput ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <InputPanel
              members={state.members}
              tasks={state.tasks}
              sprintCapacity={state.sprintCapacity || 10}
              memberCapacities={state.memberCapacities || {}}
              sprintStartDate={effectiveStartDate}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onAddTask={handleAddTask}
              onOpenHolidayModal={() => setIsHolidayModalOpen(true)}
              onOpenMemberModal={() => setIsMemberModalOpen(true)}
              holidaysCount={state.holidays?.length || 0}
            />
          </div>
        </div>

        {/* Task Table Section */}
        <div className="flex flex-col flex-none bg-white relative z-10">
          <SectionHeader title={tSection("taskList")} icon={ListTodo} isOpen={showTable} onToggle={() => setShowTable(!showTable)} />
          <div className={`transition-all duration-300 overflow-hidden ${showTable ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-3 sm:p-4 pb-2.5">
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

        {/* Gantt Chart Section */}
        <div className={`flex flex-col bg-white relative z-0 ${showGantt ? 'flex-1' : 'flex-none'}`}>
          <SectionHeader title={tSection("ganttTimeline")} icon={BarChart2} isOpen={showGantt} onToggle={() => setShowGantt(!showGantt)} />
          <div className={`flex flex-col transition-all duration-300 ${showGantt ? 'flex-1 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
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

      {/* Footer */}
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
