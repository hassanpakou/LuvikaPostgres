// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/fr'); // 👈 le plus simple et le plus fiable
}