"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useMiniApp } from "@neynar/react";

interface LeaderboardEntry {
  address: string;
  username: string;
  score: number;
  profileImage: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black flex items-center justify-center">
        <div className="text-soft-pink text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-soft-pink text-center mb-8">
            🏆 Leaderboard
          </h1>

          <div className="bg-soft-pink rounded-2xl p-6 shadow-2xl">
            {leaderboard.length === 0 ? (
              <div className="text-center text-black py-8">
                <div className="text-2xl mb-4">📊</div>
                <p className="text-lg">No scores yet! Be the first to play!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.address}
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
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-deep-pink text-soft-pink font-bold text-lg mr-4">
                      {index + 1}
                    </div>
                    <img
                      src={entry.profileImage || "/farcaster.webp"}
                      alt={entry.username}
                      className="w-12 h-12 rounded-full border-2 border-deep-pink mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-black text-lg">
                        {entry.username}
                      </h3>
                      <p className="text-gray-600">Score: {entry.score}</p>
                    </div>
                    {index < 3 && (
                      <div className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>
                    )}
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
