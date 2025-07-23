"use client";

import { useState } from "react";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";

export function Header() {
  const { context } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <div className="mt-4 mb-4 mx-4 px-2 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-between border-[3px] border-double border-primary">
        <div className="text-sm font-light bg-primary text-white px-4 py-2 rounded-lg">
          Eat, Drink, Poop Repeat
        </div>

        {context?.user && (
          <div
            className="cursor-pointer flex-shrink-0 ml-2"
            onClick={() => {
              setIsUserDropdownOpen(!isUserDropdownOpen);
            }}
          >
            {context.user.pfpUrl && (
              <img
                src={context.user.pfpUrl}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary"
              />
            )}
          </div>
        )}
      </div>

      {context?.user && isUserDropdownOpen && (
        <div className="absolute top-full right-0 z-50 w-fit mt-1 mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-3 space-y-2 text-right">
            <h3
              className="font-bold text-sm hover:underline cursor-pointer inline-block"
              onClick={() => sdk.actions.viewProfile({ fid: context.user.fid })}
            >
              {context.user.displayName || context.user.username}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              @{context.user.username}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
