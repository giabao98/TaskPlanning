"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, Filter, X, ChevronDown, ChevronUp, User, Tag, RotateCcw } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);

  // Count active filters
  let activeFilterCount = 0;
  if (searchQuery.trim() !== "") activeFilterCount++;
  if (memberFilter !== "all") activeFilterCount++;
  if (statusFilter !== "all") activeFilterCount++;
  const hasActiveFilters = activeFilterCount > 0;

  const clearFilters = () => {
    onSearchChange("");
    onMemberFilterChange("all");
    onStatusFilterChange("all");
  };

  const selectedMemberName =
    memberFilter !== "all" ? members[parseInt(memberFilter, 10)] : null;

  return (
    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5 sm:p-3 transition-all">
      {/* Top Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center flex-wrap gap-2 flex-1">
          {/* Toggle Filter Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all cursor-pointer shadow-2xs active:scale-[0.98]",
              isOpen || hasActiveFilters
                ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
            )}
            title={isOpen ? t("hideFilter") : t("toggleFilter")}
          >
            <Filter size={13} className={hasActiveFilters ? "text-indigo-600" : "text-slate-500"} />
            <span>{t("toggleFilter")}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {activeFilterCount}
              </span>
            )}
            {isOpen ? (
              <ChevronUp size={13} className="text-slate-400 ml-0.5" />
            ) : (
              <ChevronDown size={13} className="text-slate-400 ml-0.5" />
            )}
          </button>

          {/* Active Filter Chips (visible always when active so user knows why tasks are filtered) */}
          {hasActiveFilters && (
            <div className="flex items-center flex-wrap gap-1.5">
              {searchQuery.trim() !== "" && (
                <span className="inline-flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium shadow-2xs">
                  <Search size={10} className="text-indigo-500" />
                  <span className="max-w-[120px] truncate">&quot;{searchQuery}&quot;</span>
                  <button
                    onClick={() => onSearchChange("")}
                    className="hover:bg-indigo-50 text-indigo-400 hover:text-indigo-700 rounded p-0.5 transition-colors cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {selectedMemberName && (
                <span className="inline-flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium shadow-2xs">
                  <User size={10} className="text-indigo-500" />
                  <span>{selectedMemberName}</span>
                  <button
                    onClick={() => onMemberFilterChange("all")}
                    className="hover:bg-indigo-50 text-indigo-400 hover:text-indigo-700 rounded p-0.5 transition-colors cursor-pointer"
                    title="Bỏ lọc thành viên"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium shadow-2xs">
                  <Tag size={10} className="text-indigo-500" />
                  <span>{statusFilter}</span>
                  <button
                    onClick={() => onStatusFilterChange("all")}
                    className="hover:bg-indigo-50 text-indigo-400 hover:text-indigo-700 rounded p-0.5 transition-colors cursor-pointer"
                    title="Bỏ lọc trạng thái"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}

              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 px-1.5 py-0.5 transition-colors cursor-pointer"
                title={t("clearFilters")}
              >
                <RotateCcw size={10} />
                <span>{t("clearFilters")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Counter Badge */}
        <div className="text-slate-500 text-[11px] font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs shrink-0">
          {hasActiveFilters ? (
            <span className="text-indigo-600 font-semibold">
              {t("showingTasks", { count: filteredCount, total: totalTasks })}
            </span>
          ) : (
            <span>{t("showingTasks", { count: filteredCount, total: totalTasks })}</span>
          )}
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      <div
        className={cn(
          "transition-all duration-200 overflow-hidden",
          isOpen ? "max-h-40 opacity-100 mt-3 pt-3 border-t border-slate-200/70" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex items-center flex-1 min-w-[200px] max-w-[280px]">
            <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-700 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Member filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium shrink-0">
              <User size={12} className="inline mr-1 text-slate-400" />
              PIC:
            </span>
            <select
              value={memberFilter}
              onChange={(e) => onMemberFilterChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-700 cursor-pointer shadow-2xs"
            >
              <option value="all">{t("allMembers")}</option>
              {members.map((m, i) => (
                <option key={i} value={i.toString()}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-medium shrink-0">
              <Tag size={12} className="inline mr-1 text-slate-400" />
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-700 cursor-pointer shadow-2xs"
            >
              <option value="all">{t("allStatus")}</option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
              >
                <X size={12} /> {t("clearFilters")}
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
            >
              {t("hideFilter")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

