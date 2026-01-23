// src/types/profile.ts
export type PublicProfile = {
  full_name: string | null;
  username: string | null;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  website: string | null;
  city: string | null;
  country: string | null;
  sections_visibility: Record<
    | 'bio'
    | 'contact'
    | 'social'
    | 'portfolio'
    | 'certificates'
    | 'identity'
    | 'professional'
    | 'skills'
    | 'links' // 👈 Ajouté
    | 'location',
    boolean
  >;
  // ... ajoutez les autres champs si besoin
};