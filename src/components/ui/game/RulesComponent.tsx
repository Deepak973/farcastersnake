"use client";
import React from "react";

interface RulesComponentProps {
  onClose: () => void;
}

export const RulesComponent: React.FC<RulesComponentProps> = ({ onClose }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative inline-block mb-6">
          <img
            src="/logo.jpg"
            alt="Farcaster Snake"
            className="absolute left-0 top-1 w-6 h-6"
          />
          <h1 className="text-2xl font-bold text-soft-pink pl-8">
            How to Play
          </h1>
        </div>

        <div className="space-y-4 text-black">
          <div className="text-center mb-4">
            <div className="mt-4 p-4 bg-deep-pink rounded-lg text-soft-pink">
              <p className="text-sm">
                Eat your followers, stay hydrated, and don&apos;t forget to
                poop!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-deep-pink">
              <div className="w-8 h-8 bg-deep-pink rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                👤
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">EAT</h4>
                <p className="text-xs">
                  Collect your followers to grow and score points. Each follower
                  you eat gives you 1 point!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-deep-pink">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                <img
                  src="/drop.png"
                  alt="Drink"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">DRINK</h4>
                <p className="text-xs">
                  After every 2 bites, you must find water. If you don&apos;t
                  drink, you&apos;ll die!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-deep-pink">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                🚽
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">POOP</h4>
                <p className="text-xs">
                  After every 5 bites, you must find the commode. If you
                  don&apos;t poop, you&apos;ll die!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-deep-pink">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                ⚠️
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">AVOID</h4>
                <p className="text-xs">
                  Don&apos;t hit yourself! The snake will die if it collides
                  with its own body.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-deep-pink rounded-lg text-soft-pink">
            <h4 className="font-bold text-sm mb-3 text-center"> Tips</h4>
            <ul className="space-y-1 text-xs">
              <li>• Plan your route to avoid getting trapped</li>
              <li>• Keep track of when you need to drink (every 2 bites)</li>
              <li>• Don&apos;t forget to poop (every 5 bites)</li>
              <li>• Use arrow keys or touch controls to navigate</li>
              <li>• Challenge your friends to beat your score!</li>
            </ul>
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
  );
};
