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
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-soft-pink shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b-2 border-deep-pink">
            <h2 className="text-lg font-bold text-deep-pink">Menu</h2>
            <button
              onClick={onClose}
              className="text-deep-pink hover:text-bright-pink text-xl"
            >
              ×
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-3">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.action}
                  onClick={() => onAction(item.action)}
                  className="flex items-center gap-2 w-full p-3 bg-white rounded-lg border-2 border-deep-pink text-deep-pink font-bold hover:bg-bright-pink hover:text-soft-pink transition-colors text-sm"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
