// src/app/api/followers/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// ✅ Type final que vous voulez retourner
type FollowerResponse = {
  id: string;
  username: string | null;
  full_name: string | null;
  plan: string | null;
  avatar_url: string | null;
  followed_at: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get('profile_id');
  if (!profileId) {
    return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  try {
    // 🔹 Récupère les follower_id
    const { data: followsData, error: followsError } = await supabase
      .from('follows')
      .select('created_at, follower_id')
      .eq('followed_id', profileId)
      .order('created_at', { ascending: false });

    if (followsError) throw followsError;

    const followerIds = followsData?.map(f => f.follower_id) || [];

    if (followerIds.length === 0) {
      return NextResponse.json({ followers: [], total: 0 });
    }

    // 🔹 Récupère les profils correspondants
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name, plan, avatar_url')
      .in('id', followerIds);

    if (profilesError) throw profilesError;

    // 🔹 Combine les dates avec les profils
    const followers: FollowerResponse[] = followsData.map(follow => {
      const profile = profilesData?.find(p => p.id === follow.follower_id);
      if (!profile) return null;
      return {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        plan: profile.plan,
        avatar_url: profile.avatar_url,
        followed_at: follow.created_at,
      };
    }).filter(Boolean) as FollowerResponse[];

    return NextResponse.json({
      followers,
      total: followers.length,
    });

  } catch (error: any) {
    console.error('❌ Followers API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
