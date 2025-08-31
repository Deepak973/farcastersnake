"use client";
import React, { useEffect, useState } from "react";
import { useMiniApp } from "@neynar/react";
import Challenge from "../Challenge";

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
            <Challenge isEmbedded={true} />
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
              <div className="text-lg mb-3">⚔️</div>
              <p className="text-sm">
                No active challenges! Create one to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-soft-pink rounded-lg p-4 border-2 border-deep-pink"
                >
                  {/* Challenge Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={challenge.challenger.pfpUrl}
                        alt={challenge.challenger.displayName}
                        className="w-10 h-10 rounded-full border-2 border-deep-pink"
                      />
                      <div>
                        <h4 className="font-bold text-black text-sm">
                          {challenge.challenger.displayName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Score: {challenge.challenger.score || 0}{" "}
                          {!challenge.challenger.score && "(Not played)"}
                        </p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl">⚔️</div>
                      <div className="text-xs text-gray-600 font-bold">VS</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <h4 className="font-bold text-black text-sm">
                          {challenge.challenged.displayName}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Score: {challenge.challenged.score || 0}{" "}
                          {!challenge.challenged.score && "(Not played)"}
                        </p>
                      </div>
                      <img
                        src={challenge.challenged.pfpUrl}
                        alt={challenge.challenged.displayName}
                        className="w-10 h-10 rounded-full border-2 border-deep-pink"
                      />
                    </div>
                  </div>

                  {/* Challenge Details */}
                  <div className="space-y-2 mb-3">
                    {/* Time Remaining */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Time Left:</span>
                      <span
                        className={`text-xs font-bold ${
                          isChallengeExpired(challenge.expiresAt)
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatTimeRemaining(challenge.expiresAt)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Status:</span>
                      <span className="text-xs font-bold text-deep-pink">
                        {getChallengeStatus(challenge)}
                      </span>
                    </div>

                    {/* Leader */}
                    {getLeader(challenge) && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Leader:</span>
                        <div className="flex items-center gap-2">
                          <img
                            src={getLeader(challenge)!.pfpUrl}
                            alt={getLeader(challenge)!.displayName}
                            className="w-4 h-4 rounded-full border border-deep-pink"
                          />
                          <span className="text-xs font-bold text-green-600">
                            {getLeader(challenge)!.displayName} (
                            {getLeader(challenge)!.score} pts)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Tie */}
                    {(challenge.challenger.score || 0) > 0 &&
                      (challenge.challenged.score || 0) > 0 &&
                      (challenge.challenger.score || 0) ===
                        (challenge.challenged.score || 0) && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Result:</span>
                          <span className="text-xs font-bold text-yellow-600">
                            🏆 Tie! ({challenge.challenger.score || 0} pts each)
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Created:{" "}
                      {new Date(challenge.createdAt).toLocaleDateString()}
                    </div>
                    <div className="space-x-2">
                      {challenge.status === "active" &&
                        !isChallengeExpired(challenge.expiresAt) && (
                          <a
                            href={`/challenge/${challenge.id}`}
                            className="inline-block bg-bright-pink text-soft-pink px-3 py-1 rounded font-bold text-xs hover:bg-deep-pink transition-colors"
                          >
                            🎮 Play Challenge
                          </a>
                        )}
                      {challenge.winner && (
                        <div className="text-xs text-green-600 font-bold">
                          🏆 Winner: {challenge.winner.displayName}
                        </div>
                      )}
                      {isChallengeExpired(challenge.expiresAt) && (
                        <div className="text-xs text-red-600 font-bold">
                          ⏰ Challenge Expired
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
