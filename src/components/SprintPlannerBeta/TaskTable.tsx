"use client";

import { Trash2, Wand2 } from "lucide-react";
import { type Task, type Holiday } from "@/types";
import { computeEndDate, fmtDisplay } from "@/utils/dateUtils";
import { getTaskColor } from "@/utils/colors";

interface TaskTableProps {
  tasks: Task[];
  members: string[];
  onUpdateTask: (id: number, field: keyof Task, value: any) => void;
  onDeleteTask: (id: number) => void;
  onAutoSchedule?: () => void;
  sprintCapacity?: number;
  holidays?: Holiday[];
}

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-slate-200 text-slate-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

const NEXT_STATUS: Record<string, "TODO" | "IN_PROGRESS" | "DONE"> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

export default function TaskTable({
  tasks,
  members,
  onUpdateTask,
  onDeleteTask,
  onAutoSchedule,
  sprintCapacity = 10,
  holidays = [],
}: TaskTableProps) {
  // Tính tổng effort (workload) của từng thành viên
  const workloads = members.map((_, idx) => {
    return tasks.filter((t) => t.memberId === idx).reduce((acc, t) => acc + t.effort, 0);
  });
  const MAX_CAPACITY = sprintCapacity;

  if (tasks.length === 0) {
    return (
      <div className="flex-1 max-h-[40vh] overflow-y-auto border-b-2 border-slate-200 bg-white flex items-center justify-center p-10">
        <p className="text-slate-400 italic text-sm">No tasks yet. Add tasks from the panel above.</p>
      </div>
    );
  }

  return (
    <div className="flex-none max-h-[40vh] overflow-y-auto overflow-x-auto border-b-2 border-slate-200 bg-white relative custom-scrollbar">
      <table className="w-full border-collapse text-left text-sm whitespace-nowrap min-w-[850px]">
        <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[160px]">Member (Workload)</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 min-w-[220px]">US Name</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[100px]">Status</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[120px]">Effort (days)</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[170px]">
              <div className="flex items-center gap-2">
                Start Date
                {onAutoSchedule && (
                  <button 
                    onClick={onAutoSchedule} 
                    className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400 text-white px-2 py-0.5 rounded text-[10px] ml-auto transition-colors"
                    title="Auto Schedule overlapping tasks"
                  >
                    <Wand2 size={12} /> Magic
                  </button>
                )}
              </div>
            </th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[120px]">End Date</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[70px] text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((t) => {
            const endDate = computeEndDate(t.startDate, t.effort, holidays);
            const color = getTaskColor(t.us);
            const currentStatus = t.status || "TODO";
            const memberEffort = workloads[t.memberId] || 0;
            const isOverloaded = memberEffort > MAX_CAPACITY;

            return (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm mt-1"
                      style={{ backgroundColor: color }}
                    ></span>
                    <div className="flex flex-col flex-1">
                      <select
                        className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-1 py-0.5 text-sm bg-transparent outline-none w-full cursor-pointer transition-colors"
                        value={t.memberId}
                        onChange={(e) => onUpdateTask(t.id, "memberId", parseInt(e.target.value))}
                      >
                        {members.map((m, i) => (
                          <option key={i} value={i}>{m}</option>
                        ))}
                      </select>
                      <div className="px-1 mt-1">
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden" title={`${memberEffort}/${MAX_CAPACITY} days`}>
                          <div 
                            className={`h-full transition-all duration-300 ${isOverloaded ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, (memberEffort / MAX_CAPACITY) * 100)}%` }}
                          />
                        </div>
                        <div className={`text-[9px] mt-0.5 font-medium ${isOverloaded ? 'text-red-500' : 'text-slate-400'}`}>
                          {memberEffort}/{MAX_CAPACITY} days {isOverloaded && '⚠️ Overload'}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-full min-w-[200px] transition-colors focus:bg-white font-medium text-slate-700"
                    value={t.us}
                    onChange={(e) => onUpdateTask(t.id, "us", e.target.value)}
                  />
                </td>
                <td className="py-2 px-4">
                  <select
                    value={currentStatus}
                    onChange={(e) => onUpdateTask(t.id, "status", e.target.value)}
                    className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-colors cursor-pointer outline-none border border-transparent hover:border-slate-300 appearance-none ${STATUS_COLORS[currentStatus]}`}
                  >
                    <option value="TODO" className="bg-white text-slate-700">TODO</option>
                    <option value="IN_PROGRESS" className="bg-white text-slate-700">IN PROGRESS</option>
                    <option value="DONE" className="bg-white text-slate-700">DONE</option>
                  </select>
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-[70px] transition-colors focus:bg-white text-center font-medium text-slate-700"
                    value={t.effort}
                    onChange={(e) => onUpdateTask(t.id, "effort", Number(e.target.value))}
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="date"
                    className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-[135px] transition-colors focus:bg-white text-slate-600"
                    value={t.startDate}
                    onChange={(e) => onUpdateTask(t.id, "startDate", e.target.value)}
                  />
                </td>
                <td className="py-2 px-4 text-slate-500 font-medium">
                  {fmtDisplay(endDate)}
                </td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => onDeleteTask(t.id)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
