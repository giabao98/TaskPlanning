"use client";

import { useRef } from "react";
import { Copy, ClipboardPaste, Download, Upload, RefreshCw } from "lucide-react";
import { type State } from "@/types";
import { fmtDate } from "@/utils/dateUtils";

interface FooterBarProps {
  state: State;
  onLoadState: (newState: State) => void;
}

export default function FooterBar({ state, onLoadState }: FooterBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
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
    navigator.clipboard.writeText(json).then(() => alert("Copied to clipboard!"));
  };

  const importJSON = () => {
    const raw = prompt("Paste JSON:");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.members) || !Array.isArray(parsed.tasks)) throw new Error("invalid");
      onLoadState(parsed);
    } catch (_e) {
      alert("Invalid JSON");
    }
  };

  const exportFile = async () => {
    const json = JSON.stringify(state, null, 2);
    const fileName = state.sessionName 
      ? `${state.sessionName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${fmtDate(new Date())}.json`
      : `sprint-planning-${fmtDate(new Date())}.json`;

    try {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: "JSON file", accept: { "application/json": [".json"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
    } catch (e: any) {
      if (e.name === "AbortError") return;
      const blob = new Blob([json], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  };

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed.members) || !Array.isArray(parsed.tasks)) {
          alert("JSON thiếu trường 'members' hoặc 'tasks'.");
          return;
        }
        onLoadState(parsed);
      } catch (_e) {
        alert("File không phải JSON hợp lệ.");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border-t border-slate-200/60 p-3 px-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={exportJSON}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 py-1.5 px-2.5 sm:px-3 rounded-md transition-colors"
          title="Copy JSON"
        >
          <Copy size={14} /> <span className="hidden sm:inline">Copy JSON</span>
        </button>
        <button
          onClick={importJSON}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 py-1.5 px-2.5 sm:px-3 rounded-md transition-colors"
          title="Paste JSON"
        >
          <ClipboardPaste size={14} /> <span className="hidden sm:inline">Paste JSON</span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-0.5 sm:mx-1 self-center"></div>
        <button
          onClick={exportFile}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-2.5 sm:px-3 rounded-md transition-colors border border-indigo-100/50"
          title="Export File"
        >
          <Download size={14} /> <span className="hidden sm:inline">Export File</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-1.5 px-2.5 sm:px-3 rounded-md transition-colors border border-indigo-100/50"
          title="Load File"
        >
          <Upload size={14} /> <span className="hidden sm:inline">Load File</span>
        </button>
        <input
          type="file"
          accept=".json,.txt"
          className="hidden"
          ref={fileInputRef}
          onChange={loadFile}
        />
        <div className="w-px h-6 bg-slate-200 mx-0.5 sm:mx-1 self-center hidden sm:block"></div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 py-1.5 px-2.5 sm:px-3 rounded-md transition-colors border border-red-100/50"
          title="Reset Data"
        >
          <RefreshCw size={14} /> <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 w-full sm:w-auto text-center">
        <span className="text-indigo-600 font-bold">{state.tasks.length}</span> task(s) ·{" "}
        <span className="text-indigo-600 font-bold">{state.members.length}</span> member(s)
      </div>
    </div>
  );
}
