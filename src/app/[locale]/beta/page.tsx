import SprintPlannerBeta from "@/components/SprintPlannerBeta";

export default function BetaPage() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="bg-amber-500 text-white text-center py-1 text-xs font-bold uppercase tracking-widest shadow-sm relative z-50">
        Beta Environment - Experimental Features
      </div>
      <SprintPlannerBeta />
    </main>
  );
}
