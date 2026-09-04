"use client";

import { Search, Filter, X } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  memberFilter: string;
  onMemberFilterChange: (m: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  members: string[];
  totalTasks: number;
  filteredCount: number;
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  memberFilter,
  onMemberFilterChange,
  statusFilter,
  onStatusFilterChange,
  members,
  totalTasks,
  filteredCount,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery !== "" || memberFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onMemberFilterChange("all");
    onStatusFilterChange("all");
  };

  return (
    <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search */}
        <div className="relative flex items-center flex-1 max-w-[240px]">
          <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm User Story..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Member filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">PIC:</span>
          <select
            value={memberFilter}
            onChange={(e) => onMemberFilterChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500 text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả Member</option>
            {members.map((m, i) => (
              <option key={i} value={i.toString()}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-indigo-500 text-slate-700 cursor-pointer"
          >
            <option value="all">Tất cả Status</option>
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium ml-1"
          >
            <X size={12} /> Xoá lọc
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="text-slate-400 text-[11px] font-medium">
        Hiển thị <span className="font-bold text-slate-700">{filteredCount}</span> / {totalTasks} tasks
      </div>
    </div>
  );
}
