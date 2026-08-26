import SprintPlannerBeta from "@/components/SprintPlannerBeta";

export default function BetaHome() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="bg-amber-500/10 text-amber-600 px-4 py-2 text-center text-sm font-medium border-b border-amber-500/20 flex items-center justify-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        Đây là môi trường BETA để thử nghiệm tính năng mới. Các thay đổi tại đây không ảnh hưởng đến trang chính.
      </div>
      <SprintPlannerBeta />
    </main>
  );
}
