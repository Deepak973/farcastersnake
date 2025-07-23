import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.NEYNAR_API_KEY;
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Neynar API key is not configured. Please add NEYNAR_API_KEY to your environment variables.",
      },
      { status: 500 }
    );
  }

  if (!fid) {
    return NextResponse.json(
      { error: "FID parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/followers/?fid=${fid}&limit=10`,
      {
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const { users } = await response.json();

    console.log(users);

    // Map the followers to just fid and pfp_url
    const bestFriends = users.map((entry: any) => ({
      fid: entry.user.fid,
      pfp_url: entry.user.pfp_url,
    }));

    return NextResponse.json({ bestFriends });
  } catch (error) {
    console.error("Failed to fetch best friends:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch best friends. Please check your Neynar API key and try again.",
      },
      { status: 500 }
    );
  }
}
