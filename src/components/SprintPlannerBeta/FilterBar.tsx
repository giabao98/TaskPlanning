"use client";

import { useTranslations } from "next-intl";
import { Search, X, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";

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
  const t = useTranslations("FilterBar");

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    memberFilter !== "all" ||
    statusFilter !== "all";

  const clearFilters = () => {
    onSearchChange("");
    onMemberFilterChange("all");
    onStatusFilterChange("all");
  };

  const STATUS_PILLS = [
    { value: "all", label: "All" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "DONE", label: "Done" },
    { value: "TODO", label: "To Do" },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
      {/* Left Filter Controls */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search input with icon */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-2xs">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="bg-transparent text-slate-800 text-xs px-2 py-0.5 focus:outline-none w-28 sm:w-44 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="text-slate-400 hover:text-slate-600 rounded p-0.5 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status Segmented Filter Pills */}
        <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl">
          {STATUS_PILLS.map((pill) => {
            const isActive = statusFilter === pill.value;
            return (
              <button
                key={pill.value}
                type="button"
                onClick={() => onStatusFilterChange(pill.value)}
                className={cn(
                  "px-2.5 py-1 rounded-lg font-medium text-[11px] transition-all cursor-pointer",
                  isActive
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-300/40"
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="relative">
          <select
            value={memberFilter}
            onChange={(e) => onMemberFilterChange(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-xl appearance-none pr-7 focus:outline-none cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
          >
            <option value="all">All Assignees</option>
            {members.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
          />
        </div>

        {/* Clear Filters Button (When active) */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-medium transition-colors cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Right Task Count Pill */}
      <div className="shrink-0 flex items-center">
        <span className="px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-700 font-mono text-[11px] font-bold">
          {filteredCount} / {totalTasks} Tasks
        </span>
      </div>
    </div>
  );
}
