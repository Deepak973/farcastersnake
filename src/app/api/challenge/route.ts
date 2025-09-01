import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, challengeId, challenger, challenged, score } = body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db("farcaster-snake");
    const collection = db.collection("challenges");

    switch (action) {
      case "create":
        const newChallengeId = `challenge_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const challenge = {
          id: newChallengeId,
          challenger: {
            fid: challenger.fid,
            username: challenger.username,
            displayName: challenger.displayName,
            pfpUrl: challenger.pfpUrl,
            score: challenger.score || 0,
            submittedAt: challenger.score ? new Date().toISOString() : null,
          },
          challenged: {
            fid: challenged.fid,
            username: challenged.username,
            displayName: challenged.displayName,
            pfpUrl: challenged.pfpUrl,
            score: 0,
            submittedAt: null,
          },
          createdAt: new Date().toISOString(),
          expiresAt: null, // No expiration - challenge ends when both players submit
          status: "active",
        };

        // Store in MongoDB
        await collection.insertOne(challenge);
        console.log(
          "Challenge created and stored in database:",
          newChallengeId
        );
        return NextResponse.json({ challengeId: newChallengeId, challenge });

      case "submit":
        const existingChallenge = await collection.findOne({ id: challengeId });
        if (!existingChallenge) {
          return NextResponse.json(
            { error: "Challenge not found" },
            { status: 404 }
          );
        }

        const now = new Date().toISOString();

        // Check if user has already submitted a score
        const currentUserFid = challenger.fid;
        const hasAlreadySubmitted =
          (existingChallenge.challenger.fid === currentUserFid &&
            existingChallenge.challenger.submittedAt) ||
          (existingChallenge.challenged.fid === currentUserFid &&
            existingChallenge.challenged.submittedAt);

        if (hasAlreadySubmitted) {
          return NextResponse.json(
            { error: "You have already submitted a score for this challenge" },
            { status: 400 }
          );
        }

        // Update the appropriate player's score
        const updateData: any = {};
        if (existingChallenge.challenger.fid === challenger.fid) {
          updateData["challenger.score"] = score;
          updateData["challenger.submittedAt"] = now;
        } else if (existingChallenge.challenged.fid === challenger.fid) {
          updateData["challenged.score"] = score;
          updateData["challenged.submittedAt"] = now;
        }

        // Also update the leaderboard with the challenge score
        try {
          const scoresCollection = db.collection("scores");
          const existingScore = await scoresCollection.findOne({
            $or: [{ fid: challenger.fid }, { username: challenger.username }],
          });

          if (existingScore) {
            // Update existing score if challenge score is higher
            if (score > existingScore.score) {
              await scoresCollection.updateOne(
                {
                  $or: [
                    { fid: challenger.fid },
                    { username: challenger.username },
                  ],
                },
                {
                  $set: {
                    score: score,
                    username: challenger.username,
                    displayName: challenger.displayName,
                    pfpUrl: challenger.pfpUrl,
                    fid: challenger.fid,
                    timestamp: new Date(),
                  },
                }
              );
              console.log(
                `Updated leaderboard score for ${challenger.username} to ${score}`
              );
            }
          } else {
            // Insert new score if user doesn't exist in leaderboard
            await scoresCollection.insertOne({
              score: score,
              username: challenger.username,
              displayName: challenger.displayName,
              pfpUrl: challenger.pfpUrl,
              fid: challenger.fid,
              timestamp: new Date(),
            });
            console.log(
              `Added new leaderboard score for ${challenger.username}: ${score}`
            );
          }
        } catch (leaderboardError) {
          console.error("Error updating leaderboard:", leaderboardError);
          // Continue with challenge update even if leaderboard update fails
        }

        // Check if both players have submitted
        const updatedChallenge = await collection.findOneAndUpdate(
          { id: challengeId },
          { $set: updateData },
          { returnDocument: "after" }
        );

        if (updatedChallenge) {
          const challengeData = updatedChallenge;

          // Check if both players have submitted
          if (
            challengeData.challenger.submittedAt &&
            challengeData.challenged.submittedAt
          ) {
            const winner =
              challengeData.challenger.score > challengeData.challenged.score
                ? "challenger"
                : challengeData.challenged.score >
                  challengeData.challenger.score
                ? "challenged"
                : "tie";

            await collection.updateOne(
              { id: challengeId },
              { $set: { status: "completed", winner } }
            );

            // Get final updated challenge
            const finalChallenge = await collection.findOne({
              id: challengeId,
            });
            return NextResponse.json({ challenge: finalChallenge });
          }

          return NextResponse.json({ challenge: challengeData });
        }

        return NextResponse.json(
          { error: "Failed to update challenge" },
          { status: 500 }
        );

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Challenge API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get("id");
  const fid = searchParams.get("fid");

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("farcaster-snake");
    const collection = db.collection("challenges");

    if (challengeId) {
      const challenge = await collection.findOne({ id: challengeId });
      if (!challenge) {
        return NextResponse.json(
          { error: "Challenge not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ challenge });
    }

    if (fid) {
      // Get all challenges for a specific FID (both as challenger and challenged)
      const userChallenges = await collection
        .find({
          $or: [
            { "challenger.fid": parseInt(fid) },
            { "challenged.fid": parseInt(fid) },
          ],
        })
        .toArray();

      console.log(`Found ${userChallenges.length} challenges for FID ${fid}`);
      return NextResponse.json({ challenges: userChallenges });
    }

    return NextResponse.json(
      { error: "Either challenge ID or FID is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}
