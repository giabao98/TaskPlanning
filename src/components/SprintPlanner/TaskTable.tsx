"use client";

import { Trash2 } from "lucide-react";
import { type Task } from "@/types";
import { computeEndDate, fmtDisplay } from "@/utils/dateUtils";
import { getTaskColor } from "@/utils/colors";

interface TaskTableProps {
  tasks: Task[];
  members: string[];
  onUpdateTask: (id: number, field: keyof Task, value: any) => void;
  onDeleteTask: (id: number) => void;
}

export default function TaskTable({
  tasks,
  members,
  onUpdateTask,
  onDeleteTask,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 max-h-[40vh] overflow-y-auto border-b-2 border-slate-200 bg-white flex items-center justify-center p-10">
        <p className="text-slate-400 italic text-sm">No tasks yet. Add tasks from the panel above.</p>
      </div>
    );
  }

  return (
    <div className="flex-none max-h-[40vh] overflow-y-auto overflow-x-auto border-b-2 border-slate-200 bg-white relative custom-scrollbar">
      <table className="w-full border-collapse text-left text-sm whitespace-nowrap min-w-[700px]">
        <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[160px]">Member</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 min-w-[220px]">US Name</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[120px]">Effort (days)</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[150px]">Start Date</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[120px]">End Date</th>
            <th className="font-semibold uppercase tracking-wider text-[11px] py-3 px-4 w-[70px] text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((t) => {
            const endDate = computeEndDate(t.startDate, t.effort);
            const color = getTaskColor(t.us);
            return (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    ></span>
                    <select
                      className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-full cursor-pointer transition-colors"
                      value={t.memberId}
                      onChange={(e) => onUpdateTask(t.id, "memberId", parseInt(e.target.value))}
                    >
                      {members.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-full min-w-[200px] transition-colors focus:bg-white"
                    value={t.us}
                    onChange={(e) => onUpdateTask(t.id, "us", e.target.value)}
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-[70px] transition-colors focus:bg-white text-center"
                    value={t.effort}
                    onChange={(e) => onUpdateTask(t.id, "effort", Number(e.target.value))}
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="date"
                    className="border border-transparent hover:border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-[135px] transition-colors focus:bg-white"
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
