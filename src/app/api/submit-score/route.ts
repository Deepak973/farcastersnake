// app/api/submitScore/route.ts
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(req: Request) {
  try {
    const { username, score, address, profileImage } = await req.json();

    if (!address || score == null) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await client.connect();
    const db = client.db("farcaster-snake");
    const collection = db.collection("scores");

    const existing = await collection.findOne({ address });

    if (!existing) {
      await collection.insertOne({
        address,
        username,
        score,
        profileImage,
        timestamp: new Date(),
      });
    } else if (score > existing.score) {
      await collection.updateOne(
        { address },
        {
          $set: {
            score,
            username,
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
