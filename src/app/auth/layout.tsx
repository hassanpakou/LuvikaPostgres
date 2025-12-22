// src/app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black relative">
      {/* Fond animé */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 animate-float" />
          <div className="absolute top-2/3 right-1/3 w-80 h-80 rounded-full bg-blue-500/5 animate-float" style={{ animationDelay: '1.2s' }} />
        </div>
      </div>

      {children}
    </div>
  );
}