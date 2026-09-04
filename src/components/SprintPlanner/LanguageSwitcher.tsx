"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Globe } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸", short: "EN" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", short: "VI" },
  { code: "ja", label: "日本語", flag: "🇯🇵", short: "JA" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (newLocale: "en" | "vi" | "ja") => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-xs shadow-inner">
      <div className="pl-1.5 pr-1 text-slate-400 flex items-center" title="Language / Ngôn ngữ / 言語">
        <Globe size={13} className="text-indigo-400" />
      </div>
      <div className="flex items-center gap-0.5">
        {LANGUAGES.map((lang) => {
          const isActive = locale === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSwitch(lang.code)}
              className={`px-1.5 sm:px-2 py-0.5 rounded text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
              title={lang.label}
            >
              <span>{lang.flag}</span>
              <span>{lang.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
