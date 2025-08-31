"use client";

import React, { useState, useEffect } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";

interface HeaderProps {
  isMuted: boolean;
  onToggleSound: () => void;
  onShowRules: () => void;
  onShowChallenge: () => void;
  onToggleSidebar?: () => void;
}

export function Header({
  isMuted,
  onToggleSound,
  onShowRules,
  onShowChallenge,
  onToggleSidebar,
}: HeaderProps) {
  const { context } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <div className="mt-2 mb-2 mx-2 px-2 py-2 bg-soft-pink rounded-lg flex items-center justify-between border-2 border-deep-pink shadow-lg">
        <div className="flex items-center gap-2">
          <img src="/farcaster.webp" alt="Farcaster" className="w-8 h-8" />
          <span className="text-deep-pink font-bold text-sm hidden sm:block">
            Snake
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="bg-bright-pink text-soft-pink px-2 py-1 rounded-lg font-bold text-xs hover:bg-deep-pink transition-colors"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          <button
            onClick={onToggleSidebar}
            className="bg-bright-pink text-soft-pink px-2 py-1 rounded-lg font-bold text-xs hover:bg-deep-pink transition-colors"
          >
            ☰
          </button>

          {context?.user && (
            <div
              className="cursor-pointer flex-shrink-0"
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
              }}
            >
              {context.user.pfpUrl && (
                <img
                  src={context.user.pfpUrl}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-deep-pink"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {context?.user && isUserDropdownOpen && (
        <div className="absolute top-full right-0 z-50 w-fit mt-1 mx-2 bg-soft-pink rounded-lg shadow-lg border-2 border-deep-pink">
          <div className="p-3 space-y-2 text-right">
            <h3
              className="font-bold text-sm hover:underline cursor-pointer inline-block text-black"
              onClick={() => sdk.actions.viewProfile({ fid: context.user.fid })}
            >
              {context.user.displayName || context.user.username}
            </h3>
            <p className="text-xs text-gray-600">@{context.user.username}</p>
          </div>
        </div>
      )}
    </div>
  );
}
