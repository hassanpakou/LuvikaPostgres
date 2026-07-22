import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Create a supabase server client and provide cookie methods compatible
 * with both older and newer cookie shapes. We assert `as any` when passing
 * to createServerClient to avoid TypeScript overload errors.
 */
async function createSupabaseServer(cookieStoreOrPromise: ReturnType<typeof cookies> | Promise<ReturnType<typeof cookies>>) {
  const cookieStore = await cookieStoreOrPromise;

  const cookieMethods = {
    // legacy methods
    get(name: string) {
      return cookieStore.get(name)?.value;
    },
    set(name: string, value: string, options?: Record<string, any>) {
      // cookieStore.set exists in Next.js server `cookies()`
      try {
        (cookieStore as any).set({ name, value, ...options });
      } catch (e) {
        // best-effort fallback
        console.warn('cookieStore.set not available', e);
      }
    },
    remove(name: string) {
      // best-effort remove: try delete() or expire cookie
      try {
        if ((cookieStore as any).delete) {
          (cookieStore as any).delete(name);
        } else {
          (cookieStore as any).set({ name, value: '', expires: new Date(0) });
        }
      } catch (e) {
        console.warn('cookieStore.delete not available', e);
      }
    },

    // new methods
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
      cookiesToSet.forEach(({ name, value, options }) => {
        try {
          (cookieStore as any).set({ name, value, ...options });
        } catch (e) {
          console.warn('cookieStore.set failed', e);
        }
      });
    },
  };

  // cast to any to satisfy either overload (avoids TypeScript errors)
  return createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: cookieMethods as any,
  });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const profileId = searchParams.get('profile_id'); // optionnel
    const locale = searchParams.get('locale') || 'fr';

    const cookieStore = cookies(); // pass promise or value — helper awaits internally
    const supabase = await createSupabaseServer(cookieStore);

    // try to get user (null if not authenticated)
    const {
      data: { user }
    } = await supabase.auth.getUser();

    let query;
    if (user) {
      const queryProfileId = profileId || user.id;
      query = supabase
        .from('events')
        .select('*')
        .eq('profile_id', queryProfileId)
        .order('starts_at', { ascending: false });

      if (profileId && profileId !== user.id) {
        query = query.eq('is_public', true).eq('status', 'active');
      }
    } else {
      if (profileId) {
        query = supabase
          .from('events')
          .select('*')
          .eq('profile_id', profileId)
          .eq('is_public', true)
          .eq('status', 'active')
          .order('starts_at', { ascending: false });
      } else {
        query = supabase
          .from('events')
          .select('*')
          .eq('is_public', true)
          .eq('status', 'active')
          .order('starts_at', { ascending: false });
      }
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Erreur récupération événements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const eventsWithCount = await Promise.all(
      (events || []).map(async (event: any) => {
        const { count, error: cErr } = await supabase
          .from('event_participants')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('is_checked_in', true);

        if (cErr) {
          console.warn('Erreur count participants pour event', event.id, cErr);
        }

        return {
          ...event,
          name: event.title,
          attendee_count: count || 0,
          qr_code_url: `/${locale}/events/${event.id}/check-in`,
        };
      })
    );

    return NextResponse.json({ events: eventsWithCount });
  } catch (err: any) {
    console.error('Erreur API events GET:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, location, starts_at, ends_at, is_public, max_participants } = data;

    if (!title || !starts_at) {
      return NextResponse.json({ error: 'Titre et date de début requis' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = await createSupabaseServer(cookieStore);

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const defaultEndsAt = ends_at || new Date(new Date(starts_at).getTime() + 2 * 3600000).toISOString();

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        profile_id: user.id,
        title,
        description: description || null,
        location: location || null,
        starts_at,
        ends_at: ends_at || defaultEndsAt,
        is_public: is_public ?? true,
        max_participants: max_participants || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création événement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (err: any) {
    console.error('Erreur API events:', err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}