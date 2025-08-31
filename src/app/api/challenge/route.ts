import { NextResponse } from "next/server";

// In-memory challenge storage (in production, use a proper database)
const challengeStore = new Map<string, any>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, challengeId, challenger, challenged, score } = body;

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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          status: "active",
        };

        challengeStore.set(newChallengeId, challenge);
        return NextResponse.json({ challengeId: newChallengeId, challenge });

      case "submit":
        const existingChallenge = challengeStore.get(challengeId);
        if (!existingChallenge) {
          return NextResponse.json(
            { error: "Challenge not found" },
            { status: 404 }
          );
        }

        const challengeData = existingChallenge;
        const now = new Date().toISOString();

        // Check if challenge is expired
        if (new Date(challengeData.expiresAt) < new Date()) {
          challengeData.status = "expired";
          challengeStore.set(challengeId, challengeData);
          return NextResponse.json(
            { error: "Challenge has expired" },
            { status: 400 }
          );
        }

        // Update the appropriate player's score
        if (challengeData.challenger.fid === challenger.fid) {
          challengeData.challenger.score = score;
          challengeData.challenger.submittedAt = now;
        } else if (challengeData.challenged.fid === challenger.fid) {
          challengeData.challenged.score = score;
          challengeData.challenged.submittedAt = now;
        }

        // Check if both players have submitted
        if (
          challengeData.challenger.submittedAt &&
          challengeData.challenged.submittedAt
        ) {
          challengeData.status = "completed";
          challengeData.winner =
            challengeData.challenger.score > challengeData.challenged.score
              ? "challenger"
              : challengeData.challenged.score > challengeData.challenger.score
              ? "challenged"
              : "tie";
        }

        challengeStore.set(challengeId, challengeData);
        return NextResponse.json({ challenge: challengeData });

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
    if (challengeId) {
      const challenge = challengeStore.get(challengeId);
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
      const userChallenges = Array.from(challengeStore.values()).filter(
        (challenge) =>
          challenge.challenger.fid === fid || challenge.challenged.fid === fid
      );

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
