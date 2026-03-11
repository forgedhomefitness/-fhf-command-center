import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Instagram access token not configured", connected: false },
      { status: 503 }
    );
  }

  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    // Fetch profile and recent media in parallel
    const [profileRes, mediaRes] = await Promise.all([
      fetch(
        `https://graph.instagram.com/me?fields=id,username,followers_count,media_count&access_token=${token}`
      ),
      fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count&limit=5&access_token=${token}`
      ),
    ]);

    if (!profileRes.ok) {
      const status = profileRes.status;
      if (status === 190 || status === 401) {
        throw new Error(
          "Instagram token expired. Refresh at developers.facebook.com."
        );
      }
      throw new Error(`Instagram API error: ${status}`);
    }

    const profile = await profileRes.json();
    const media = mediaRes.ok ? await mediaRes.json() : { data: [] };

    const recentPosts = (media.data || []).map((post) => ({
      id: post.id,
      caption: post.caption?.slice(0, 100) || "",
      type: post.media_type,
      date: post.timestamp,
      likes: post.like_count || 0,
      comments: post.comments_count || 0,
    }));

    const totalEngagement = recentPosts.reduce(
      (sum, p) => sum + p.likes + p.comments,
      0
    );

    return NextResponse.json({
      username: profile.username,
      followers: profile.followers_count || 0,
      mediaCount: profile.media_count || 0,
      recentPosts,
      avgEngagement: recentPosts.length
        ? Math.round(totalEngagement / recentPosts.length)
        : 0,
      lastFetched: new Date().toISOString(),
      connected: true,
    });
  } catch (error) {
    console.error("Instagram API error:", error.message);
    return NextResponse.json(
      { error: error.message, connected: false },
      { status: 500 }
    );
  }
}
