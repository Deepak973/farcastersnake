import { NextResponse } from "next/server";
import { withCors } from "~/lib/cors";

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid"); // Default FID if none provided

  const url = `https://api.neynar.com/v2/farcaster/followers/?limit=100&fid=${fid}`;
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

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    // Extract and format the followers data
    const followers =
      data.users?.map((user: any) => ({
        fid: user.user.fid,
        username: user.user.username,
        displayName: user.user.display_name,
        pfpUrl: user.user.pfp_url,
      })) || [];

    return NextResponse.json({ followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}

export const GET = withCors(handler);
