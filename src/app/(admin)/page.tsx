// src/app/(admin)/page.tsx
import AdminActions from '@/components/admin/AdminActions';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">💼 Espace Administrateur</h1>
      <p className="text-gray-400 mb-8">
        Gérez les utilisateurs, abonnements, commandes NFC et plus encore.
      </p>
      <AdminActions />
    </div>
  );
}