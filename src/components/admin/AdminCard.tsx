export function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="
      bg-slate-900/40
      border border-white/10
      backdrop-blur-xl
      rounded-xl p-4 sm:p-6
      shadow-lg shadow-black/40
      w-full
    ">
      <p className="text-slate-400 text-xs sm:text-sm">{title}</p>
      <p className="text-xl sm:text-2xl font-semibold text-white mt-2">{value}</p>
    </div>
  );
}
