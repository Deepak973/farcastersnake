"use client";
import React, { useEffect, useRef, useState } from "react";
import "./SnakeGame.css";
import { useAccount } from "wagmi";
import { useMiniApp } from "@neynar/react";
import { ShareButton } from "../Share";
import { APP_URL } from "~/lib/constants";
import { useToast } from "../Toast";

import Sidebar from "../Sidebar";
import { LeaderboardComponent } from "./LeaderboardComponent";
import { RulesComponent } from "./RulesComponent";
import { ChallengesComponent } from "./ChallengesComponent";

const BOARD_SIZE = 12;
const INITIAL_SNAKE = [
  { x: 6, y: 6 },
  { x: 5, y: 6 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };

type Cell = { x: number; y: number };

type Follower = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
};

function getRandomCell(occupied: Cell[]): Cell {
  let cell: Cell;
  do {
    cell = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (occupied.some((s) => s.x === cell.x && s.y === cell.y));
  return cell;
}

function getMultipleRandomCells(count: number, occupied: Cell[]): Cell[] {
  const cells: Cell[] = [];
  while (cells.length < count) {
    const cell = getRandomCell([...occupied, ...cells]);
    cells.push(cell);
  }
  return cells;
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface SnakeGameProps {
  onGameOver?: (score: number) => void;
  previousBestScore?: number | null;
}

const SnakeGame: React.FC<SnakeGameProps> = ({
  onGameOver,
  previousBestScore: propPreviousBestScore,
}) => {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [foods, setFoods] = useState<Cell[]>(
    getMultipleRandomCells(1, INITIAL_SNAKE)
  );
  const [water, setWater] = useState<Cell | null>(null);
  const [commode, setCommode] = useState<Cell | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bitesSinceWater, setBitesSinceWater] = useState(0);
  const [bitesSincePoop, setBitesSincePoop] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [currentFollowerIndex, setCurrentFollowerIndex] = useState(0);
  const [eatenMessage, setEatenMessage] = useState<{
    name: string;
    image: string;
  } | null>(null);
  const [previousBestScore, setPreviousBestScore] = useState<number | null>(
    propPreviousBestScore || null
  );
  const [eatenFollowers, setEatenFollowers] = useState<Follower[]>([]);
  const moveRef = useRef(direction);
  const { address } = useAccount();
  const { context } = useMiniApp();
  const { showToast } = useToast();
  const [_isMuted, _setIsMuted] = useState(false);

  // Header Component
  const GameHeader = ({
    title,
    showSidebarButton = true,
  }: {
    title: string;
    showSidebarButton?: boolean;
  }) => (
    <div className="absolute top-0 left-0 right-0 z-20">
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md border-b-2 border-cyan-400/50 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Page Title */}
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-extrabold font-['Orbitron'] tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"
              style={{ textShadow: "0 0 20px rgba(0, 255, 255, 0.5)" }}
            >
              {title}
            </h1>
          </div>

          {/* Sidebar Button */}
          {showSidebarButton && (
            <button
              onClick={() => setShowSidebar(true)}
              className="group relative bg-gradient-to-r from-cyan-500/90 to-purple-600/90 hover:from-cyan-400 hover:to-purple-500 text-white p-3 rounded-xl transition-all duration-300 font-['Orbitron'] tracking-wide uppercase text-sm font-bold overflow-hidden border border-cyan-400/50"
              style={{
                boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
                textShadow: "0 0 8px rgba(255, 255, 255, 0.5)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
              >
                <path
                  d="M3 12H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 18H21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Sound refs
  const biteSound = useRef<HTMLAudioElement | null>(null);
  const drinkSound = useRef<HTMLAudioElement | null>(null);
  const flushSound = useRef<HTMLAudioElement | null>(null);
  const gameOverSound = useRef<HTMLAudioElement | null>(null);

  // Fetch followers and previous best score on component mount
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const fid = context?.user?.fid || "673126";
        const response = await fetch(`/api/followers?fid=${fid}`);
        const data = await response.json();

        if (data.followers && data.followers.length > 0) {
          // Shuffle the followers array to get different sequence each time
          const shuffledFollowers = shuffleArray(data.followers as Follower[]);
          setFollowers(shuffledFollowers);
        }
      } catch (error) {
        console.error("Failed to fetch followers:", error);
        showToast("Failed to load followers", "error");
        // Fallback to default food if API fails
      }
    };

    const fetchPreviousBestScore = async () => {
      // Only fetch from leaderboard if no previousBestScore prop is provided
      if (propPreviousBestScore !== undefined) return;

      if (!context?.user?.fid && !context?.user?.username) return;

      try {
        const params = new URLSearchParams();
        if (context.user.fid) params.append("fid", context.user.fid.toString());
        if (context.user.username)
          params.append("username", context.user.username);

        const response = await fetch(`/api/leaderboard?${params}`);
        const data = await response.json();

        if (data.scores && data.scores.length > 0) {
          setPreviousBestScore(data.scores[0].score);
        }
      } catch (error) {
        console.error("Failed to fetch previous best score:", error);
        showToast("Failed to load your previous score", "error");
      }
    };

    fetchFollowers();
    fetchPreviousBestScore();
  }, [
    context?.user?.fid,
    context?.user?.username,
    propPreviousBestScore,
    showToast,
  ]);

  useEffect(() => {
    // Load sound files
    biteSound.current = new Audio("/sounds/bite.mp3");
    drinkSound.current = new Audio("/sounds/drink.mp3");
    flushSound.current = new Audio("/sounds/flush.mp3");
    gameOverSound.current = new Audio("/sounds/wasted.mp3");
  }, []);

  const playSound = (
    soundRef: React.MutableRefObject<HTMLAudioElement | null>
  ) => {
    if (!_isMuted && soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(console.error);
    }
  };

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  // Call onGameOver only once when game over state changes
  useEffect(() => {
    if (gameOver && onGameOver) {
      onGameOver(score);
    }
  }, [gameOver, onGameOver, score]);

  // Update previousBestScore when prop changes
  useEffect(() => {
    if (propPreviousBestScore !== undefined) {
      setPreviousBestScore(propPreviousBestScore);
    }
  }, [propPreviousBestScore]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;
    const handleKey = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
      }

      if (e.key === "ArrowUp" && moveRef.current.y !== 1)
        setDirection({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && moveRef.current.y !== -1)
        setDirection({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && moveRef.current.x !== 1)
        setDirection({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && moveRef.current.x !== -1)
        setDirection({ x: 1, y: 0 });
    };

    window.addEventListener("keydown", handleKey, { passive: false });
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, gameStarted]);

  useEffect(() => {
    if (gameOver || !gameStarted) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const newHead = {
          x: (prev[0].x + moveRef.current.x + BOARD_SIZE) % BOARD_SIZE,
          y: (prev[0].y + moveRef.current.y + BOARD_SIZE) % BOARD_SIZE,
        };

        if (prev.some((cell) => cell.x === newHead.x && cell.y === newHead.y)) {
          setGameOver(true);
          playSound(gameOverSound);
          return prev;
        }

        const isWater = water && newHead.x === water.x && newHead.y === water.y;
        const isCommode =
          commode && newHead.x === commode.x && newHead.y === commode.y;
        const foodIdx = foods.findIndex(
          (f) => f.x === newHead.x && f.y === newHead.y
        );

        if (isWater) {
          setWater(null);
          setBitesSinceWater(0);
          playSound(drinkSound);
          return [newHead, ...prev.slice(0, -1)];
        }

        if (isCommode) {
          setCommode(null);
          setBitesSincePoop(0);
          playSound(flushSound);
          return [newHead, ...prev.slice(0, -1)];
        }

        if (foodIdx !== -1) {
          if (bitesSinceWater >= 2 || bitesSincePoop >= 5) {
            setGameOver(true);
            playSound(gameOverSound);
            return prev;
          }

          // Show eaten message and track eaten follower
          if (followers.length > 0) {
            const eatenFollower = followers[currentFollowerIndex];
            setEatenMessage({
              name: eatenFollower.displayName || eatenFollower.username,
              image: eatenFollower.pfpUrl,
            });

            // Add to eaten followers list
            setEatenFollowers((prev) => [...prev, eatenFollower]);

            // Clear message after 3 seconds
            setTimeout(() => setEatenMessage(null), 3000);

            // Move to next follower
            setCurrentFollowerIndex((prev) => (prev + 1) % followers.length);
          }

          const newFoods = [...foods];
          newFoods.splice(foodIdx, 1);
          const newFood = getRandomCell([
            ...prev,
            ...newFoods,
            ...(water ? [water] : []),
            ...(commode ? [commode] : []),
          ]);
          newFoods.push(newFood);
          setFoods(newFoods);

          const newBites = bitesSinceWater + 1;
          const newPoopCount = bitesSincePoop + 1;

          setBitesSinceWater(newBites);
          setBitesSincePoop(newPoopCount);
          setScore((s) => s + 2);
          playSound(biteSound);

          if (newBites === 2 && !water) {
            setWater(getRandomCell([...prev, ...newFoods]));
          }

          if (newPoopCount === 5 && !commode) {
            setCommode(getRandomCell([...prev, ...newFoods]));
          }

          return [newHead, ...prev];
        }

        return [newHead, ...prev.slice(0, -1)];
      });
    }, 250);
    return () => clearInterval(interval);
  }, [
    foods,
    water,
    commode,
    bitesSinceWater,
    bitesSincePoop,
    gameOver,
    gameStarted,
    followers,
    currentFollowerIndex,
    playSound,
  ]);

  const submitScore = async (address: string, score: number) => {
    // Only submit if score is higher than previous best or if no previous score exists
    if (previousBestScore !== null && score <= previousBestScore) {
      console.log(
        `Score ${score} not submitted - previous best is ${previousBestScore}`
      );
      setScoreSubmitted(true); // Mark as submitted to prevent auto-submission
      return;
    }

    setScoreSubmitting(true);
    try {
      if (!context?.user?.fid) {
        console.log("No fid found");
        return;
      }
      const res = await fetch("/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address,
          username: context?.user?.username || "anon",
          score,
          profileImage: context?.user?.pfpUrl || "",
          fid: context?.user?.fid || null,
        }),
      });
      const data = await res.json();
      console.log("Score submitted successfully:", data);
      setScoreSubmitted(true);

      // Update previous best score if this is a new high score
      if (previousBestScore === null || score > previousBestScore) {
        setPreviousBestScore(score);
        showToast("New personal best submitted!", "success");
      } else {
        showToast("Score submitted successfully!", "success");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      showToast("Failed to submit score", "error");
    } finally {
      setScoreSubmitting(false);
    }
  };

  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFoods(getMultipleRandomCells(1, INITIAL_SNAKE));
    setWater(null);
    setCommode(null);
    setGameOver(false);
    setScore(0);
    setBitesSinceWater(0);
    setBitesSincePoop(0);
    setScoreSubmitted(false);
    setCurrentFollowerIndex(0);
    setEatenMessage(null);
    setEatenFollowers([]); // Reset eaten followers list

    // Shuffle followers for a new sequence
    if (followers.length > 0) {
      const shuffledFollowers = shuffleArray(followers);
      setFollowers(shuffledFollowers);
    }
  };

  const handleSidebarAction = (action: string) => {
    if (action === "game") {
      setActiveComponent(null);
      // If game is not started, start it
      if (!gameStarted) {
        setGameStarted(true);
      }
    } else {
      setActiveComponent(action);
    }
    setShowSidebar(false);
  };

  const closeComponent = () => {
    setActiveComponent(null);
  };

  const handleStartGame = () => {
    setGameStarted(true);

    // Shuffle followers for a new sequence when starting game
    if (followers.length > 0) {
      const shuffledFollowers = shuffleArray(followers);
      setFollowers(shuffledFollowers);
    }
  };

  // Get current follower for food display
  const getCurrentFollower = () => {
    if (followers.length === 0) return null;
    return followers[currentFollowerIndex];
  };

  // Generate share text with eaten followers
  const generateShareText = () => {
    let shareText = `I just scored ${score} in Farcaster Snake!`;

    if (eatenFollowers.length > 0) {
      const uniqueFollowers = eatenFollowers.filter(
        (follower, index, self) =>
          index === self.findIndex((f) => f.fid === follower.fid)
      );

      if (uniqueFollowers.length === 1) {
        const follower = uniqueFollowers[0];
        shareText += ` I ate @${follower.username}!`;
      } else if (uniqueFollowers.length <= 3) {
        const names = uniqueFollowers.map((f) => `@${f.username}`).join(", ");
        shareText += ` I ate ${names}!`;
      } else {
        const names = uniqueFollowers
          .slice(0, 3)
          .map((f) => `@${f.username}`)
          .join(", ");
        shareText += ` I ate ${names} and ${uniqueFollowers.length - 3} more!`;
      }
    }

    return shareText;
  };

  // If a component is active, show it instead of the game
  if (activeComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

        {/* Header */}
        <GameHeader
          title={
            activeComponent === "leaderboard"
              ? "🏆 LEADERBOARD"
              : activeComponent === "rules"
              ? "RULES"
              : activeComponent === "challenges"
              ? "CHALLENGES"
              : "GAME"
          }
        />

        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onAction={handleSidebarAction}
        />

        {activeComponent === "leaderboard" && (
          <LeaderboardComponent onClose={closeComponent} />
        )}
        {activeComponent === "rules" && (
          <RulesComponent onClose={closeComponent} />
        )}
        {activeComponent === "challenges" && (
          <ChallengesComponent onClose={closeComponent} />
        )}
      </div>
    );
  }

  return (
    <>
      {/* Main Game Container */}
      <div className={`game-container ${gameStarted ? "fullscreen" : ""}`}>
        {/* Show Header + Sidebar when game is NOT started */}
        {!gameStarted && (
          <>
            <Sidebar
              isOpen={showSidebar}
              onClose={() => setShowSidebar(false)}
              onAction={handleSidebarAction}
            />

            {/* Header for main menu */}
            <GameHeader title="" />

            {/* Start Game Button - NOT in popup */}
            <div className="flex flex-col items-center justify-center min-h-[100vh]">
              <img
                src="/logo.png"
                alt="Farcaster"
                className="w-60 h-60 rounded-2xl border-4 border-cyan-400 shadow-lg relative"
                style={{
                  boxShadow:
                    "0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(138, 43, 226, 0.5)",
                  animation: "shineGlow 3s infinite alternate",
                }}
              />

              <button
                onClick={handleStartGame}
                className="group bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 px-12 rounded-2xl font-bold text-2xl hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden transform hover:scale-105"
                style={{
                  boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
                  textShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">START GAME</span>
              </button>
            </div>
          </>
        )}

        {/* Game Over Screen - Show Header + Sidebar + WASTED + Game Over Content (NOT in popup) */}
        {gameOver && (
          <>
            {/* Header for game over */}
            <GameHeader title="GAME OVER" />

            <Sidebar
              isOpen={showSidebar}
              onClose={() => setShowSidebar(false)}
              onAction={handleSidebarAction}
            />

            {/* WASTED Text */}
            <div className="text-center mt-32 mb-8">
              <h1
                className="text-red-400 text-6xl font-bold font-['Orbitron'] tracking-wider uppercase"
                style={{ textShadow: "0 0 25px rgba(239, 68, 68, 0.7)" }}
              >
                💀 WASTED!
              </h1>
            </div>

            {/* Game Over Content - NOT in popup */}
            <div className="max-w-2xl mx-auto px-6">
              <div className="text-center mb-8">
                <p className="text-cyan-200 text-xl mb-3 font-['Rajdhani']">
                  Final Score:{" "}
                  <span
                    className="text-cyan-400 font-bold font-['Orbitron'] tracking-wide"
                    style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.6)" }}
                  >
                    {score}
                  </span>
                </p>
                {previousBestScore !== null && (
                  <div className="text-sm text-cyan-300 mb-3 font-['Rajdhani']">
                    Previous Best: {previousBestScore}
                  </div>
                )}
                {previousBestScore !== null && score > previousBestScore && (
                  <div
                    className="text-green-400 font-bold text-lg mb-3 font-['Rajdhani'] animate-pulse"
                    style={{ textShadow: "0 0 15px rgba(34, 197, 94, 0.6)" }}
                  >
                    🎉 New Personal Best!
                  </div>
                )}
                {previousBestScore !== null && score <= previousBestScore && (
                  <div className="text-cyan-300 text-sm mb-3 font-['Rajdhani']">
                    {score === previousBestScore
                      ? "🏆 Tied your best score!"
                      : "Keep trying to beat your best!"}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                {!scoreSubmitted &&
                  (previousBestScore === null || score > previousBestScore) && (
                    <button
                      className="group w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden transform hover:scale-105"
                      onClick={async () => {
                        await submitScore(address as string, score);
                      }}
                      disabled={scoreSubmitting}
                      style={{
                        boxShadow: "0 0 25px rgba(0, 255, 255, 0.4)",
                        textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative z-10">
                        {scoreSubmitting ? "Submitting..." : "Submit Score"}
                      </span>
                    </button>
                  )}
                <button
                  className="group w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 px-6 rounded-2xl font-bold hover:from-slate-700 hover:to-slate-800 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden transform hover:scale-105"
                  onClick={handleRestart}
                  style={{
                    boxShadow: "0 0 25px rgba(148, 163, 184, 0.4)",
                    textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10">Play Again</span>
                </button>
              </div>

              {scoreSubmitted && (
                <div className="text-center mb-6">
                  <div
                    className="text-green-400 font-bold mb-3 font-['Rajdhani'] text-lg"
                    style={{ textShadow: "0 0 15px rgba(34, 197, 94, 0.6)" }}
                  >
                    {previousBestScore !== null && score > previousBestScore
                      ? "🎉 New personal best submitted to leaderboard!"
                      : "✅ Score processed!"}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <ShareButton
                  buttonText="Share Score"
                  cast={{
                    text: generateShareText(),
                    bestFriends: false,
                    embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
                  }}
                  className="group w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-bold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 font-['Orbitron'] tracking-wide uppercase relative overflow-hidden transform hover:scale-105"
                />
              </div>
            </div>
          </>
        )}

        {/* Game UI - Only show during active gameplay (no header/sidebar) */}
        {gameStarted && !gameOver && (
          <div className="absolute top-4 left-0 w-full px-6">
            {/* Top row: Best (left) + Score (center) */}
            <div className="flex items-center justify-between relative">
              <div
                className="text-cyan-300 font-bold font-['Rajdhani'] text-lg"
                style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
              >
                Best: {previousBestScore}
              </div>
              <div
                className="absolute left-1/2 transform -translate-x-1/2 text-cyan-300 font-bold font-['Rajdhani'] text-lg"
                style={{ textShadow: "0 0 10px rgba(0, 255, 255, 0.5)" }}
              >
                Score: {score}
              </div>
            </div>

            {/* Alerts (below Best on left) */}
            <div className="absolute top-10 left-0 w-fill px-6">
              {bitesSinceWater === 2 && <div className="alert">DRINK</div>}
              {bitesSincePoop === 5 && <div className="alert">POOP</div>}
              {bitesSincePoop !== 5 && bitesSinceWater !== 2 && (
                <div className="alert">EAT</div>
              )}
            </div>
          </div>
        )}

        {/* Game Board - Only show during active gameplay */}
        {gameStarted && !gameOver && (
          <div className="game-board-container">
            {/* Eaten Message */}
            {eatenMessage && (
              <div className="eaten-message">
                <div className="eaten-content">
                  <img
                    src={eatenMessage.image}
                    alt={eatenMessage.name}
                    className="eaten-avatar"
                  />
                  <span className="eaten-text">
                    You ate {eatenMessage.name}!
                  </span>
                </div>
              </div>
            )}

            <div className="game-board">
              <div
                className="board-grid"
                style={{
                  gridTemplateRows: `repeat(${BOARD_SIZE}, 40px)`,
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, 40px)`,
                }}
              >
                {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
                  const x = i % BOARD_SIZE;
                  const y = Math.floor(i / BOARD_SIZE);
                  const isHead = snake[0].x === x && snake[0].y === y;
                  const isBody = snake
                    .slice(1)
                    .some((cell) => cell.x === x && cell.y === y);
                  const isFood = foods.some(
                    (cell) => cell.x === x && cell.y === y
                  );
                  const isWater = water && water.x === x && water.y === y;
                  const isCommode =
                    commode && commode.x === x && commode.y === y;

                  let cellClass = "cell";
                  let content: React.ReactNode = "";

                  if (isHead) {
                    content = (
                      <img
                        src={context?.user?.pfpUrl || "/farcaster.webp"}
                        alt="Head"
                        className="cell-icon"
                      />
                    );
                  } else if (isBody) {
                    cellClass += " snake-body";
                  }

                  if (isFood) {
                    const currentFollower = getCurrentFollower();
                    if (currentFollower && currentFollower.pfpUrl) {
                      content = (
                        <img
                          src={currentFollower.pfpUrl}
                          alt={`${
                            currentFollower.displayName ||
                            currentFollower.username
                          }`}
                          className="cell-icon"
                        />
                      );
                    } else {
                      // Fallback to default food icon
                      content = (
                        <div className="w-6 h-6 bg-deep-pink rounded-full flex items-center justify-center text-white text-xs">
                          👤
                        </div>
                      );
                    }
                  } else if (isWater) {
                    content = (
                      <span className="emoji">
                        <img src="/drop.png" alt="Water" className="w-6 h-6" />
                      </span>
                    );
                  } else if (isCommode) {
                    content = (
                      <span className="emoji">
                        <img
                          src="/comode.png"
                          alt="Commode"
                          className="w-6 h-6"
                        />
                      </span>
                    );
                  }

                  return (
                    <div key={i} className={cellClass}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Touch Controls - Only show during active gameplay */}
        {gameStarted && !gameOver && (
          <div className="touch-controls">
            <button onClick={() => setDirection({ x: 0, y: -1 })}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4L20 12L12 20L4 12L12 4Z" fill="currentColor" />
                <path d="M12 8L16 12L12 16L8 12L12 8Z" fill="white" />
              </svg>
            </button>

            <div className="flex items-center justify-center space-x-10">
              <button onClick={() => setDirection({ x: -1, y: 0 })}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 4L20 12L12 20L4 12L12 4Z" fill="currentColor" />
                  <path d="M8 12L12 8L16 12L12 16L8 12Z" fill="white" />
                </svg>
              </button>
              <button onClick={() => setDirection({ x: 1, y: 0 })}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 4L20 12L12 20L4 12L12 4Z" fill="currentColor" />
                  <path d="M16 12L12 8L8 12L12 16L8 12Z" fill="white" />
                </svg>
              </button>
            </div>

            <button onClick={() => setDirection({ x: 0, y: 1 })}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4L20 12L12 20L4 12L12 4Z" fill="currentColor" />
                <path d="M8 12L12 16L16 12L12 8L8 12Z" fill="white" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SnakeGame;
