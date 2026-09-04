import SprintPlannerBeta from "@/components/SprintPlannerBeta";
import { getTranslations } from "next-intl/server";

export default async function BetaPage() {
  const t = await getTranslations("Beta");

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="bg-amber-500 text-white text-center py-1 text-xs font-bold uppercase tracking-widest shadow-sm relative z-50">
        {t("banner")}
      </div>
      <SprintPlannerBeta />
    </main>
  );
}

