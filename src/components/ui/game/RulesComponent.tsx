"use client";
import React from "react";

interface RulesComponentProps {
  onClose: () => void;
}

export const RulesComponent: React.FC<RulesComponentProps> = ({ onClose }) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-soft-pink rounded-3xl p-6 border-2 border-deep-pink shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <img src="/logo.png" alt="Farcaster Snake" className="w-8 h-8 mr-2" />
          <h1 className="text-3xl font-extrabold text-deep-pink drop-shadow-sm">
            How to Play
          </h1>
        </div>

        {/* Intro */}
        <div className="text-center mb-6">
          <div className="p-4 bg-deep-pink rounded-xl text-soft-pink shadow-md">
            <p className="text-sm font-medium">
              Eat your followers, stay hydrated, and don&apos;t forget to poop!
            </p>
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-4">
          {/* Rule Item */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-md border border-deep-pink hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 bg-deep-pink rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
              👤
            </div>
            <div>
              <h4 className="font-bold text-black mb-1">EAT</h4>
              <p className="text-sm text-gray-700">
                Collect your followers to grow and score points. Each follower
                gives you <strong>+2 point</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-md border border-deep-pink hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/drop.png"
                alt="Drink"
                className="w-6 h-6 object-contain"
              />
            </div>
            <div>
              <h4 className="font-bold text-black mb-1">DRINK</h4>
              <p className="text-sm text-gray-700">
                After every <strong>2 bites</strong>, you must find water. If
                not, you&apos;ll die of thirst!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-md border border-deep-pink hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
              🚽
            </div>
            <div>
              <h4 className="font-bold text-black mb-1">POOP</h4>
              <p className="text-sm text-gray-700">
                After every <strong>5 bites</strong>, you must find a commode or
                your snake will die!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-md border border-deep-pink hover:scale-[1.02] transition-transform">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-lg flex-shrink-0">
              ⚠️
            </div>
            <div>
              <h4 className="font-bold text-black mb-1">AVOID</h4>
              <p className="text-sm text-gray-700">
                Don&apos;t hit yourself — the snake dies if it collides with its
                own body!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
