// app/api/submitScore/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { withCors } from "~/lib/cors";

const client = new MongoClient(process.env.MONGODB_URI!);

async function handler(req: Request) {
  try {
    const { username, score, address, profileImage, fid } = await req.json();

    if (!username || score == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("farcaster-snake");
    const collection = db.collection("scores");

    const existing = await collection.findOne({ username });

    if (!existing) {
      await collection.insertOne({
        address,
        username,
        score,
        profileImage,
        fid: fid || null,
        timestamp: new Date(),
      });
    } else if (score > existing.score) {
      await collection.updateOne(
        { username },
        {
          $set: {
            score,
            username,
            fid: fid || existing.fid,
            timestamp: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ message: "Score handled!" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const POST = withCors(handler);
