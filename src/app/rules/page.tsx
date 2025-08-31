"use client";
import React from "react";
import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-soft-pink text-center mb-8">
            📖 How to Play
          </h1>

          <div className="bg-soft-pink rounded-2xl p-8 shadow-2xl">
            <div className="space-y-6 text-black">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-deep-pink mb-4">
                  🎮 Farcaster Snake
                </h2>
                <p className="text-lg">
                  Eat your followers, stay hydrated, and don&apos;t forget to
                  poop!
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-deep-pink">
                  <div className="w-12 h-12 bg-deep-pink rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">EAT</h3>
                    <p>
                      Collect your followers to grow and score points. Each
                      follower you eat gives you 1 point!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-deep-pink">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    💧
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">DRINK</h3>
                    <p>
                      After every 2 bites, you must find water. If you
                      don&apos;t drink, you&apos;ll die!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-deep-pink">
                  <div className="w-12 h-12 bg-brown-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    🚽
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">POOP</h3>
                    <p>
                      After every 5 bites, you must find the commode. If you
                      don&apos;t poop, you&apos;ll die!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-deep-pink">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">AVOID</h3>
                    <p>
                      Don&apos;t hit yourself! The snake will die if it collides
                      with its own body.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-deep-pink rounded-xl text-soft-pink">
                <h3 className="font-bold text-xl mb-4 text-center">🎯 Tips</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Plan your route to avoid getting trapped</li>
                  <li>
                    • Keep track of when you need to drink (every 2 bites)
                  </li>
                  <li>• Don&apos;t forget to poop (every 5 bites)</li>
                  <li>• Use arrow keys or touch controls to navigate</li>
                  <li>• Challenge your friends to beat your score!</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 space-x-4">
            <Link
              href="/"
              className="inline-block bg-bright-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-deep-pink transition-colors"
            >
              🎮 Play Game
            </Link>
            <Link
              href="/leaderboard"
              className="inline-block bg-deep-pink text-soft-pink px-6 py-3 rounded-xl font-bold hover:bg-bright-pink transition-colors"
            >
              🏆 Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
