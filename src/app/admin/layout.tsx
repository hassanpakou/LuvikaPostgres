import { AdminHeader } from '@/src/components/admin/AdminHeader';
import { AdminSidebar } from '@/src/components/admin/AdminSidebar';
import { Toaster } from '@/components/ui/toaster';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminHeader />
      <AdminSidebar />

      <main className="pt-20 ml-64 px-6">
        {children}
        <Toaster />
      </main>
    </div>
  );
}
