"use client";

import { useTranslations } from "next-intl";
import { Trash2, Wand2, GripVertical } from "lucide-react";
import { type Task, type Holiday } from "@/types";
import { computeEndDate, fmtDisplay } from "@/utils/dateUtils";
import { getTaskColor } from "@/utils/colors";

interface TaskTableProps {
  tasks: Task[];
  allTasks?: Task[];
  members: string[];
  onUpdateTask: (id: number, field: keyof Task, value: any) => void;
  onDeleteTask: (id: number) => void;
  onAutoSchedule?: () => void;
  sprintCapacity?: number;
  holidays?: Holiday[];
  memberCapacities?: Record<string, number>;
  sprintEndDate?: string;
}

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

const STATUS_CONFIG: Record<
  string,
  { pct: number; barColor: string; pillClass: string; label: string }
> = {
  TODO: {
    pct: 0,
    barColor: "bg-slate-300",
    pillClass: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    label: "To Do",
  },
  IN_PROGRESS: {
    pct: 60,
    barColor: "bg-indigo-600",
    pillClass: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
    label: "In Progress",
  },
  DONE: {
    pct: 100,
    barColor: "bg-emerald-500",
    pillClass: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    label: "Done",
  },
};

export default function TaskTable({
  tasks,
  allTasks,
  members,
  onUpdateTask,
  onDeleteTask,
  onAutoSchedule,
  sprintCapacity = 10,
  holidays = [],
  memberCapacities = {},
  sprintEndDate,
}: TaskTableProps) {
  const t = useTranslations("TaskList");
  const referenceTasks = allTasks || tasks;
  const workloads = members.map((_, idx) => {
    return referenceTasks
      .filter((t) => t.memberId === idx)
      .reduce((acc, t) => acc + t.effort, 0);
  });
  const MAX_CAPACITY = sprintCapacity;

  if (tasks.length === 0) {
    return (
      <div className="flex-1 min-h-[140px] bg-white flex items-center justify-center p-8">
        <p className="text-slate-400 italic text-sm">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[44vh] custom-scrollbar bg-white">
      <table className="w-full border-collapse text-left text-sm whitespace-nowrap min-w-[920px]">
        {/* Sticky Table Header */}
        <thead className="bg-slate-900 text-slate-200 sticky top-0 z-10 shadow-sm text-[11px] font-bold uppercase tracking-wider">
          <tr>
            <th className="py-2.5 px-3 w-10 text-center text-slate-400">#</th>
            <th className="py-2.5 px-3 min-w-[240px]">{t("colUs")}</th>
            <th className="py-2.5 px-3 w-[180px]">{t("colMember")}</th>
            <th className="py-2.5 px-3 w-[100px]">{t("colEffort")}</th>
            <th className="py-2.5 px-3 w-[220px]">
              <div className="flex items-center justify-between">
                <span>{t("colStart")} &amp; {t("colEnd")}</span>
                {onAutoSchedule && (
                  <button
                    onClick={onAutoSchedule}
                    className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer active:scale-95 ml-2"
                    title={t("autoSchedule")}
                  >
                    <Wand2 size={11} />
                    <span>Auto</span>
                  </button>
                )}
              </div>
            </th>
            <th className="py-2.5 px-3 w-[170px]">Status &amp; Delivery</th>
            <th className="py-2.5 px-3 w-[60px] text-right">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {tasks.map((tRow) => {
            const endDate = computeEndDate(tRow.startDate, tRow.effort, holidays);
            const color = getTaskColor(tRow.us);
            const currentStatus = tRow.status || "TODO";
            const statusConfig =
              STATUS_CONFIG[currentStatus] || STATUS_CONFIG.TODO;
            const memberName = members[tRow.memberId] || "";
            const memberCap = memberCapacities[memberName] ?? MAX_CAPACITY;
            const memberEffort = workloads[tRow.memberId] || 0;
            const isOverloaded = memberEffort > memberCap;
            const isSpillover = sprintEndDate && endDate > sprintEndDate;

            return (
              <tr
                key={tRow.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                {/* Drag / Index Column */}
                <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                  <GripVertical
                    size={14}
                    className="inline opacity-0 group-hover:opacity-60 transition-opacity text-slate-400 cursor-grab"
                  />
                </td>

                {/* User Story & Scope Column */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <input
                      type="text"
                      value={tRow.us}
                      onChange={(e) =>
                        onUpdateTask(tRow.id, "us", e.target.value)
                      }
                      className="border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-2 py-1 text-sm bg-transparent outline-none w-full min-w-[200px] transition-colors focus:bg-white font-medium text-slate-800"
                    />
                  </div>
                </td>

                {/* Assignee Column with Avatar Disc */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full ${
                        AVATAR_COLORS[tRow.memberId % AVATAR_COLORS.length]
                      } text-white font-bold text-[9px] flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      {getInitials(memberName)}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <select
                        value={tRow.memberId}
                        onChange={(e) =>
                          onUpdateTask(
                            tRow.id,
                            "memberId",
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1 py-0.5 text-xs font-semibold text-slate-700 bg-transparent outline-none cursor-pointer transition-colors w-full"
                      >
                        {members.map((m, i) => (
                          <option key={i} value={i}>
                            {m}
                          </option>
                        ))}
                      </select>
                      {/* Workload micro meter */}
                      <div className="px-1 mt-0.5">
                        <div
                          className="h-1 w-full bg-slate-200 rounded-full overflow-hidden"
                          title={`${memberEffort}/${memberCap} days`}
                        >
                          <div
                            className={`h-full transition-all duration-300 ${
                              isOverloaded ? "bg-rose-500" : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                (memberEffort / memberCap) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Effort Column */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={tRow.effort}
                      onChange={(e) =>
                        onUpdateTask(tRow.id, "effort", Number(e.target.value))
                      }
                      className="w-14 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-800 font-mono font-bold text-xs px-2 py-1 text-center rounded-lg border border-transparent focus:border-indigo-500 outline-none transition-colors"
                    />
                    <span className="text-slate-400 font-mono text-xs">d</span>
                  </div>
                </td>

                {/* Schedule Window Column (Start → End) */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="date"
                      value={tRow.startDate}
                      onChange={(e) =>
                        onUpdateTask(tRow.id, "startDate", e.target.value)
                      }
                      className="border border-transparent hover:border-slate-200 focus:border-indigo-500 rounded px-1.5 py-0.5 text-xs bg-transparent outline-none focus:bg-white text-slate-700 cursor-pointer"
                    />
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-slate-700">
                      {fmtDisplay(endDate)}
                    </span>
                    {isSpillover && (
                      <span
                        className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded leading-none shrink-0"
                        title={`${t("spillover")}: ${sprintEndDate}`}
                      >
                        ⚠️ {t("spillover")}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status & Delivery Column with Progress Meter */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        onUpdateTask(tRow.id, "status", e.target.value)
                      }
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer outline-none border border-transparent transition-colors ${statusConfig.pillClass}`}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>

                    {/* Micro delivery meter */}
                    <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${statusConfig.barColor}`}
                        style={{ width: `${statusConfig.pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold w-7 text-right">
                      {statusConfig.pct}%
                    </span>
                  </div>
                </td>

                {/* Actions Column */}
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => onDeleteTask(tRow.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-all opacity-70 group-hover:opacity-100 cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 size={15} />
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
