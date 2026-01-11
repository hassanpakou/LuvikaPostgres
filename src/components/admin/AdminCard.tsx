'use client';

export function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      className="
        relative
        w-full sm:w-auto
        bg-slate-900/40
        border border-white/10
        backdrop-blur-xl
        rounded-2xl
        p-4 sm:p-6
        shadow-lg shadow-black/40
        overflow-hidden
        cursor-default
        transition-all duration-300
        hover:shadow-[0_0_20px_rgba(72,187,255,0.5)]
        hover:scale-105
      "
    >
      {/* Glow animé subtil */}
      <div className="
        absolute -top-10 -left-10 w-40 h-40
        bg-cyan-500/10
        rounded-full
        blur-3xl
        animate-pulse-slow
        pointer-events-none
      "></div>

      <p className="text-slate-400 text-xs sm:text-sm">{title}</p>
      <p className="text-xl sm:text-2xl font-semibold text-white mt-2">{value}</p>
    </div>
  );
}
