import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const url = `https://api.neynar.com/v2/farcaster/user/search/?limit=5&q=${encodeURIComponent(
    query
  )}`;
  const options = {
    method: "GET",
    headers: {
      "x-api-key": process.env.NEYNAR_API_KEY || "NEYNAR_API_DOCS",
      "x-neynar-experimental": "false",
    },
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    console.log("data", data);

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    // Extract and format the user search results from the new response structure
    const users =
      data.result?.users?.map((user: any) => ({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        followerCount: user.follower_count,
        followingCount: user.following_count,
      })) || [];

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
