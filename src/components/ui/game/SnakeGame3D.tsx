"use client";
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  useTexture,
  Environment,
  PerspectiveCamera,
  Box,
  Plane,
  Grid,
  SpotLight,
} from "@react-three/drei";
import * as THREE from "three";
import { useMiniApp } from "@neynar/react";

// Extend Three.js elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      ambientLight: any;
      primitive: any;
    }
  }
}

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 1;
const MOVE_INTERVAL = 150;
const INITIAL_SNAKE = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(-2, 0, 0),
];

interface SegmentProps {
  position: THREE.Vector3;
  isHead?: boolean;
  texture: string;
}

interface FoodProps {
  position: THREE.Vector3;
  texture: string;
}

interface GameState {
  clock: {
    elapsedTime: number;
  };
}

// Snake segment component
const SnakeSegment: React.FC<SegmentProps> = ({
  position,
  isHead = false,
  texture,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const segmentTexture = useTexture(texture);
  const material = new THREE.MeshStandardMaterial({
    map: segmentTexture,
    metalness: 0.5,
    roughness: 0.5,
  });

  return (
    <Box
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      scale={isHead ? 1.2 : 1}
      args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]}
      material={material}
    />
  );
};

// Food component
const Food: React.FC<FoodProps> = ({ position, texture }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const foodTexture = useTexture(texture);
  const material = new THREE.MeshStandardMaterial({
    map: foodTexture,
    metalness: 0.7,
    roughness: 0.3,
    emissive: new THREE.Color("white"),
    emissiveIntensity: 0.2,
  });

  useFrame((state: GameState) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <Box
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      args={[CELL_SIZE, CELL_SIZE, CELL_SIZE]}
      material={material}
    />
  );
};

// Game Grid component
const GameGrid = () => {
  const gridRef = useRef<THREE.Group>(null);
  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a1a2e",
        metalness: 0.5,
        roughness: 0.5,
        transparent: true,
        opacity: 0.5,
      }),
    []
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#00ffff",
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      }),
    []
  );

  const cornerMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#00ffff",
        transparent: true,
        opacity: 0.3,
        metalness: 0.8,
        roughness: 0.2,
      }),
    []
  );

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  return (
    <group ref={gridRef}>
      {/* Grid lines */}
      <Grid
        args={[GRID_SIZE, GRID_SIZE]}
        position={[0, -0.5, 0]}
        cellColor="#00ffff"
        sectionColor="#00ffff"
        infiniteGrid={true}
      />

      {/* Base plane */}
      <Plane
        args={[GRID_SIZE, GRID_SIZE]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.5, 0]}
        material={baseMaterial}
      />

      {/* Grid walls */}
      <group>
        {/* Back wall */}
        <Plane
          args={[GRID_SIZE, GRID_SIZE / 2]}
          position={[0, GRID_SIZE / 4, -GRID_SIZE / 2]}
          material={wallMaterial}
        />

        {/* Front wall */}
        <Plane
          args={[GRID_SIZE, GRID_SIZE / 2]}
          position={[0, GRID_SIZE / 4, GRID_SIZE / 2]}
          rotation={[0, Math.PI, 0]}
          material={wallMaterial}
        />

        {/* Left wall */}
        <Plane
          args={[GRID_SIZE, GRID_SIZE / 2]}
          position={[-GRID_SIZE / 2, GRID_SIZE / 4, 0]}
          rotation={[0, Math.PI / 2, 0]}
          material={wallMaterial}
        />

        {/* Right wall */}
        <Plane
          args={[GRID_SIZE, GRID_SIZE / 2]}
          position={[GRID_SIZE / 2, GRID_SIZE / 4, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          material={wallMaterial}
        />
      </group>

      {/* Grid corners */}
      {[
        [-GRID_SIZE / 2, 0, -GRID_SIZE / 2],
        [-GRID_SIZE / 2, 0, GRID_SIZE / 2],
        [GRID_SIZE / 2, 0, -GRID_SIZE / 2],
        [GRID_SIZE / 2, 0, GRID_SIZE / 2],
      ].map((position, index) => (
        <Box
          key={index}
          args={[1, GRID_SIZE / 2, 1]}
          position={position as [number, number, number]}
          material={cornerMaterial}
        />
      ))}
    </group>
  );
};

// Game component
interface GameProps {
  onDirectionChange: (direction: "up" | "down" | "left" | "right") => void;
}

