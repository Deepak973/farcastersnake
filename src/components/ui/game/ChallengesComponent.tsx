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
        <div className="text-center text-white py-12">
          <div className="text-4xl mb-6 animate-pulse">
            {activeTab === "active" ? "⚔️" : "🏆"}
          </div>
          <p className="text-xl font-['Rajdhani'] text-cyan-300">
            {activeTab === "active"
              ? "No active challenges! Create one to get started!"
              : "No previous challenges yet!"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-8 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden"
            style={{
              boxShadow: "0 0 30px rgba(0, 255, 255, 0.1)",
            }}
          >
            {/* Glow effect on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
            ></div>

            {/* Players Row */}
            <div className="flex justify-between items-start w-full relative z-10">
              {/* Challenger */}
              <div className="flex flex-col items-center w-1/3 relative">
                <div className="relative">
                  {challenge.winner === "challenger" && (
                    <span
                      className="absolute -top-8 left-2 transform -translate-x-1/2 text-yellow-400 text-4xl z-10 animate-bounce"
                      style={{ textShadow: "0 0 20px rgba(255, 215, 0, 0.8)" }}
                    >
                      👑
                    </span>
                  )}
                  <div className="relative">
                    <img
                      src={challenge.challenger.pfpUrl}
                      alt={challenge.challenger.displayName}
                      className="w-16 h-16 rounded-xl border-2 border-cyan-400 transition-all duration-300 group-hover:scale-110"
                      style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <h3
                  className="font-bold text-white mt-3 font-['Rajdhani'] text-lg"
                  style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                >
                  {challenge.challenger.displayName}
                </h3>
                <p className="text-sm text-cyan-300 font-['Rajdhani']">
                  Score: {challenge.challenger.score ?? "Not played"}
                </p>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center justify-center w-1/3">
                <div className="text-4xl animate-pulse">⚔️</div>
                <div className="text-sm text-cyan-400 font-['Orbitron'] font-bold tracking-wider uppercase">
                  VS
                </div>
              </div>

              {/* Challenged */}
              <div className="flex flex-col items-center w-1/3 relative">
                <div className="relative">
                  {challenge.winner === "challenged" && (
                    <span
                      className="absolute -top-8 left-2 transform -translate-x-1/2 text-yellow-400 text-4xl z-10 animate-bounce"
                      style={{ textShadow: "0 0 20px rgba(255, 215, 0, 0.8)" }}
                    >
                      👑
                    </span>
                  )}
                  <div className="relative">
                    <img
                      src={challenge.challenged.pfpUrl}
                      alt={challenge.challenged.displayName}
                      className="w-16 h-16 rounded-xl border-2 border-cyan-400 transition-all duration-300 group-hover:scale-110"
                      style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <h3
                  className="font-bold text-white mt-3 font-['Rajdhani'] text-lg"
                  style={{ textShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
                >
                  {challenge.challenged.displayName}
                </h3>
                <p className="text-sm text-cyan-300 font-['Rajdhani']">
                  Score: {challenge.challenged.score ?? "Not played"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 text-center">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 text-cyan-300 font-['Rajdhani'] font-semibold rounded-lg border border-cyan-400/30">
                Status: {getChallengeStatus(challenge)}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-6 w-full flex flex-col space-y-4">
              {challenge.status === "active" ? (
                <>
                  <a
                    href={`/challenge/${challenge.id}`}
                    className="group/btn block w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden"
                    style={{
                      boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
                      textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    <span className="relative z-10">Play Challenge</span>
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
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden"
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
                    className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

      <div className="container mx-auto px-4 py-8 pb-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h1
            className="text-3xl font-bold text-center mb-12 font-['Orbitron'] tracking-wider uppercase"
            style={{
              background: "linear-gradient(135deg, #00ffff, #8a2be2, #ff1493)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
            }}
          >
            ⚔️ Challenges
          </h1>

          <div className="text-center mb-12">
            <button
              onClick={() => setShowCreateChallenge(!showCreateChallenge)}
              className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase text-lg relative overflow-hidden"
              style={{
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
                textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">
                {showCreateChallenge ? "❌ Cancel" : "➕ Create Challenge"}
              </span>
            </button>
          </div>

          {showCreateChallenge && (
            <div
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-8 shadow-2xl mb-12 border-2 border-cyan-400/50 backdrop-blur-sm"
              style={{ boxShadow: "0 0 40px rgba(0, 255, 255, 0.2)" }}
            >
              <Challenge
                isEmbedded={true}
                setShowCreateChallenge={setShowCreateChallenge}
              />
            </div>
          )}

          <div
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl p-8 shadow-2xl border-2 border-cyan-400/50 backdrop-blur-sm"
            style={{ boxShadow: "0 0 40px rgba(0, 255, 255, 0.2)" }}
          >
            {/* Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-4 bg-gradient-to-r from-slate-700/80 to-slate-800/80 rounded-2xl p-2 border-2 border-cyan-400/50 backdrop-blur-sm text-sm">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-3 py-3 rounded-xl font-bold transition-all duration-300 font-['Orbitron'] tracking-wide ${
                    activeTab === "active"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                      : "text-cyan-300 hover:text-white hover:bg-slate-600/50"
                  }`}
                  style={
                    activeTab === "active"
                      ? { boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)" }
                      : {}
                  }
                >
                  Active ({activeChallenges.length})
                </button>
                <button
                  onClick={() => setActiveTab("previous")}
                  className={`px-3 py-3 rounded-xl font-bold transition-all duration-300 font-['Orbitron'] tracking-wide ${
                    activeTab === "previous"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg"
                      : "text-cyan-300 hover:text-white hover:bg-slate-600/50"
                  }`}
                  style={
                    activeTab === "previous"
                      ? { boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)" }
                      : {}
                  }
                >
                  Previous ({previousChallenges.length})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="text-center">
              {loading ? (
                <div className="text-center text-white py-12">
                  <div className="text-2xl text-cyan-400 font-['Rajdhani'] animate-pulse">
                    Loading challenges...
                  </div>
                </div>
              ) : (
                renderChallenges(
                  activeTab === "active" ? activeChallenges : previousChallenges
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
