// app/api/leaderboard/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function GET() {
  try {
    await client.connect();
    const db = client.db("farcaster-snake");

    const scores = await db
      .collection("scores")
      .find()
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json(scores);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
