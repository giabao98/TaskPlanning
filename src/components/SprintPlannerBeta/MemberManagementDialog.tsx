"use client";

import { useState } from "react";
import {
  X,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRightLeft,
  ListTodo,
} from "lucide-react";
import { type Task } from "@/types";
import { computeEndDate, fmtDisplay } from "@/utils/dateUtils";
import { getTaskColor } from "@/utils/colors";

interface MemberManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  members: string[];
  tasks: Task[];
  sprintCapacity?: number;
  onAddMember: (name: string) => void;
  onRenameMember: (index: number, newName: string) => void;
  onDeleteMember: (index: number, reassignToMemberIndex?: number) => void;
}

const STATUS_BADGES: Record<string, string> = {
  TODO: "bg-slate-200 text-slate-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-emerald-100 text-emerald-700",
};

export default function MemberManagementDialog({
  isOpen,
  onClose,
  members,
  tasks,
  sprintCapacity = 10,
  onAddMember,
  onRenameMember,
  onDeleteMember,
}: MemberManagementDialogProps) {
  const [newMemberName, setNewMemberName] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedMember, setExpandedMember] = useState<number | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    idx: number;
    name: string;
    taskCount: number;
  } | null>(null);
  const [reassignIdx, setReassignIdx] = useState<string>("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newMemberName.trim()) return;
    if (members.includes(newMemberName.trim())) {
      alert("Thành viên này đã có trong danh sách.");
      return;
    }
    onAddMember(newMemberName.trim());
    setNewMemberName("");
  };

  const startEdit = (idx: number, currentName: string) => {
    setEditingIdx(idx);
    setEditName(currentName);
  };

  const saveEdit = (idx: number) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    if (members[idx] !== trimmed && members.includes(trimmed)) {
      alert("Tên thành viên này đã tồn tại.");
      return;
    }
    onRenameMember(idx, trimmed);
    setEditingIdx(null);
  };

  const initiateDelete = (idx: number, name: string) => {
    const count = tasks.filter((t) => t.memberId === idx).length;
    if (count === 0) {
      if (confirm(`Xoá thành viên "${name}"?`)) {
        onDeleteMember(idx);
      }
      return;
    }
    // Has tasks: open confirm dialog
    setDeleteTarget({ idx, name, taskCount: count });
    // Default reassign to first other member if available
    const otherIdx = members.findIndex((_, i) => i !== idx);
    setReassignIdx(otherIdx >= 0 ? otherIdx.toString() : "");
  };

  const confirmDeleteAction = (action: "delete_all" | "reassign") => {
    if (!deleteTarget) return;

    if (action === "delete_all") {
      onDeleteMember(deleteTarget.idx);
    } else if (action === "reassign") {
      const targetIdx = parseInt(reassignIdx);
      if (isNaN(targetIdx) || targetIdx < 0 || targetIdx >= members.length) {
        alert("Vui lòng chọn thành viên tiếp nhận task.");
        return;
      }
      onDeleteMember(deleteTarget.idx, targetIdx);
    }
    setDeleteTarget(null);
  };

  // Team summary
  const totalEffort = tasks.reduce((sum, t) => sum + t.effort, 0);
  const totalCapacity = members.length * sprintCapacity;
  const overloadedCount = members.filter((_, idx) => {
    const effort = tasks.filter((t) => t.memberId === idx).reduce((sum, t) => sum + t.effort, 0);
    return effort > sprintCapacity;
  }).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Quản Lý Thành Viên & Workload</h2>
              <p className="text-xs text-slate-500">
                Thống kê khối lượng công việc, danh sách task và phân công thành viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          {/* Quick Team Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Thành viên</div>
              <div className="text-lg font-bold text-slate-800 mt-0.5">{members.length} người</div>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Effort / Capacity</div>
              <div className="text-lg font-bold text-indigo-600 mt-0.5">
                {totalEffort} / {totalCapacity} <span className="text-xs font-normal text-slate-500">ngày</span>
              </div>
            </div>
            <div className={`border rounded-xl p-3 text-center ${overloadedCount > 0 ? "bg-red-50 border-red-200/80" : "bg-emerald-50 border-emerald-200/80"}`}>
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${overloadedCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                Quá tải (&gt; {sprintCapacity}d)
              </div>
              <div className={`text-lg font-bold mt-0.5 ${overloadedCount > 0 ? "text-red-600" : "text-emerald-700"}`}>
                {overloadedCount} người
              </div>
            </div>
          </div>

          {/* Add Member Form */}
          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 flex items-center gap-2.5">
            <UserPlus size={16} className="text-indigo-600 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Nhập tên thành viên mới..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-700"
            />
            <button
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors shadow-xs"
            >
              Thêm
            </button>
          </div>

          {/* Member List */}
          <div className="flex flex-col gap-3">
            {members.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm italic">
                Chưa có thành viên nào. Hãy thêm thành viên đầu tiên ở ô trên!
              </div>
            ) : (
              members.map((member, idx) => {
                const memberTasks = tasks.filter((t) => t.memberId === idx);
                const effort = memberTasks.reduce((sum, t) => sum + t.effort, 0);
                const isOverloaded = effort > sprintCapacity;
                const percent = Math.min(100, Math.round((effort / sprintCapacity) * 100));
                const isExpanded = expandedMember === idx;

                // Initials for avatar
                const initials = member
                  .split(" ")
                  .map((w) => w[0])
                  .slice(-2)
                  .join("")
                  .toUpperCase() || "M";

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Main Row */}
                    <div className="p-4 flex items-center justify-between gap-4">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          {initials}
                        </div>

                        {editingIdx === idx ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && saveEdit(idx)}
                              className="border border-indigo-500 rounded px-2 py-0.5 text-sm outline-none w-[130px]"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(idx)}
                              className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"
                              title="Lưu tên"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingIdx(null)}
                              className="text-slate-400 hover:bg-slate-100 p-1 rounded transition-colors"
                              title="Hủy"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group">
                            <span className="text-sm font-semibold text-slate-800">{member}</span>
                            <button
                              onClick={() => startEdit(idx, member)}
                              className="text-slate-400 hover:text-indigo-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Đổi tên"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="flex-1 max-w-[200px] flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className={`font-semibold ${isOverloaded ? "text-red-600" : "text-slate-600"}`}>
                            {effort} / {sprintCapacity} ngày ({percent}%)
                          </span>
                          {isOverloaded && (
                            <span className="text-red-500 text-[10px] font-bold uppercase tracking-tight flex items-center gap-0.5">
                              <AlertTriangle size={11} /> Quá tải
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              isOverloaded ? "bg-red-500" : percent > 80 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setExpandedMember(isExpanded ? null : idx)}
                          className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          title="Xem danh sách task"
                        >
                          <ListTodo size={14} />
                          <span>{memberTasks.length} tasks</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <button
                          onClick={() => initiateDelete(idx, member)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xoá thành viên"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Task List */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-in slide-in-from-top-1 duration-150">
                        <div className="text-xs font-semibold text-slate-600 mb-2.5">
                          Danh sách task của {member} ({memberTasks.length}):
                        </div>
                        {memberTasks.length === 0 ? (
                          <div className="text-xs text-slate-400 italic py-1">Chưa có task nào được phân công.</div>
                        ) : (
                          <div className="divide-y divide-slate-200/70 border border-slate-200/80 rounded-lg overflow-hidden bg-white text-xs">
                            {memberTasks.map((t) => {
                              const endDate = computeEndDate(t.startDate, t.effort);
                              const color = getTaskColor(t.us);
                              const status = t.status || "TODO";

                              return (
                                <div key={t.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                      style={{ backgroundColor: color }}
                                    />
                                    <span className="font-semibold text-slate-700 truncate">{t.us}</span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${STATUS_BADGES[status]}`}>
                                      {status.replace("_", " ")}
                                    </span>
                                    <span className="text-slate-500 font-medium">{t.effort}d</span>
                                    <span className="text-slate-400 font-mono text-[11px]">
                                      {fmtDisplay(t.startDate)} → {fmtDisplay(endDate)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Reassign / Delete Confirmation Sub-Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-5 w-full max-w-md flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-base">
              <AlertTriangle size={20} /> Xác nhận xoá thành viên
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thành viên <span className="font-bold text-slate-800">&quot;{deleteTarget.name}&quot;</span> đang phụ trách{" "}
              <span className="font-bold text-indigo-600">{deleteTarget.taskCount} tasks</span>. Bạn muốn xử lý các task này như thế nào?
            </p>

            {members.length > 1 && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col gap-2">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <ArrowRightLeft size={13} className="text-indigo-600" /> Chuyển giao các task sang:
                </label>
                <select
                  value={reassignIdx}
                  onChange={(e) => setReassignIdx(e.target.value)}
                  className="border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:border-indigo-500"
                >
                  {members.map((m, i) =>
                    i !== deleteTarget.idx ? (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    ) : null
                  )}
                </select>
                <button
                  onClick={() => confirmDeleteAction("reassign")}
                  className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded py-1.5 text-xs font-semibold transition-colors"
                >
                  Chuyển giao task và Xoá {deleteTarget.name}
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => confirmDeleteAction("delete_all")}
                className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
              >
                Xoá luôn cả {deleteTarget.taskCount} task
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
