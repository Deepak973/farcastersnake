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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-soft-pink text-center mb-6">
          🏆 Leaderboard
        </h1>

        {loading ? (
          <div className="text-center text-black py-8 bg-deep-pink rounded-lg p-4">
            <div className="text-lg text-soft-pink">Loading leaderboard...</div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center text-black py-8">
            <div className="text-lg mb-3"></div>
            <p className="text-sm">No scores yet! Be the first to play!</p>
            <div className="mt-3 text-xs text-gray-600">
              Try playing the game to see your score here!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={`${entry.username}-${entry.score}-${index}`}
                className={`flex items-center p-4 rounded-xl border-2 ${
                  index === 0
                    ? "bg-yellow-100 border-yellow-400"
                    : index === 1
                    ? "bg-gray-100 border-gray-400"
                    : index === 2
                    ? "bg-orange-100 border-orange-400"
                    : "bg-white border-deep-pink"
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-deep-pink text-soft-pink font-bold text-sm mr-3">
                  {index + 1}
                </div>
                <img
                  src={entry.profileImage || "/farcaster.webp"}
                  alt={entry.username}
                  className="w-8 h-8 rounded-full border-2 border-deep-pink mr-3"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-black text-sm">
                    {entry.username}
                  </h3>
                  <p className="text-gray-600 text-xs">Score: {entry.score}</p>
                </div>
                {index < 3 && (
                  <div className="text-lg">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="inline-block bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-colors"
          >
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
};
