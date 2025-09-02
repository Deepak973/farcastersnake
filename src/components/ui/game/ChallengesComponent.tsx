"use client";
import React, { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import Challenge from "../Challenge";
import { ShareButton } from "../Share";
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
  winner?: "challenger" | "challenged";
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
  const [previousChallenges, setPreviousChallenges] = useState<ChallengeData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "previous">("active");
  const { context } = useMiniApp();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!context?.user?.fid) return;
      try {
        const response = await fetch(`/api/challenge?fid=${context.user.fid}`);
        const data = await response.json();
        const challenges = data.challenges || [];

        // Separate active and previous challenges
        const active = challenges.filter(
          (challenge: ChallengeData) =>
            challenge.status === "active" ||
            (!challenge.challenger.score && !challenge.challenged.score)
        );
        const previous = challenges.filter(
          (challenge: ChallengeData) =>
            challenge.status === "completed" ||
            (challenge.challenger.score && challenge.challenged.score)
        );

        setActiveChallenges(active);
        setPreviousChallenges(previous);
      } catch (error) {
        console.error("Failed to fetch challenges:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [context?.user?.fid, showCreateChallenge]);

  const getChallengeStatus = (challenge: ChallengeData) => {
    if (challenge.status === "completed") return "Completed";
    if (challenge.challenger.score && challenge.challenged.score)
      return "Completed";
    if (challenge.challenger.score || challenge.challenged.score)
      return "Waiting for opponent";
    return "Active";
  };

  const renderChallenges = (challenges: ChallengeData[]) => {
    if (challenges.length === 0) {
      return (
        <div className="text-center text-black py-8">
          <div className="text-2xl mb-4">
            {activeTab === "active" ? "⚔️" : "🏆"}
          </div>
          <p className="text-lg">
            {activeTab === "active"
              ? "No active challenges! Create one to get started!"
              : "No previous challenges yet!"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-xl p-6 border-2 border-deep-pink flex flex-col items-center text-center"
          >
            {/* Players Row */}
            <div className="flex justify-between items-start w-full">
              {/* Challenger */}
              <div className="flex flex-col items-center w-1/3 relative">
                <div className="relative">
                  {challenge.winner === "challenger" && (
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-yellow-400 text-3xl z-10">
                      👑
                    </span>
                  )}
                  <img
                    src={challenge.challenger.pfpUrl}
                    alt={challenge.challenger.displayName}
                    className="w-14 h-14 rounded-full border-2 border-deep-pink"
                  />
                </div>
                <h3 className="font-bold text-black mt-2">
                  {challenge.challenger.displayName}
                </h3>
                <p className="text-sm text-gray-600">
                  Score: {challenge.challenger.score ?? "Not played"}
                </p>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center w-1/3">
                <div className="text-3xl">⚔️</div>
                <div className="text-xs text-gray-600">VS</div>
              </div>

              {/* Challenged */}
              <div className="flex flex-col items-center w-1/3 relative">
                <div className="relative">
                  {challenge.winner === "challenged" && (
                    <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-yellow-400 text-2xl z-10">
                      👑
                    </span>
                  )}
                  <img
                    src={challenge.challenged.pfpUrl}
                    alt={challenge.challenged.displayName}
                    className="w-14 h-14 rounded-full border-2 border-deep-pink"
                  />
                </div>
                <h3 className="font-bold text-black mt-2">
                  {challenge.challenged.displayName}
                </h3>
                <p className="text-sm text-gray-600">
                  Score: {challenge.challenged.score ?? "Not played"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 text-sm text-gray-700">
              Status: {getChallengeStatus(challenge)}
            </div>

            {/* Actions */}
            <div className="mt-4 w-full flex flex-col space-y-3">
              {challenge.status === "active" ? (
                <>
                  <a
                    href={`/challenge/${challenge.id}`}
                    className="block w-full bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-colors"
                  >
                    Play Challenge
                  </a>

                  {/* Share Active Challenge */}
                  <ShareButton
                    buttonText="Share Challenge"
                    cast={{
                      text: `⚔️ I challenged @${challenge.challenged.username} to a game of Farcaster Snake! 🐍 Watch the challenge here:`,
                      bestFriends: false,
                      embeds: [
                        `https://farcaster.xyz/miniapps/SmXRQmh2Sp33/farcaster-snake/challenge/${challenge.id}`,
                      ],
                    }}
                    className="w-full bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                  />
                </>
              ) : challenge.winner ? (
                <>
                  <ShareButton
                    buttonText="Share Winner"
                    cast={{
                      text: `🏆 @${
                        challenge.winner === "challenger"
                          ? challenge.challenger.username
                          : challenge.challenged.username
                      } won the Farcaster Snake challenge! Score: ${
                        challenge.winner === "challenger"
                          ? challenge.challenger.score
                          : challenge.challenged.score
                      } vs ${
                        challenge.winner === "challenger"
                          ? challenge.challenged.score
                          : challenge.challenger.score
                      } 🐍`,
                      bestFriends: false,
                      embeds: [
                        `https://farcaster.xyz/miniapps/SmXRQmh2Sp33/farcaster-snake/challenge/${challenge.id}`,
                      ],
                    }}
                    className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-colors"
                  />
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
              <Challenge
                isEmbedded={true}
                setShowCreateChallenge={setShowCreateChallenge}
              />
            </div>
          )}

          <div className="bg-soft-pink rounded-2xl p-6 shadow-2xl">
            {/* Tabs */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-1 border-2 border-deep-pink">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    activeTab === "active"
                      ? "bg-bright-pink text-soft-pink"
                      : "text-gray-600 hover:text-deep-pink"
                  }`}
                >
                  Active ({activeChallenges.length})
                </button>
                <button
                  onClick={() => setActiveTab("previous")}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    activeTab === "previous"
                      ? "bg-bright-pink text-soft-pink"
                      : "text-gray-600 hover:text-deep-pink"
                  }`}
                >
                  Previous ({previousChallenges.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="text-center">
              {loading ? (
                <div className="text-center text-black py-8">
                  Loading challenges...
                </div>
              ) : (
                renderChallenges(
                  activeTab === "active" ? activeChallenges : previousChallenges
                )
              )}
            </div>
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
    </div>
  );
};
