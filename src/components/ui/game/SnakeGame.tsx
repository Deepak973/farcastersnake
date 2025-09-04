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
import { FirstTimeRulesPopup } from "./FirstTimeRulesPopup";

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
  const [showFirstTimeRules, setShowFirstTimeRules] = useState(false);

  // Check if user has seen rules before
  useEffect(() => {
    const rulesData = localStorage.getItem("farcasterSnake_rulesSeen");
    if (rulesData) {
      try {
        const { timestamp } = JSON.parse(rulesData);
        const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour in milliseconds

        if (timestamp > oneHourAgo) {
          // Rules seen within the last hour, don't show popup
          return;
        } else {
          // Rules seen more than 1 hour ago, remove old data
          localStorage.removeItem("farcasterSnake_rulesSeen");
        }
      } catch (_error) {
        // Invalid data, remove it
        localStorage.removeItem("farcasterSnake_rulesSeen");
      }
    }

    // Show popup if no valid data or expired
    setShowFirstTimeRules(true);
  }, []);

  const closeFirstTimeRules = () => {
    setShowFirstTimeRules(false);
    // Store timestamp with the rules seen flag
    const rulesData = {
      timestamp: Date.now(),
    };
    localStorage.setItem("farcasterSnake_rulesSeen", JSON.stringify(rulesData));
  };

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
            const creativeMessage = getCreativeEatenMessage(
              eatenFollower.displayName || eatenFollower.username
            );
            setEatenMessage({
              name: creativeMessage,
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
    }, 250); // Slower movement for better control
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

  // Generate creative eaten messages
  const getCreativeEatenMessage = (name: string) => {
    const messages = [
      `Burp! ${name}`,
      `Nom nom ${name}!`,
      `Gulp! ${name} gone!`,
      `Chomp! ${name} digested!`,
      `Slurp! ${name} absorbed!`,
      `Munch! ${name} consumed!`,
      `Crunch! ${name} devoured!`,
      `Gobble! ${name} eaten!`,
      `Swallow! ${name} gone!`,
      `Feast! ${name} absorbed!`,
    ];
    return messages[Math.floor(Math.random() * messages.length)];
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
        shareText += ` ${getCreativeEatenMessage(follower.username)}!`;
      } else if (uniqueFollowers.length <= 3) {
        const names = uniqueFollowers.map((f) => `@${f.username}`).join(", ");
        shareText += ` I feasted on ${names}!`;
      } else {
        const names = uniqueFollowers
          .slice(0, 3)
          .map((f) => `@${f.username}`)
          .join(", ");
        shareText += ` I devoured ${names} and ${
          uniqueFollowers.length - 3
        } more!`;
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
      {/* First Time Rules Popup */}
      {showFirstTimeRules && (
        <FirstTimeRulesPopup onClose={closeFirstTimeRules} />
      )}

      {/* Main Menu Screen - NOT in popup */}
      {!gameStarted && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

          <Sidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            onAction={handleSidebarAction}
          />

          {/* Header for main menu */}
          <GameHeader title="" />

          {/* Enhanced Main Menu */}
          <div className="pt-32 flex flex-col items-center justify-center min-h-screen relative overflow-hidden px-6">
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full opacity-30 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 text-center max-w-4xl mx-auto">
              {/* Game Logo & Title */}
              <div className="mb-12">
                <div className="relative mb-8">
                  {/* Glowing Background Circle */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full blur-3xl scale-150 animate-pulse"></div>

                  {/* Logo Container */}
                  <div className="relative flex justify-center">
                    <img
                      src="/logo.png"
                      alt="Farcaster Snake"
                      className="w-48 h-48 md:w-64 md:h-64 rounded-3xl border-4 border-cyan-400/50 shadow-2xl relative z-10 transition-all duration-500 hover:scale-110 hover:border-cyan-400"
                      style={{
                        boxShadow:
                          "0 0 40px rgba(0, 255, 255, 0.6), 0 0 80px rgba(138, 43, 226, 0.4)",
                        filter: "drop-shadow(0 0 20px rgba(0, 255, 255, 0.8))",
                      }}
                    />

                    {/* Floating Elements Around Logo */}
                    <div
                      className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                      className="absolute -top-4 -right-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-bounce"
                      style={{ animationDelay: "1s" }}
                    ></div>
                    <div
                      className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-pink-400 to-cyan-500 rounded-full animate-bounce"
                      style={{ animationDelay: "1.5s" }}
                    ></div>
                    <div
                      className="absolute -bottom-4 -right-4 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "2s" }}
                    ></div>
                  </div>
                </div>

                {/* Game Title */}
                <h1
                  className="text-4xl md:text-6xl font-extrabold font-['Orbitron'] tracking-wider uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 relative z-10"
                  style={{ textShadow: "0 0 30px rgba(0, 255, 255, 0.8)" }}
                >
                  Farcaster Snake
                </h1>

                {/* Subtitle */}
                <p
                  className="text-lg md:text-xl text-cyan-200 font-['Rajdhani'] mb-8 max-w-2xl mx-auto leading-relaxed"
                  style={{ textShadow: "0 0 15px rgba(0, 255, 255, 0.5)" }}
                >
                  Eat your followers, stay hydrated, and don&apos;t forget to
                  poop! The most chaotic snake game on Farcaster.
                </p>
              </div>

              {/* Game Stats Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
                <div
                  className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/30 rounded-2xl p-6 border border-cyan-400/50 backdrop-blur-sm hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: "0 0 25px rgba(0, 255, 255, 0.2)" }}
                >
                  <div className="text-3xl mb-2">👤</div>
                  <div className="text-cyan-300 font-bold font-['Orbitron'] text-lg mb-1">
                    EAT
                  </div>
                  <div className="text-cyan-200 text-sm font-['Rajdhani']">
                    Followers give you +2 points each
                  </div>
                </div>

                <div
                  className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-6 border border-blue-400/50 backdrop-blur-sm hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: "0 0 25px rgba(59, 130, 246, 0.2)" }}
                >
                  <div className="text-3xl mb-2">💧</div>
                  <div className="text-blue-300 font-bold font-['Orbitron'] text-lg mb-1">
                    DRINK
                  </div>
                  <div className="text-blue-200 text-sm font-['Rajdhani']">
                    Water every 2 bites or die!
                  </div>
                </div>

                <div
                  className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-2xl p-6 border border-purple-400/50 backdrop-blur-sm hover:scale-105 transition-all duration-300"
                  style={{ boxShadow: "0 0 25px rgba(138, 43, 226, 0.2)" }}
                >
                  <div className="text-3xl mb-2">🚽</div>
                  <div className="text-purple-300 font-bold font-['Rajdhani'] text-lg mb-1">
                    POOP
                  </div>
                  <div className="text-purple-200 text-sm font-['Rajdhani']">
                    Bathroom every 5 bites!
                  </div>
                </div>
              </div>

              {/* Start Game Button */}
              <div className="relative">
                {/* Button Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur-xl opacity-75 scale-110 animate-pulse"></div>

                <button
                  onClick={handleStartGame}
                  className="group relative bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-6 px-16 rounded-3xl font-bold text-2xl md:text-3xl hover:from-cyan-400 hover:to-purple-500 transition-all duration-500 font-['Orbitron'] tracking-wide uppercase transform hover:scale-110 hover:shadow-2xl relative z-10 border-2 border-cyan-300/50 overflow-hidden"
                  style={{
                    boxShadow:
                      "0 0 40px rgba(0, 255, 255, 0.6), 0 0 80px rgba(138, 43, 226, 0.4)",
                    textShadow: "0 0 20px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  {/* Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Button Content */}
                  <div className="flex items-center justify-center gap-4 relative z-10">
                    <span>START GAME</span>
                  </div>
                </button>
              </div>

              {/* Footer Info */}
              <div className="mt-12 text-center">
                <p className="text-cyan-300/70 text-sm font-['Rajdhani'] mb-2">
                  Use arrow keys or touch controls to play
                </p>
                <p className="text-cyan-200/50 text-xs font-['Rajdhani']">
                  Challenge your friends and climb the leaderboard!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen - Show Header + Sidebar + WASTED + Game Over Content (NOT in popup) */}
      {gameOver && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

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
          <div className="max-w-2xl mx-auto px-6 pb-8">
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
        </div>
      )}

      {/* Game UI - Only show during active gameplay (no header/sidebar) */}
      {gameStarted && !gameOver && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-purple-900/10 to-pink-900/10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(138,43,226,0.1)_0%,transparent_50%)]"></div>

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
          </div>

          {/* Game Board - Only show during active gameplay */}
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
                  <span className="eaten-text">{eatenMessage.name}</span>
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

                  // Use smooth position for head, actual snake array for body
                  const isHead =
                    Math.floor(snake[0].x) === x &&
                    Math.floor(snake[0].y) === y;
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
                      <div className="relative group">
                        {/* Glowing background effect for head */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg opacity-70 blur-sm scale-110 animate-pulse"></div>

                        {/* Head container with gaming frame */}
                        <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-1 border-2 border-cyan-400 shadow-lg">
                          <img
                            src={context?.user?.pfpUrl || "/farcaster.webp"}
                            alt="Snake Head"
                            className="w-full h-full rounded-md object-cover"
                            style={{
                              boxShadow: "0 0 15px rgba(0, 255, 255, 0.7)",
                              filter:
                                "drop-shadow(0 0 8px rgba(138, 43, 226, 0.8))",
                            }}
                          />
                        </div>

                        {/* Crown indicator for head */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce opacity-90 flex items-center justify-center">
                          <span className="text-xs">👑</span>
                        </div>
                      </div>
                    );
                  } else if (isBody) {
                    cellClass += " snake-body";
                    // Add creative body content based on eaten followers
                    const bodyIndex =
                      snake.findIndex((cell) => cell.x === x && cell.y === y) -
                      1;
                    if (bodyIndex < eatenFollowers.length) {
                      const eatenFollower = eatenFollowers[bodyIndex];
                      content = (
                        <div className="relative group">
                          {/* Subtle glowing background for body */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/30 to-purple-500/30 rounded-md opacity-40 blur-sm scale-105"></div>

                          {/* Body segment with eaten follower */}
                          <div className="relative z-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-md p-0.5 border border-cyan-400/30 shadow-md">
                            <img
                              src={eatenFollower.pfpUrl}
                              alt={`${
                                eatenFollower.displayName ||
                                eatenFollower.username
                              }`}
                              className="w-full h-full rounded-sm object-cover"
                              style={{
                                boxShadow: "0 0 5px rgba(0, 255, 255, 0.3)",
                                filter:
                                  "drop-shadow(0 0 3px rgba(138, 43, 226, 0.4))",
                              }}
                            />
                          </div>

                          {/* Small indicator dot */}
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-60"></div>
                        </div>
                      );
                    }
                  }

                  if (isFood) {
                    const currentFollower = getCurrentFollower();
                    if (currentFollower && currentFollower.pfpUrl) {
                      content = (
                        <div className="relative group">
                          {/* Glowing background effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg opacity-60 blur-sm scale-110 animate-pulse"></div>

                          {/* Profile image with gaming frame */}
                          <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-1 border border-cyan-400/50 shadow-lg">
                            <img
                              src={currentFollower.pfpUrl}
                              alt={`${
                                currentFollower.displayName ||
                                currentFollower.username
                              }`}
                              className="w-full h-full rounded-md object-cover"
                              style={{
                                boxShadow: "0 0 10px rgba(0, 255, 255, 0.5)",
                                filter:
                                  "drop-shadow(0 0 5px rgba(138, 43, 226, 0.6))",
                              }}
                            />
                          </div>

                          {/* Floating indicator */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full animate-pulse opacity-80"></div>
                        </div>
                      );
                    } else {
                      // Fallback to enhanced default food icon
                      content = (
                        <div className="relative group">
                          {/* Glowing background */}
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-lg opacity-60 blur-sm scale-110 animate-pulse"></div>

                          {/* Enhanced default icon */}
                          <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-2 border border-pink-400/50 shadow-lg flex items-center justify-center">
                            <div className="text-lg font-bold text-white animate-bounce">
                              👤
                            </div>
                          </div>

                          {/* Floating indicator */}
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse opacity-80"></div>
                        </div>
                      );
                    }
                  } else if (isWater) {
                    content = (
                      <div className="relative group">
                        {/* Glowing background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg opacity-60 blur-sm scale-110 animate-pulse"></div>

                        {/* Water drop with gaming frame */}
                        <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-1 border border-blue-400/50 shadow-lg">
                          <img
                            src="/drop.png"
                            alt="Water"
                            className="w-full h-full rounded-md object-contain"
                            style={{
                              boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                              filter:
                                "drop-shadow(0 0 5px rgba(0, 255, 255, 0.6))",
                            }}
                          />
                        </div>

                        {/* Floating indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-pulse opacity-80"></div>
                      </div>
                    );
                  } else if (isCommode) {
                    content = (
                      <div className="relative group">
                        {/* Glowing background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg opacity-60 blur-sm scale-110 animate-pulse"></div>

                        {/* Commode with gaming frame */}
                        <div className="relative z-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-1 border border-slate-400/50 shadow-lg">
                          <img
                            src="/comode.png"
                            alt="Commode"
                            className="w-full h-full rounded-md object-contain"
                            style={{
                              boxShadow: "0 0 10px rgba(148, 163, 184, 0.5)",
                              filter:
                                "drop-shadow(0 0 5px rgba(75, 85, 99, 0.6))",
                            }}
                          />
                        </div>

                        {/* Floating indicator */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full animate-pulse opacity-80"></div>
                      </div>
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

          {/* Touch Controls - Only show during active gameplay */}
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
        </div>
      )}
    </>
  );
};

export default SnakeGame;
