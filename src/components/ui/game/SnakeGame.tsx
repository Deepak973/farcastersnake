import React, { useEffect, useRef, useState } from "react";
import "./SnakeGame.css";
import { useAccount } from "wagmi";
import { useMiniApp } from "@neynar/react";
import { ShareButton } from "../Share";
import { APP_URL } from "~/lib/constants";

const BOARD_SIZE = 15;
const INITIAL_SNAKE = [
  { x: 7, y: 7 },
  { x: 6, y: 7 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };

type Cell = { x: number; y: number };

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

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Cell[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [foods, setFoods] = useState<Cell[]>(
    getMultipleRandomCells(3, INITIAL_SNAKE)
  );
  const [water, setWater] = useState<Cell | null>(null);
  const [commode, setCommode] = useState<Cell | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bitesSinceWater, setBitesSinceWater] = useState(0);
  const [bitesSincePoop, setBitesSincePoop] = useState(0);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const moveRef = useRef(direction);
  const { address } = useAccount();
  const { context } = useMiniApp();

  useEffect(() => {
    moveRef.current = direction;
  }, [direction]);

  useEffect(() => {
    if (gameOver) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" && moveRef.current.y !== 1)
        setDirection({ x: 0, y: -1 });
      if (e.key === "ArrowDown" && moveRef.current.y !== -1)
        setDirection({ x: 0, y: 1 });
      if (e.key === "ArrowLeft" && moveRef.current.x !== 1)
        setDirection({ x: -1, y: 0 });
      if (e.key === "ArrowRight" && moveRef.current.x !== -1)
        setDirection({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const newHead = {
          x: (prev[0].x + moveRef.current.x + BOARD_SIZE) % BOARD_SIZE,
          y: (prev[0].y + moveRef.current.y + BOARD_SIZE) % BOARD_SIZE,
        };

        if (prev.some((cell) => cell.x === newHead.x && cell.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const isWater = water && newHead.x === water.x && newHead.y === water.y;
        const isCommode =
          commode && newHead.x === commode.x && newHead.y === commode.y;
        const foodIdx = foods.findIndex(
          (f) => f.x === newHead.x && f.y === newHead.y
        );

        // Drink water
        if (isWater) {
          setWater(null);
          setBitesSinceWater(0);
          return [newHead, ...prev.slice(0, -1)];
        }

        // Use commode
        if (isCommode) {
          setCommode(null);
          setBitesSincePoop(0);
          return [newHead, ...prev.slice(0, -1)];
        }

        // Eat food
        if (foodIdx !== -1) {
          if (bitesSinceWater >= 2 || bitesSincePoop >= 5) {
            setGameOver(true);
            return prev;
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

          if (newBites === 2 && !water) {
            setWater(getRandomCell([...prev, ...newFoods]));
          }

          if (newPoopCount === 5 && !commode) {
            setCommode(getRandomCell([...prev, ...newFoods]));
          }

          return [newHead, ...prev];
        }

        // Move normally
        return [newHead, ...prev.slice(0, -1)];
      });
    }, 120);
    return () => clearInterval(interval);
  }, [foods, water, commode, bitesSinceWater, bitesSincePoop, gameOver]);

  const submitScore = async (address: string, score: number) => {
    const res = await fetch("/api/submit-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: "0x0",
        username: context?.user?.username || "anon",
        score,
        profileImage: context?.user?.pfpUrl || "",
      }),
    });

    const data = await res.json();
    console.log(data);
  };
  const handleRestart = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFoods(getMultipleRandomCells(3, INITIAL_SNAKE));
    setWater(null);
    setCommode(null);
    setGameOver(false);
    setScore(0);
    setBitesSinceWater(0);
    setBitesSincePoop(0);
    setScoreSubmitted(false);
  };

  return (
    <div className="game-container">
      <h2 className="game-title">
        <img src="/farcaster.webp" alt="Farcaster" className="title-icon" />
        Farcaster Snake
      </h2>
      <div className="legend">
        <span>
          Eat to grow. Drink 💧 after every 2 bites and poop 🚽 after every 5 or
          it’s game over 💀!
        </span>
      </div>

      {/* Reserved space for alerts */}
      <div className="alerts-container">
        {!gameOver && bitesSinceWater === 2 && (
          <div className="alert">💧 Water Time! Drink now!</div>
        )}
        {!gameOver && bitesSincePoop === 5 && (
          <div className="alert">🚽 Poop Time! Find a commode!</div>
        )}
        {!gameOver && bitesSincePoop !== 5 && bitesSinceWater !== 2 && (
          <div className="alert"> Eat Now! Find your next bite!</div>
        )}
      </div>

      <div className="game-board">
        <div
          className="board-grid"
          style={{
            gridTemplateRows: `repeat(${BOARD_SIZE}, 24px)`,
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 24px)`,
          }}
        >
          {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, i) => {
            const x = i % BOARD_SIZE;
            const y = Math.floor(i / BOARD_SIZE);
            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake
              .slice(1)
              .some((cell) => cell.x === x && cell.y === y);
            const isFood = foods.some((cell) => cell.x === x && cell.y === y);
            const isWater = water && water.x === x && water.y === y;
            const isCommode = commode && commode.x === x && commode.y === y;

            let cellClass = "cell";
            let content: React.ReactNode = "";

            if (isHead) {
              content = (
                <img src="/farcaster.webp" alt="Head" className="cell-icon" />
              );
            } else if (isBody) {
              cellClass += " snake-body";
            }

            if (isFood) {
              content = <img src="/x.png" alt="Food" className="cell-icon" />;
            } else if (isWater) {
              content = <span className="emoji">💧</span>;
            } else if (isCommode) {
              content = <span className="emoji">🚽</span>;
            }

            return (
              <div key={i} className={cellClass}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      {!gameOver && (
        <div className="touch-controls">
          <button onClick={() => setDirection({ x: 0, y: -1 })}>⬆️</button>
          <div>
            <button onClick={() => setDirection({ x: -1, y: 0 })}>⬅️</button>
            <button onClick={() => setDirection({ x: 1, y: 0 })}>➡️</button>
          </div>
          <button onClick={() => setDirection({ x: 0, y: 1 })}>⬇️</button>
        </div>
      )}

      <div className="score-display">Score: {score}</div>

      {gameOver && (
        <div className="game-over">
          <div className="game-over-title">💀 Game Over!</div>
          <div className="game-over-buttons">
            <button
              className="submit-score-btn"
              onClick={async () => {
                await submitScore(address as string, score);
                setScoreSubmitted(true);
              }}
              disabled={scoreSubmitted}
            >
              {scoreSubmitted ? "✅ Submitted" : "Submit Score"}
            </button>
            <button className="restart-btn" onClick={handleRestart}>
              🔄 Restart
            </button>
          </div>
          {scoreSubmitted && (
            <div style={{ marginTop: "10px", color: "#4CAF50" }}>
              🎉 Score submitted successfully!
            </div>
          )}
        </div>
      )}
      {gameOver && (
        <ShareButton
          buttonText="Share Score"
          cast={{
            text: `I just scored ${score} in Farcaster Snake! Try it out! @1 @2 @3`,
            bestFriends: true,
            embeds: [`${APP_URL}/share/${context?.user?.fid || ""}`],
          }}
          className="w-full"
        />
      )}
    </div>
  );
};

export default SnakeGame;
