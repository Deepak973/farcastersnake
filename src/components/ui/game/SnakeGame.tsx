"use client";
import React, { useEffect, useRef, useState } from "react";
import "./SnakeGame.css";
import { useAccount } from "wagmi";
import { useMiniApp } from "@neynar/react";
import { ShareButton } from "../Share";
import { APP_URL } from "~/lib/constants";

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
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver }) => {
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
  const [showInfoModal, setShowInfoModal] = useState(true);
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
    null
  );
  const [eatenFollowers, setEatenFollowers] = useState<Follower[]>([]);
  const moveRef = useRef(direction);
  const { address } = useAccount();
  const { context } = useMiniApp();
  const [_isMuted, _setIsMuted] = useState(false);

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
        // Fallback to default food if API fails
      }
    };

    const fetchPreviousBestScore = async () => {
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
      }
    };

    fetchFollowers();
    fetchPreviousBestScore();
  }, [context?.user?.fid, context?.user?.username]);

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

          if (onGameOver) {
            onGameOver(score);
          }
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
            // Auto-submit score to leaderboard
            if (onGameOver) {
              onGameOver(score);
            }
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
          setScore((s) => s + 1);
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
      }
    } catch (error) {
      console.error("Error submitting score:", error);
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
        setShowInfoModal(false);
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
    setShowInfoModal(false);

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

    shareText += ` Try it out! @1 @2 @3`;
    return shareText;
  };

  // Info Modal Component
  const InfoModal = ({ onStart }: { onStart: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-soft-pink rounded-2xl p-6 max-w-md mx-auto border-2 border-deep-pink shadow-2xl">
        <h3 className="text-deep-pink text-xl font-bold mb-4 text-center">
          How to Play
        </h3>
        <div className="space-y-3 text-black text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-deep-pink rounded-full flex items-center justify-center text-white text-xs">
              👤
            </div>
            <span>
              <strong>EAT</strong> - Collect your followers to grow and score
              points
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              <img src="/drop.png" alt="Water" className="w-6 h-6" />
            </span>
            <span>
              <strong>DRINK</strong> - Find water after every 2 bites
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚽</span>
            <span>
              <strong>POOP</strong> - Find commode after every 5 bites
            </span>
          </div>
          <div className="flex items-center gap-3">
            <img src="/farcaster.webp" alt="Snake" className="w-6 h-6" />
            <span>
              <strong>AVOID</strong> - Don&apos;t hit yourself!
            </span>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full mt-6 bg-bright-pink text-soft-pink py-3 px-4 rounded-xl font-bold hover:bg-deep-pink transition-colors"
        >
          Let&apos;s Play!
        </button>
      </div>
    </div>
  );

  // Game Over Modal Component
  const GameOverModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-soft-pink rounded-2xl p-6 max-w-lg mx-auto border-2 border-deep-pink shadow-2xl">
        <h3 className="text-deep-pink text-2xl font-bold mb-4 text-center">
          💀 WASTED!
        </h3>
        <div className="text-center mb-6">
          <p className="text-black text-lg mb-2">
            Final Score:{" "}
            <span className="text-bright-pink font-bold">{score}</span>
          </p>
          {previousBestScore !== null && (
            <div className="text-sm text-gray-600 mb-2">
              Previous Best: {previousBestScore}
            </div>
          )}
          {previousBestScore !== null && score > previousBestScore && (
            <div className="text-green-600 font-bold text-sm mb-2">
              🎉 New Personal Best!
            </div>
          )}
          {previousBestScore !== null && score <= previousBestScore && (
            <div className="text-gray-600 text-sm mb-2">
              {score === previousBestScore
                ? "🏆 Tied your best score!"
                : "Keep trying to beat your best!"}
            </div>
          )}
        </div>
        <div className="space-y-3">
          {!scoreSubmitted &&
            (previousBestScore === null || score > previousBestScore) && (
              <button
                className="w-full bg-bright-pink text-soft-pink py-3 px-4 rounded-xl font-bold hover:bg-deep-pink transition-colors"
                onClick={async () => {
                  await submitScore(address as string, score);
                }}
                disabled={scoreSubmitting}
              >
                {scoreSubmitting ? "Submitting..." : "Submit Score"}
              </button>
            )}
          <button
            className="w-full bg-deep-pink text-soft-pink py-3 px-4 rounded-xl font-bold hover:bg-bright-pink transition-colors"
            onClick={handleRestart}
          >
            Play Again
          </button>
        </div>

        {scoreSubmitted && (
          <div className="mt-4 text-center">
            <div className="text-green-600 font-bold mb-3">
              {previousBestScore !== null && score > previousBestScore
                ? "🎉 New personal best submitted to leaderboard!"
                : "✅ Score processed!"}
            </div>
          </div>
        )}

        <div className="mt-4">
          <ShareButton
            buttonText="📤 Share Score"
            cast={{
              text: generateShareText(),
              bestFriends: true,
              embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
            }}
            className="w-full bg-bright-pink text-soft-pink py-3 px-4 rounded-xl font-bold hover:bg-deep-pink transition-colors"
          />
        </div>
      </div>
    </div>
  );

  // If a component is active, show it instead of the game
  if (activeComponent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-deep-pink to-black">
        <Sidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onAction={handleSidebarAction}
        />
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-4 right-4 bg-bright-pink text-soft-pink p-2 rounded-lg hover:bg-deep-pink transition-colors z-10"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
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
    <div className={`game-container ${gameStarted ? "fullscreen" : ""}`}>
      {!gameStarted ? (
        <>
          {showInfoModal && <InfoModal onStart={handleStartGame} />}
          <Sidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            onAction={handleSidebarAction}
          />
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 right-4 bg-bright-pink text-soft-pink p-2 rounded-lg hover:bg-deep-pink transition-colors z-10"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
        </>
      ) : (
        <>
          {gameOver && <GameOverModal />}
          {gameStarted && (
            <div className="absolute top-4 left-0 w-full px-6">
              {/* Top row: Best (left) + Score (center) */}
              <div className="flex items-center justify-between relative">
                <div className="text-soft-pink font-bold">
                  Best: {previousBestScore}
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 text-soft-pink font-bold">
                  Score: {score}
                </div>
              </div>

              {/* Alerts (below Best on left) */}
              <div className="absolute top-10 left-0 w-fill px-6">
                {!gameOver && bitesSinceWater === 2 && (
                  <div className="alert">DRINK</div>
                )}
                {!gameOver && bitesSincePoop === 5 && (
                  <div className="alert">POOP</div>
                )}
                {!gameOver && bitesSincePoop !== 5 && bitesSinceWater !== 2 && (
                  <div className="alert">EAT</div>
                )}
              </div>
            </div>
          )}

          <Sidebar
            isOpen={showSidebar}
            onClose={() => setShowSidebar(false)}
            onAction={handleSidebarAction}
          />
          <button
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 right-4 bg-bright-pink text-soft-pink p-2 rounded-lg hover:bg-deep-pink transition-colors z-10"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
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
        </>
      )}

      {gameStarted && (
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
                <span className="eaten-text">You ate {eatenMessage.name}!</span>
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
                const isCommode = commode && commode.x === x && commode.y === y;

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
                <path d="M16 12L12 8L8 12L12 16L16 12Z" fill="white" />
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
  );
};

export default SnakeGame;
