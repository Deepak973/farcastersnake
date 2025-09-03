"use client";
import React, { useEffect, useState } from "react";

interface LeaderboardEntry {
  address: string;
  username: string;
  score: number;
  profileImage: string;
}

interface LeaderboardComponentProps {
  onClose: () => void;
}

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  onClose,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        console.log("Fetching leaderboard...");
        const response = await fetch("/api/leaderboard");
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Leaderboard data:", data);
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen top-20 bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-white font-['Orbitron'] tracking-wider uppercase">
                TOP EATERS
              </h1>
            </div>
          </div>

          {loading ? (
            <div
              className="text-center text-white py-12 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl p-8 border-2 border-cyan-400/50 backdrop-blur-sm"
              style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)" }}
            >
              <div className="text-2xl text-cyan-400 font-['Rajdhani'] animate-pulse">
                Loading leaderboard...
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div
              className="text-center text-white py-12 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl p-8 border-2 border-cyan-400/50 backdrop-blur-sm"
              style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)" }}
            >
              <div className="text-3xl mb-6 animate-pulse">🏆</div>
              <p className="text-xl font-['Rajdhani'] text-cyan-300 mb-4">
                No scores yet! Be the first to play!
              </p>
              <div className="text-sm text-cyan-200 font-['Rajdhani']">
                Try playing the game to see your score here!
              </div>
            </div>
          ) : (
            <>
              {/* Podium Section - Top 3 Creators */}
              {leaderboard.length >= 3 && (
                <div className="mb-12">
                  <div className="flex items-end justify-center gap-8 relative">
                    {/* 2nd Place (Left) */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div
                          className="w-24 h-24 rounded-full border-4 border-slate-400 overflow-hidden relative"
                          style={{
                            boxShadow: "0 0 30px rgba(156, 163, 175, 0.6)",
                            background:
                              "linear-gradient(135deg, rgba(156, 163, 175, 0.2), rgba(75, 85, 99, 0.2))",
                          }}
                        >
                          <img
                            src={
                              leaderboard[1].profileImage || "/farcaster.webp"
                            }
                            alt={leaderboard[1].username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Rank Badge */}
                        <div
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-sm border-2 border-white"
                          style={{
                            boxShadow: "0 0 15px rgba(156, 163, 175, 0.8)",
                          }}
                        >
                          2
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold font-['Rajdhani'] text-lg truncate max-w-24">
                          {leaderboard[1].username}
                        </div>
                        <div className="text-cyan-300 font-bold font-['Rajdhani'] text-xl">
                          {leaderboard[1].score}
                        </div>
                      </div>
                    </div>

                    {/* 1st Place (Center - Larger) */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div
                          className="w-32 h-32 rounded-full border-4 border-cyan-400 overflow-hidden relative"
                          style={{
                            boxShadow: "0 0 40px rgba(0, 255, 255, 0.8)",
                            background:
                              "linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(138, 43, 226, 0.2))",
                          }}
                        >
                          <img
                            src={
                              leaderboard[0].profileImage || "/farcaster.webp"
                            }
                            alt={leaderboard[0].username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Rank Badge */}
                        <div
                          className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-white font-bold text-lg border-2 border-white"
                          style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 1)" }}
                        >
                          1
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold font-['Rajdhani'] text-xl truncate max-w-32">
                          {leaderboard[0].username}
                        </div>
                        <div className="text-cyan-300 font-bold font-['Rajdhani'] text-2xl">
                          {leaderboard[0].score}
                        </div>
                      </div>
                    </div>

                    {/* 3rd Place (Right) */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        <div
                          className="w-24 h-24 rounded-full border-4 border-purple-400 overflow-hidden relative"
                          style={{
                            boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)",
                            background:
                              "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))",
                          }}
                        >
                          <img
                            src={
                              leaderboard[2].profileImage || "/farcaster.webp"
                            }
                            alt={leaderboard[2].username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Rank Badge */}
                        <div
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-sm border-2 border-white"
                          style={{
                            boxShadow: "0 0 15px rgba(168, 85, 247, 0.8)",
                          }}
                        >
                          3
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold font-['Rajdhani'] text-lg truncate max-w-24">
                          {leaderboard[2].username}
                        </div>
                        <div className="text-cyan-300 font-bold font-['Rajdhani'] text-xl">
                          {leaderboard[2].score}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard List - Ranks 4+ */}
              {leaderboard.length > 3 && (
                <div
                  className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-sm p-6"
                  style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.2)" }}
                >
                  <div className="space-y-4">
                    {leaderboard.slice(3).map((entry, index) => (
                      <div
                        key={`${entry.username}-${entry.score}-${index + 3}`}
                        className="group flex items-center p-4 rounded-xl bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/60 hover:to-slate-500/60 transition-all duration-300 hover:scale-[1.02] border border-slate-500/30"
                      >
                        {/* Rank Number */}
                        <div
                          className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-4 flex-shrink-0"
                          style={{
                            boxShadow: "0 0 15px rgba(0, 255, 255, 0.4)",
                          }}
                        >
                          {index + 4}
                        </div>

                        {/* Profile Image */}
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-4 flex-shrink-0 border-2 border-cyan-400/50">
                          <img
                            src={entry.profileImage || "/farcaster.webp"}
                            alt={entry.username}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Username */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold font-['Rajdhani'] truncate">
                            {entry.username}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-cyan-300 font-bold font-['Rajdhani'] text-lg flex-shrink-0">
                          {entry.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Back Button */}
        </div>
      </div>
    </div>
  );
};
