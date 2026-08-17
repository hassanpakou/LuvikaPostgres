import { createServerClient } from '@/src/lib/supabase-shim';

export function createClientForPage() {
  return createServerClient();
}

// ✅ Alias pour Route Handlers
export const createClientForAction = createClientForPage;

// ✅ Helper pour récupérer l'utilisateur
export const auth = {
  async getUser() {
    const supabase = await createClientForPage();
    return supabase.auth.getUser();
  },
};

export { createServerClient };