// src/app/auth/reset-password/page.tsx
import { redirect } from 'next/navigation';

export default function ResetPasswordRedirect() {
  // Redirige immédiatement vers la vraie page
  redirect('/auth/update-password');
}