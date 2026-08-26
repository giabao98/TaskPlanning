"use client";

import { useState } from "react";
import { type State, type Task } from "@/types";
import { addWorkingDays } from "@/utils/dateUtils";
import { ChevronUp, ChevronDown, PlusSquare, ListTodo, BarChart2 } from "lucide-react";
import InputPanel from "./InputPanel";
import TaskTable from "./TaskTable";
import GanttChart from "./GanttChart";
import FooterBar from "./FooterBar";

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
  const [state, setState] = useState<State>({
    members: [],
    tasks: [],
    _nextId: 1,
  });

  const [showInput, setShowInput] = useState(true);
  const [showTable, setShowTable] = useState(true);
  const [showGantt, setShowGantt] = useState(true);

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

  const handleAutoSchedule = () => {
    setState((prev) => {
      const newTasks = [...prev.tasks];
      prev.members.forEach((_, idx) => {
        const memberTasks = newTasks.filter(t => t.memberId === idx).sort((a,b) => a.id - b.id);
        if (memberTasks.length === 0) return;
        
        let currentDateStr = memberTasks[0].startDate;

        memberTasks.forEach(task => {
          task.startDate = currentDateStr;
          currentDateStr = addWorkingDays(currentDateStr, task.effort);
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
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4 shadow-md relative z-30 flex-none">
        <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-inner shadow-indigo-400/50">
          <span className="text-xl">🗓</span>
        </div>
        <h1 className="text-xl font-bold tracking-wide">Sprint Planning</h1>
        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ml-2 hidden sm:inline-block">
          Gantt App
        </span>
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="text-slate-300 font-medium hidden sm:inline-block">Capacity:</span>
          <div className="flex items-center bg-slate-800 rounded px-2 py-1 border border-slate-700">
            <input 
              type="number" 
              min="1" 
              value={state.sprintCapacity || 10} 
              onChange={(e) => setState(p => ({ ...p, sprintCapacity: parseInt(e.target.value) || 10 }))}
              className="bg-transparent text-white w-10 sm:w-12 outline-none text-center font-bold"
            />
            <span className="text-slate-400 text-[10px] sm:text-xs ml-1">days</span>
          </div>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative z-10 bg-white">
        
        {/* Input Panel Section */}
        <div className="flex flex-col flex-none">
          <SectionHeader title="Data Entry" icon={PlusSquare} isOpen={showInput} onToggle={() => setShowInput(!showInput)} />
          <div className={`transition-all duration-300 overflow-hidden ${showInput ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <InputPanel
              members={state.members}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              onAddTask={handleAddTask}
            />
          </div>
        </div>

        {/* Task Table Section */}
        <div className="flex flex-col flex-none bg-white relative z-10">
          <SectionHeader title="Task List" icon={ListTodo} isOpen={showTable} onToggle={() => setShowTable(!showTable)} />
          <div className={`transition-all duration-300 overflow-hidden ${showTable ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <TaskTable
              tasks={state.tasks}
              members={state.members}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAutoSchedule={handleAutoSchedule}
              sprintCapacity={state.sprintCapacity || 10}
            />
          </div>
        </div>

        {/* Gantt Chart Section */}
        <div className={`flex flex-col bg-white relative z-0 ${showGantt ? 'flex-1' : 'flex-none'}`}>
          <SectionHeader title="Gantt Timeline" icon={BarChart2} isOpen={showGantt} onToggle={() => setShowGantt(!showGantt)} />
          <div className={`flex flex-col transition-all duration-300 ${showGantt ? 'flex-1 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}>
            {showGantt && (
              <GanttChart
                tasks={state.tasks}
                members={state.members}
                onUpdateTask={handleUpdateTask}
              />
            )}
          </div>
        </div>

      </main>

      {/* Footer */}
      <FooterBar state={state} onLoadState={handleLoadState} />
    </div>
  );
}
