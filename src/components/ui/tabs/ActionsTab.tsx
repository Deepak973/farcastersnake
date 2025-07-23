"use client";

import dynamic from "next/dynamic";

const SnakeGame = dynamic(() => import("../game/SnakeGame"), { ssr: false });

/**
 * ActionsTab component handles mini app actions like sharing, notifications, and haptic feedback.
 *
 * This component provides the main interaction interface for users to:
 * - Share the mini app with others
 * - Sign in with Farcaster
 * - Send notifications to their account
 * - Trigger haptic feedback
 * - Add the mini app to their client
 * - Copy share URLs
 *
 * The component uses the useMiniApp hook to access Farcaster context and actions.
 * All state is managed locally within this component.
 *
 * @example
 * ```tsx
 * <ActionsTab />
 * ```
 */
export function ActionsTab() {
  // --- Hooks ---

  // --- Render ---
  return (
    <div className="">
      <SnakeGame />
    </div>
  );
}
