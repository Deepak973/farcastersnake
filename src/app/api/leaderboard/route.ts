// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { withCors } from "~/lib/cors";

const client = new MongoClient(process.env.MONGODB_URI!);

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");
  const username = searchParams.get("username");

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("farcaster-snake");
    console.log("Using database: farcaster-snake");

    if (fid || username) {
      // Get scores for a specific FID or username
      let query = {};
      if (fid) {
        query = { $or: [{ fid: parseInt(fid) }, { username: username || "" }] };
      } else if (username) {
        query = { username: username };
      }

      const scores = await db
        .collection("scores")
        .find(query)
        .sort({ score: -1 })
        .toArray();

      console.log(
        `Found scores for ${fid ? "FID " + fid : "username " + username}:`,
        scores.length
      );
      return NextResponse.json({ scores });
    } else {
      // Get top 10 scores for leaderboard
      const scores = await db
        .collection("scores")
        .find()
        .sort({ score: -1 })
        .toArray();

      console.log("Found scores:", scores.length);
      return NextResponse.json({ leaderboard: scores });
    }
  } catch (e) {
    console.error("Leaderboard API error:", e);
    return NextResponse.json(
      { leaderboard: [], error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

export const GET = withCors(handler);
