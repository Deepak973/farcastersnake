"use client";
import React from "react";

interface RulesComponentProps {
  onClose: () => void;
}

export const RulesComponent: React.FC<RulesComponentProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br top-20 from-slate-900 via-slate-800 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/logo.png"
                alt="Farcaster Snake"
                className="w-12 h-12 mr-4 filter drop-shadow-[0_0_20px_rgba(0,255,255,0.6)]"
              />
            </div>

            {/* Intro */}
            <div
              className="inline-block p-6 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-sm"
              style={{ boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)" }}
            >
              <p className="text-lg font-medium text-cyan-200 font-['Rajdhani']">
                Eat your followers, stay hydrated, and don&apos;t forget to
                poop!
              </p>
            </div>
          </div>

          {/* Rules */}
          <div className="space-y-6">
            {/* Rule Item - EAT */}
            <div
              className="group bg-gradient-to-r from-slate-800/90 to-slate-700/90 rounded-2xl p-6 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02]"
              style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.2)" }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
              ></div>

              <div className="flex items-start gap-6 relative z-10">
                <div
                  className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.4)" }}
                >
                  👤
                </div>
                <div className="flex-1">
                  <h4
                    className="font-bold text-cyan-300 mb-3 text-xl font-['Orbitron'] tracking-wide uppercase"
                    style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
                  >
                    EAT
                  </h4>
                  <p className="text-cyan-200 text-base font-['Rajdhani'] leading-relaxed">
                    Collect your followers to grow and score points. Each
                    follower gives you{" "}
                    <strong className="text-white">+2 points</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Rule Item - DRINK */}
            <div
              className="group bg-gradient-to-r from-slate-800/90 to-slate-700/90 rounded-2xl p-6 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02]"
              style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.2)" }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
              ></div>

              <div className="flex items-start gap-6 relative z-10">
                <div
                  className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
                >
                  <img
                    src="/drop.png"
                    alt="Drink"
                    className="w-8 h-8 object-contain filter drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className="font-bold text-cyan-300 mb-3 text-xl font-['Orbitron'] tracking-wide uppercase"
                    style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
                  >
                    DRINK
                  </h4>
                  <p className="text-cyan-200 text-base font-['Rajdhani'] leading-relaxed">
                    After every <strong className="text-white">2 bites</strong>,
                    you must find water. If not, you&apos;ll die of thirst!
                  </p>
                </div>
              </div>
            </div>

            {/* Rule Item - POOP */}
            <div
              className="group bg-gradient-to-r from-slate-800/90 to-slate-700/90 rounded-2xl p-6 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02]"
              style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.2)" }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
              ></div>

              <div className="flex items-start gap-6 relative z-10">
                <div
                  className="w-14 h-14 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 20px rgba(75, 85, 99, 0.4)" }}
                >
                  🚽
                </div>
                <div className="flex-1">
                  <h4
                    className="font-bold text-cyan-300 mb-3 text-xl font-['Orbitron'] tracking-wide uppercase"
                    style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
                  >
                    POOP
                  </h4>
                  <p className="text-cyan-200 text-base font-['Rajdhani'] leading-relaxed">
                    After every <strong className="text-white">5 bites</strong>,
                    you must find a commode or your snake will die!
                  </p>
                </div>
              </div>
            </div>

            {/* Rule Item - AVOID */}
            <div
              className="group bg-gradient-to-r from-slate-800/90 to-slate-700/90 rounded-2xl p-6 border-2 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02]"
              style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.2)" }}
            >
              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: "inset 0 0 30px rgba(0, 255, 255, 0.1)" }}
              ></div>

              <div className="flex items-start gap-6 relative z-10">
                <div
                  className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}
                >
                  ⚠️
                </div>
                <div className="flex-1">
                  <h4
                    className="font-bold text-cyan-300 mb-3 text-xl font-['Orbitron'] tracking-wide uppercase"
                    style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
                  >
                    AVOID
                  </h4>
                  <p className="text-cyan-200 text-base font-['Rajdhani'] leading-relaxed">
                    Don&apos;t hit yourself — the snake dies if it collides with
                    its own body!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={onClose}
              className="group inline-block bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase text-lg relative overflow-hidden"
              style={{
                boxShadow: "0 0 30px rgba(0, 255, 255, 0.4)",
                textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">🎮 Back to Game</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
