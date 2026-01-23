// src/app/[locale]/public/layout.tsx
import Link from "next/link";
import { Toaster } from "sonner";
import { NetworkWatcher } from "../../../components/system/NetworkWatcher";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fond animé spécifique au profil */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 via-blue-900/20 to-indigo-900/10"></div>
      </div>

      <main className="w-full flex-1">
        {children}
        <Toaster richColors position="top-right" />
        <NetworkWatcher />
      </main>

      {/* Footer fixe */}
      <footer className="w-full py-4 text-center text-sm text-gray-400 border-t border-gray-700 mt-auto">
        <Link href="/">
          <span className="hover:text-white cursor-pointer">
            © {new Date().getFullYear()} Luvika — avec <span className="text-red-500"> ♥</span>
          </span>
        </Link>
      </footer>
    </div>
  );
}
