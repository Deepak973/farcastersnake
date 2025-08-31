"use client";
import React, { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import Link from "next/link";
import Challenge from "../../components/ui/Challenge";

interface ChallengeData {
  id: string;
  challenger: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    score?: number;
    submittedAt?: string;
  };
  challenged: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    score?: number;
    submittedAt?: string;
  };
  status: "active" | "completed";
  winner?: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  };
  createdAt: string;
  expiresAt: string;
}

export default function ChallengesPage() {
  const [activeChallenges, setActiveChallenges] = useState<ChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const { context } = useMiniApp();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!context?.user?.fid) return;

      try {
        const response = await fetch(`/api/challenge?fid=${context.user.fid}`);
        const data = await response.json();
        setActiveChallenges(data.challenges || []);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [context?.user?.fid]);

  const isChallengeExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getChallengeStatus = (challenge: ChallengeData) => {
    if (isChallengeExpired(challenge.expiresAt)) {
      return "Expired";
    }
    if (challenge.status === "completed") {
      return "Completed";
    }
    if (challenge.challenger.score && challenge.challenged.score) {
      return "Completed";
    }
    if (challenge.challenger.score) {
      return "Waiting for opponent";
    }
    return "Active";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black flex items-center justify-center">
        <div className="text-soft-pink text-xl">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-soft-pink text-center mb-8">
            ⚔️ Challenges
          </h1>

          <div className="text-center mb-8">
            <button
              onClick={() => setShowCreateChallenge(!showCreateChallenge)}
              className="bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-colors"
            >
              {showCreateChallenge ? "❌ Cancel" : "➕ Create Challenge"}
            </button>
          </div>

          {showCreateChallenge && (
            <div className="bg-soft-pink rounded-2xl p-6 shadow-2xl mb-8">
              <Challenge isEmbedded={true} />
            </div>
          )}

          <div className="bg-soft-pink rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-deep-pink mb-6 text-center">
              Active Challenges
            </h2>

            {activeChallenges.length === 0 ? (
              <div className="text-center text-black py-8">
                <div className="text-2xl mb-4">⚔️</div>
                <p className="text-lg">
                  No active challenges! Create one to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="bg-white rounded-xl p-4 border-2 border-deep-pink"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={challenge.challenger.pfpUrl}
                          alt={challenge.challenger.displayName}
                          className="w-12 h-12 rounded-full border-2 border-deep-pink"
                        />
                        <div>
                          <h3 className="font-bold text-black">
                            {challenge.challenger.displayName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Score: {challenge.challenger.score || "Not played"}
                          </p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl">⚔️</div>
                        <div className="text-xs text-gray-600">VS</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <h3 className="font-bold text-black">
                            {challenge.challenged.displayName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Score: {challenge.challenged.score || "Not played"}
                          </p>
                        </div>
                        <img
                          src={challenge.challenged.pfpUrl}
                          alt={challenge.challenged.displayName}
                          className="w-12 h-12 rounded-full border-2 border-deep-pink"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Status: {getChallengeStatus(challenge)}
                      </div>
                      <div className="space-x-2">
                        {challenge.status === "active" &&
                          !challenge.challenger.score && (
                            <a
                              href={`/challenge/${challenge.id}`}
                              className="inline-block bg-bright-pink text-soft-pink px-4 py-2 rounded-lg font-bold text-sm hover:bg-deep-pink transition-colors"
                            >
                              🎮 Play Challenge
                            </a>
                          )}
                        {challenge.winner && (
                          <div className="text-sm text-green-600 font-bold">
                            🏆 Winner: {challenge.winner.displayName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-block bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-colors"
            >
              🎮 Play Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
