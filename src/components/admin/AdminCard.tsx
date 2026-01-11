export function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="
      bg-slate-900/40
      border border-white/10
      backdrop-blur-xl
      rounded-xl p-6
      shadow-lg shadow-black/40
    ">
      <p className="text-slate-400 text-sm">{title}</p>
      <p className="text-2xl font-semibold text-white mt-2">{value}</p>
    </div>
  );
}