const Game: React.FC<GameProps> = ({ onDirectionChange }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(new THREE.Vector3(1, 0, 0));
  const [food, setFood] = useState(new THREE.Vector3(5, 0, 5));
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [followers, setFollowers] = useState<any[]>([]);
  const [currentFollowerIndex, setCurrentFollowerIndex] = useState(0);
  const { context } = useMiniApp();

  const moveInterval = useRef<any>();
  const nextDirection = useRef(direction);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Get random position for food
  const getRandomPosition = useCallback(() => {
    const x = Math.floor(Math.random() * GRID_SIZE - GRID_SIZE / 2);
    const z = Math.floor(Math.random() * GRID_SIZE - GRID_SIZE / 2);
    return new THREE.Vector3(x, 0, z);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setDirection(new THREE.Vector3(1, 0, 0));
    nextDirection.current = new THREE.Vector3(1, 0, 0);
    setFood(getRandomPosition());
    setScore(0);
    setGameOver(false);
    setIsPaused(true);
    setCurrentFollowerIndex(0);
  }, [getRandomPosition]);

  // Handle direction change (for mobile controls)
  const handleDirectionChange = useCallback(
    (dir: "up" | "down" | "left" | "right") => {
      if (gameOver || isPaused) return;

      switch (dir) {
        case "up":
          if (nextDirection.current.z !== 1)
            nextDirection.current = new THREE.Vector3(0, 0, -1);
          break;
        case "down":
          if (nextDirection.current.z !== -1)
            nextDirection.current = new THREE.Vector3(0, 0, 1);
          break;
        case "left":
          if (nextDirection.current.x !== 1)
            nextDirection.current = new THREE.Vector3(-1, 0, 0);
          break;
        case "right":
          if (nextDirection.current.x !== -1)
            nextDirection.current = new THREE.Vector3(1, 0, 0);
          break;
      }
    },
    [gameOver, isPaused]
  );

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === "r" || e.key === "R") {
          resetGame();
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          onDirectionChange("up");
          break;
        case "ArrowDown":
          onDirectionChange("down");
          break;
        case "ArrowLeft":
          onDirectionChange("left");
          break;
        case "ArrowRight":
          onDirectionChange("right");
          break;
        case " ":
          setIsPaused((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameOver, onDirectionChange, resetGame]);

  // Game loop
  useEffect(() => {
    if (!isPaused && !gameOver) {
      moveInterval.current = setInterval(() => {
        setSnake((prevSnake) => {
          const newHead = prevSnake[0].clone().add(nextDirection.current);

          // Check wall collision
          if (
            Math.abs(newHead.x) > GRID_SIZE / 2 ||
            Math.abs(newHead.z) > GRID_SIZE / 2
          ) {
            setGameOver(true);
            return prevSnake;
          }

          // Check self collision
          if (
            prevSnake
              .slice(1)
              .some(
                (segment) =>
                  segment.x === newHead.x &&
                  segment.y === newHead.y &&
                  segment.z === newHead.z
              )
          ) {
            setGameOver(true);
            return prevSnake;
          }

          // Check food collision
          if (
            newHead.x === food.x &&
            newHead.y === food.y &&
            newHead.z === food.z
          ) {
            setScore((prev) => prev + 1);
            setFood(getRandomPosition());
            setCurrentFollowerIndex((prev) => (prev + 1) % followers.length);
            return [newHead, ...prevSnake];
          }

          return [newHead, ...prevSnake.slice(0, -1)];
        });
      }, MOVE_INTERVAL);

      return () => clearInterval(moveInterval.current);
    }
  }, [isPaused, gameOver, food, followers.length, getRandomPosition]);

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[15, 15, 15]} />
      <OrbitControls enableZoom={false} enablePan={false} />
      <Environment preset="sunset" background={true} />
      <SpotLight
        position={[0, 10, 0]}
        intensity={0.5}
        angle={Math.PI / 4}
        penumbra={0.5}
        distance={50}
      />
      <SpotLight
        position={[10, 10, 10]}
        intensity={0.8}
        angle={Math.PI / 4}
        penumbra={0.5}
        distance={50}
      />
      <GameGrid />

      <group>
        {snake.map((position, index) => (
          <SnakeSegment
            key={index}
            position={position}
            isHead={index === 0}
            texture={
              index === 0
                ? context?.user?.pfpUrl || "/farcaster.webp"
                : "/logo.png"
            }
          />
        ))}
        {followers.length > 0 && (
          <Food
            position={food}
            texture={
              followers[currentFollowerIndex]?.pfpUrl || "/farcaster.webp"
            }
          />
        )}
      </group>

      {/* Score */}
      <Text
        position={[0, 8, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`Score: ${score}`}
      </Text>

      {/* Game state messages */}
      <Text
        position={[0, 6, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {gameOver
          ? "Game Over! Press R to restart"
          : isPaused
          ? "Press SPACE to start"
          : ""}
      </Text>
    </>
  );
};

// Main component with UI overlay
const SnakeGame3D = () => {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setShowControls(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDirectionChange = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      // Handle direction change
    },
    []
  );

  return (
    <div className="game-container">
      <Canvas shadows>
        <Game onDirectionChange={handleDirectionChange} />
      </Canvas>

      {/* Mobile Controls */}
      {showControls && (
        <div className="mobile-controls">
          <button
            onTouchStart={() => handleDirectionChange("up")}
            onClick={() => handleDirectionChange("up")}
          >
            ↑
          </button>
          <div className="horizontal-controls">
            <button
              onTouchStart={() => handleDirectionChange("left")}
              onClick={() => handleDirectionChange("left")}
            >
              ←
            </button>
            <button
              onTouchStart={() => handleDirectionChange("right")}
              onClick={() => handleDirectionChange("right")}
            >
              →
            </button>
          </div>
          <button
            onTouchStart={() => handleDirectionChange("down")}
            onClick={() => handleDirectionChange("down")}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame3D;
