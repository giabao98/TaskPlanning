"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Copy,
  ClipboardPaste,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { type State } from "@/types";
import { fmtDate } from "@/utils/dateUtils";

interface FooterBarProps {
  state: State;
  onLoadState: (newState: State) => void;
}

export default function FooterBar({ state, onLoadState }: FooterBarProps) {
  const t = useTranslations("Footer");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (confirm(t("resetConfirm"))) {
      onLoadState({
        members: [],
        tasks: [],
        _nextId: 1,
        sprintCapacity: 10,
        sessionName: "Sprint Planning",
        holidays: [],
      });
    }
  };

  const exportJSON = () => {
    const json = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(json).then(() => alert(t("copied")));
  };

  const importJSON = () => {
    const raw = prompt(t("pastePrompt"));
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.members) || !Array.isArray(parsed.tasks))
        throw new Error("invalid");
      onLoadState(parsed);
    } catch (_e) {
      alert(t("invalidJson"));
    }
  };

  const exportFile = async () => {
    const json = JSON.stringify(state, null, 2);
    const fileName = state.sessionName
      ? `${state.sessionName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fmtDate(
          new Date()
        )}.json`
      : `sprint-planning-${fmtDate(new Date())}.json`;

    try {
      // @ts-ignore
      if (window.showSaveFilePicker) {
        // @ts-ignore
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: "JSON file",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        return;
      }
    } catch (e: any) {
      if (e.name === "AbortError") return;
    }

    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed.members) || !Array.isArray(parsed.tasks)) {
          alert("JSON missing 'members' or 'tasks' arrays.");
          return;
        }
        onLoadState(parsed);
      } catch (_e) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Metrics for footer summary chip
  const defaultCap = state.sprintCapacity || 10;
  const totalCap =
    state.members.length > 0
      ? state.members.reduce(
          (sum, m) => sum + (state.memberCapacities?.[m] ?? defaultCap),
          0
        )
      : defaultCap;
  const totalPlanned = state.tasks.reduce(
    (sum, t) => sum + (t.effort || 0),
    0
  );
  const plannedPercent =
    totalCap > 0 ? Math.round((totalPlanned / totalCap) * 100) : 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(15,23,42,0.06)]">
      <div className="h-13 sm:h-14 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          <button
            type="button"
            onClick={exportJSON}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-95"
            title={t("copyJson")}
          >
            <Copy size={13} className="text-indigo-600" />
            <span className="hidden sm:inline">{t("copyJson")}</span>
          </button>

          <button
            type="button"
            onClick={importJSON}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-95"
            title={t("pasteJson")}
          >
            <ClipboardPaste size={13} className="text-indigo-600" />
            <span className="hidden sm:inline">{t("pasteJson")}</span>
          </button>

          <button
            type="button"
            onClick={exportFile}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-95"
            title={t("exportFile")}
          >
            <Download size={13} className="text-indigo-600" />
            <span className="hidden sm:inline">{t("exportFile")}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer active:scale-95"
            title={t("importFile")}
          >
            <Upload size={13} className="text-indigo-600" />
            <span className="hidden sm:inline">{t("importFile")}</span>
          </button>
          <input
            type="file"
            accept=".json,.txt"
            className="hidden"
            ref={fileInputRef}
            onChange={loadFile}
          />

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer active:scale-95"
            title={t("reset")}
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">{t("reset")}</span>
          </button>
        </div>

        {/* Right Executive Status Chip */}
        <div className="shrink-0 flex items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
            <Sparkles size={13} className="text-indigo-600" />
            <span>
              {state.tasks.length} tasks • {state.members.length} members •{" "}
              <strong
                className={
                  plannedPercent > 100
                    ? "text-rose-600"
                    : plannedPercent === 100
                    ? "text-amber-600"
                    : "text-indigo-600"
                }
              >
                {plannedPercent}% planned
              </strong>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
