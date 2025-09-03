"use client";
import React from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onAction }) => {
  const menuItems = [
    { action: "game", label: " Play Game", icon: "🎮" },
    { action: "leaderboard", label: " Leaderboard", icon: "🏆" },
    { action: "rules", label: " Rules", icon: "📖" },
    { action: "challenges", label: " Challenges", icon: "⚔️" },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-black shadow-2xl transform transition-all duration-300 ease-out z-50 border-l-2 border-cyan-400 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          boxShadow: isOpen
            ? "0 0 50px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1)"
            : "none",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b-2 border-cyan-400 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
            <h2
              className="text-xl font-bold text-cyan-400 font-['Orbitron'] tracking-wider uppercase"
              style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.8)" }}
            >
              Menu
            </h2>
            <button
              onClick={onClose}
              className="text-cyan-400 hover:text-white text-2xl font-bold transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-cyan-400/20"
              style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
            >
              ×
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {menuItems.map((item) => (
                <button
                  key={item.action}
                  onClick={() => onAction(item.action)}
                  className="group flex items-center gap-4 w-full p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-xl border-2 border-cyan-400/50 text-cyan-400 font-bold hover:border-cyan-400 hover:bg-gradient-to-r hover:from-cyan-900/30 hover:to-purple-900/30 transition-all duration-300 text-sm backdrop-blur-sm relative overflow-hidden"
                  style={{
                    boxShadow: "0 0 20px rgba(0, 255, 255, 0.1)",
                    textShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
                  }}
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                  <span className="text-xl relative z-10 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span className="relative z-10 font-['Rajdhani'] tracking-wide">
                    {item.label}
                  </span>

                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: "inset 0 0 20px rgba(0, 255, 255, 0.2)",
                    }}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t-2 border-cyan-400/30 bg-gradient-to-r from-slate-900/50 to-black/50">
            <div className="text-center text-cyan-400/60 text-xs font-['Rajdhani'] tracking-wide">
              Farcaster Snake
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
