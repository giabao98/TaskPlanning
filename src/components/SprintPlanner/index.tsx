"use client";

import { useState } from "react";
import { type State, type Task } from "@/types";
import InputPanel from "./InputPanel";
import TaskTable from "./TaskTable";
import GanttChart from "./GanttChart";
import FooterBar from "./FooterBar";

export default function SprintPlanner() {
  const [state, setState] = useState<State>({
    members: [],
    tasks: [],
    _nextId: 1,
  });

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

  const handleLoadState = (newState: State) => {
    // Basic fix for nextId if missing
    if (!newState._nextId) {
      newState._nextId = Math.max(0, ...newState.tasks.map((t) => t.id)) + 1;
    }
    setState(newState);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center gap-4 shadow-md relative z-30">
        <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-inner shadow-indigo-400/50">
          <span className="text-xl">🗓</span>
        </div>
        <h1 className="text-xl font-bold tracking-wide">Sprint Planning</h1>
        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ml-2">
          Gantt App
        </span>
      </header>

      {/* Input Panel */}
      <InputPanel
        members={state.members}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        onAddTask={handleAddTask}
      />

      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden relative z-10 bg-white">
        <TaskTable
          tasks={state.tasks}
          members={state.members}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
        <GanttChart
          tasks={state.tasks}
          members={state.members}
          onUpdateTask={handleUpdateTask}
        />
      </main>

      {/* Footer */}
      <FooterBar state={state} onLoadState={handleLoadState} />
    </div>
  );
}
