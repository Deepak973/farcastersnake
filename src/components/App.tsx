"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import SnakeGame from "./ui/game/SnakeGame";

// --- Types ---
export enum Tab {
  Home = "home",
  Actions = "actions",
  Leaderboard = "leaderboard",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 *
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 *
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 *
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 *
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 *
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App(
  { title }: AppProps = { title: "Neynar Starter Kit" }
) {
  // --- Render ---
  return (
    <div>
      <div className="container py-2 pb-20">
        <SnakeGame />
      </div>
    </div>
  );
}
