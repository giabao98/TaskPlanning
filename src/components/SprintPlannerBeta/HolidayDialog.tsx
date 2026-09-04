"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Calendar, Plus, Trash2, Sparkles, AlertCircle } from "lucide-react";
import { type Holiday } from "@/types";
import { parseDate } from "@/utils/dateUtils";

interface HolidayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: Holiday[];
  onSaveHolidays: (holidays: Holiday[]) => void;
}

const VN_HOLIDAYS_PRESET: Omit<Holiday, "id">[] = [
  { date: "2026-01-01", name: "Tết Dương Lịch" },
  { date: "2026-02-16", name: "Nghỉ Tết Bính Ngọ (29 Tết)" },
  { date: "2026-02-17", name: "Mùng 1 Tết Bính Ngọ" },
  { date: "2026-02-18", name: "Mùng 2 Tết Bính Ngọ" },
  { date: "2026-02-19", name: "Mùng 3 Tết Bính Ngọ" },
  { date: "2026-02-20", name: "Mùng 4 Tết Bính Ngọ" },
  { date: "2026-04-26", name: "Giỗ Tổ Hùng Vương (10/3 ÂL)" },
  { date: "2026-04-30", name: "Giải Phóng Miền Nam" },
  { date: "2026-05-01", name: "Quốc Tế Lao Động" },
  { date: "2026-09-01", name: "Nghỉ Lễ Quốc Khánh" },
  { date: "2026-09-02", name: "Lễ Quốc Khánh 2/9" },
];

export default function HolidayDialog({
  isOpen,
  onClose,
  holidays,
  onSaveHolidays,
}: HolidayDialogProps) {
  const t = useTranslations("HolidayModal");
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newDate) {
      alert(t("alertChooseDate"));
      return;
    }
    const name = newName.trim() || t("nameLabel");
    // Check duplicate
    if (holidays.some((h) => h.date === newDate)) {
      alert(t("alertDateExists", { date: newDate }));
      return;
    }

    const updated: Holiday[] = [
      ...holidays,
      {
        id: `h-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        date: newDate,
        name,
      },
    ].sort((a, b) => a.date.localeCompare(b.date));

    onSaveHolidays(updated);
    setNewDate("");
    setNewName("");
  };

  const handleDelete = (id: string) => {
    onSaveHolidays(holidays.filter((h) => h.id !== id));
  };

  const handleClearAll = () => {
    if (confirm("Xoá toàn bộ danh sách ngày nghỉ lễ?")) {
      onSaveHolidays([]);
    }
  };

  const handleLoadVNPreset = () => {
    const existingDates = new Set(holidays.map((h) => h.date));
    const toAdd: Holiday[] = VN_HOLIDAYS_PRESET.filter((p) => !existingDates.has(p.date)).map((p) => ({
      ...p,
      id: `h-vn-${p.date}`,
    }));

    if (toAdd.length === 0) {
      alert("Tất cả ngày lễ Việt Nam đã có sẵn trong danh sách.");
      return;
    }

    const merged = [...holidays, ...toAdd].sort((a, b) => a.date.localeCompare(b.date));
    onSaveHolidays(merged);
  };

  const getDayOfWeekName = (dateStr: string) => {
    const d = parseDate(dateStr);
    const day = d.getDay();
    const map = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    return map[day];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              🏖️
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">{t("title")}</h2>
              <p className="text-xs text-slate-500">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          {/* Add Holiday Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar size={14} className="text-indigo-500" /> {t("addBtn")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-5">
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                />
              </div>
              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder={t("nameLabel")}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  onClick={handleAdd}
                  className="w-full h-full min-h-[34px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  <Plus size={14} /> {t("addBtn")}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Preset */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={handleLoadVNPreset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-500" />
              {t("presetBtn")}
            </button>
            {holidays.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Holiday List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
              <span>Holidays ({holidays.length})</span>
            </div>

            {holidays.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center gap-2 bg-slate-50/50">
                <div className="text-3xl">🗓️</div>
                <div className="text-sm font-medium text-slate-600">{t("empty")}</div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white shadow-xs">
                {holidays.map((h) => {
                  const dayName = getDayOfWeekName(h.date);
                  const isWeekendDay = dayName === "Thứ 7" || dayName === "Chủ Nhật";

                  return (
                    <div
                      key={h.id}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded">
                          {h.date}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            isWeekendDay ? "bg-slate-100 text-slate-400" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {dayName}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{h.name}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
