"use client";
import React, { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import Challenge from "../Challenge";
import { ShareButton } from "../Share";
import { APP_URL } from "~/lib/constants";
import { useToast } from "../Toast";

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

interface ChallengesComponentProps {
  onClose: () => void;
}

export const ChallengesComponent: React.FC<ChallengesComponentProps> = ({
  onClose,
}) => {
  const [activeChallenges, setActiveChallenges] = useState<ChallengeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const { context } = useMiniApp();
  const { showToast } = useToast();

  // Generate challenge share text
  const generateChallengeShareText = (challenge: ChallengeData) => {
    const currentUser = context?.user;
    const isCurrentUserChallenger =
      challenge.challenger.fid === currentUser?.fid;

    if (isCurrentUserChallenger) {
      // Current user is the challenger, tag the challenged person
      return `⚔️ I challenged @${challenge.challenged.username} to a Farcaster Snake duel! Let's see who gets the highest score! 🐍`;
    } else {
      // Current user is the challenged person, tag the challenger
      return `⚔️ @${challenge.challenger.username} challenged me to a Farcaster Snake duel! Let's see who wins! 🐍`;
    }
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!context?.user?.fid) return;

      try {
        console.log("Fetching challenges for FID:", context.user.fid);
        const response = await fetch(`/api/challenge?fid=${context.user.fid}`);
        console.log("Challenges response status:", response.status);
        const data = await response.json();
        console.log("Challenges response data:", data);
        setActiveChallenges(data.challenges || []);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [context?.user?.fid, showCreateChallenge]);

  const isChallengeExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
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

  const getLeader = (challenge: ChallengeData) => {
    // Handle cases where scores might be undefined or null
    const challengerScore = challenge.challenger.score || 0;
    const challengedScore = challenge.challenged.score || 0;

    if (challengerScore === 0 && challengedScore === 0) {
      return null;
    }
    if (challengerScore === 0) {
      return challenge.challenged;
    }
    if (challengedScore === 0) {
      return challenge.challenger;
    }
    if (challengerScore > challengedScore) {
      return challenge.challenger;
    }
    if (challengedScore > challengerScore) {
      return challenge.challenged;
    }
    return null; // Tie
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-soft-pink text-center mb-6">
          ⚔️ Challenges
        </h1>

        <div className="text-center mb-4">
          <button
            onClick={() => setShowCreateChallenge(!showCreateChallenge)}
            className="bg-bright-pink text-soft-pink px-4 py-2 rounded-lg font-bold hover:bg-deep-pink transition-colors text-sm"
          >
            {showCreateChallenge ? "❌ Cancel" : "➕ Create Challenge"}
          </button>
        </div>

        {showCreateChallenge && (
          <div className="bg-white rounded-lg p-4 shadow-lg mb-6">
            <Challenge
              isEmbedded={true}
              setShowCreateChallenge={setShowCreateChallenge}
            />
          </div>
        )}

        <div className="bg-white rounded-lg p-4 shadow-lg">
          <h3 className="text-lg font-bold text-deep-pink mb-4 text-center">
            Active Challenges
          </h3>

          {loading ? (
            <div className="text-center text-black py-6">
              <div className="text-sm">Loading challenges...</div>
            </div>
          ) : activeChallenges.length === 0 ? (
            <div className="text-center text-black py-6">
              <div className="text-2xl mb-3">⚔️</div>
              <p className="text-sm text-gray-600">
                No active challenges! Create one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-soft-pink rounded-lg p-4 border-2 border-deep-pink"
                >
                  {/* Challenge Header - Simplified */}
                  <div className="flex items-center justify-between mb-3">
                    {/* Challenger */}
                    <div className="flex items-center gap-2">
                      <img
                        src={challenge.challenger.pfpUrl}
                        alt={challenge.challenger.displayName}
                        className="w-8 h-8 rounded-full border border-deep-pink"
                      />
                      <span className="font-bold text-black text-sm">
                        {challenge.challenger.displayName}
                      </span>
                    </div>

                    {/* VS */}
                    <div className="text-center">
                      <div className="text-lg">⚔️</div>
                    </div>

                    {/* Challenged */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-black text-sm">
                        {challenge.challenged.displayName}
                      </span>
                      <img
                        src={challenge.challenged.pfpUrl}
                        alt={challenge.challenged.displayName}
                        className="w-8 h-8 rounded-full border border-deep-pink"
                      />
                    </div>
                  </div>

                  {/* Scores - Clean Display */}
                  <div className="flex justify-between items-center mb-3 bg-white rounded-lg p-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-deep-pink">
                        {challenge.challenger.score || 0}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-deep-pink">
                        {challenge.challenged.score || 0}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>

                  {/* Status & Time - Simplified */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs text-gray-600">
                      {getChallengeStatus(challenge)}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        isChallengeExpired(challenge.expiresAt)
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatTimeRemaining(challenge.expiresAt)}
                    </div>
                  </div>

                  {/* Action Buttons - Clean */}
                  <div className="flex gap-2">
                    {challenge.status === "active" &&
                      !isChallengeExpired(challenge.expiresAt) && (
                        <>
                          <a
                            href={`/challenge/${challenge.id}`}
                            className="flex-1 bg-bright-pink text-soft-pink py-2 px-3 rounded font-bold text-sm hover:bg-deep-pink transition-colors text-center"
                          >
                            🎮 Play
                          </a>
                          <button
                            onClick={() => {
                              const challengeUrl = `https://farcaster.xyz/miniapps/SmXRQmh2Sp33/farcaster-snake/challenge/${challenge.id}`;
                              navigator.clipboard.writeText(challengeUrl);
                              showToast("Challenge link copied!", "success");
                            }}
                            className="bg-deep-pink text-soft-pink py-2 px-3 rounded font-bold text-sm hover:bg-bright-pink transition-colors"
                          >
                            📋 Copy
                          </button>
                          <ShareButton
                            buttonText="Share"
                            cast={{
                              text: generateChallengeShareText(challenge),
                              bestFriends: true,
                              embeds: [
                                `https://farcaster.xyz/miniapps/SmXRQmh2Sp33/farcaster-snake/challenge/${challenge.id}`,
                              ],
                            }}
                            className="bg-deep-pink text-soft-pink py-2 px-3 rounded font-bold text-sm hover:bg-bright-pink transition-colors"
                          />
                        </>
                      )}
                    {challenge.winner && (
                      <div className="flex-1 text-center text-green-600 font-bold text-sm">
                        🏆 {challenge.winner.displayName} wins!
                      </div>
                    )}
                    {isChallengeExpired(challenge.expiresAt) && (
                      <div className="flex-1 text-center text-red-600 font-bold text-sm">
                        ⏰ Expired
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="inline-block bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-colors"
          >
            🎮 Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
