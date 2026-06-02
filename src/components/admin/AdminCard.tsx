// src/components/admin/AdminCard.tsx
'use client';

export function AdminCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl p-4 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300">
      <p className="text-xs text-gray-400/60 font-light mb-1">{title}</p>
      <p className="text-lg font-semibold text-white/80">{value}</p>
    </div>
  );
}