import { NextRequest, NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (token) {
    try {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    } catch (error) {
      console.error('Erreur sign-out:', error);
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('session_token');
  return response;
}