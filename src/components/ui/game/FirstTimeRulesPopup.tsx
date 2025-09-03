"use client";
import React from "react";

interface FirstTimeRulesPopupProps {
  onClose: () => void;
}

export const FirstTimeRulesPopup: React.FC<FirstTimeRulesPopupProps> = ({
  onClose,
}) => {
  const rules = [
    {
      icon: "👤",
      title: "EAT Followers",
      description: "Collect followers to grow and score +2 points each",
    },
    {
      icon: "💧",
      title: "DRINK Water",
      description: "After 2 bites, find water or die of thirst!",
    },
    {
      icon: "🚽",
      title: "Use Bathroom",
      description: "After 5 bites, find commode or your snake dies!",
    },
    {
      icon: "⚠️",
      title: "AVOID Collisions",
      description: "Don't hit walls or your own body",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-3xl p-6 border-2 border-cyan-400/50 backdrop-blur-sm relative overflow-hidden max-w-md w-full mx-4"
        style={{ boxShadow: "0 0 40px rgba(0, 255, 255, 0.3)" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="Farcaster Snake"
              className="w-12 h-12 mr-3 filter drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
            />
            <h1
              className="text-xl font-extrabold font-['Orbitron'] tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"
              style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.5)" }}
            >
              Welcome to Farcaster Snake!
            </h1>
          </div>
          <p className="text-cyan-200 text-sm font-['Rajdhani']">
            Here&apos;s how to play:
          </p>
        </div>

        {/* Rules List */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="group bg-gradient-to-r from-slate-700/90 to-slate-800/90 rounded-xl p-3 border border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02]"
              style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 15px rgba(0, 255, 255, 0.4)" }}
                >
                  {rule.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-cyan-300 font-bold text-sm font-['Orbitron'] tracking-wide uppercase mb-1"
                    style={{ textShadow: "0 0 8px rgba(0, 255, 255, 0.5)" }}
                  >
                    {rule.title}
                  </h3>
                  <p
                    className="text-slate-200 text-xs font-['Rajdhani'] leading-relaxed"
                    style={{ textShadow: "0 0 4px rgba(255, 255, 255, 0.3)" }}
                  >
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="group relative bg-gradient-to-r from-cyan-500/90 to-purple-600/90 hover:from-cyan-400 hover:to-purple-500 text-white py-3 px-6 rounded-xl transition-all duration-300 font-['Orbitron'] tracking-wide uppercase text-sm font-bold overflow-hidden border border-cyan-400/50 w-full"
            style={{
              boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
              textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10">🎮 Let&apos;s Play!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
