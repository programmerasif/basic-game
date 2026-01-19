import { useState, useEffect, useRef, useCallback } from "react";
import MazeGrid from "./MazeGrid";
// import MobileControls from "./MobileControls";
import type { Position } from "./Player";

interface MazeLevelProps {
  score: number;
  onScoreUpdate: (newScore: number) => void;
  onGameReset: () => void;
  levelNumber?: number;
  targetScore?: number;
  levelName?: string;
}

// const MAZE_SIZE = 30; Must match MazeGrid MAZE_SIZE

/**
 * MazeLevel Component
 * Level 2: Maze Adventure game
 * Player navigates a procedurally generated maze with walls and paths.
 * Objectives:
 * 1. Collect items scattered throughout the maze (💰 🍎 🏠 ⭐ 💎)
 * 2. Reach the destination castle (🏰) at bottom-right to complete the level
 * Controls: Arrow keys or WASD to move through the maze, or touch buttons on mobile
 * No time limit - explore at your own pace!
 */
function MazeLevel({ score, onScoreUpdate, onGameReset, levelNumber = 2, targetScore = 20, levelName = "Maze Adventure" }: MazeLevelProps) {
  // Player starting position - on a valid path in the maze (row 0, col 5 is path)
  const [playerPosition, setPlayerPosition] = useState<Position>({
    row: 0,
    col: 5,
  });

  // Track items collected in this level
  const [levelScore, setLevelScore] = useState(0);

  // Track if level is completed
  const [levelComplete, setLevelComplete] = useState(false);

  // Track maze grid for wall collision detection
  const [mazeGrid, setMazeGrid] = useState<boolean[][]>([]);
  console.log(mazeGrid);

  // Use ref to track previous score
  const prevScoreRef = useRef(0);
  const [shouldComplete, setShouldComplete] = useState(false);

  // Handle maze grid updates from MazeGrid
  const handleMazeGridUpdate = useCallback((grid: boolean[][]) => {
    setMazeGrid(grid);
  }, []);

  // Handle collectible collection
  const handleCollectibleFound = () => {
    const newScore = score + 1;
    setLevelScore((prev) => prev + 1);
    onScoreUpdate(newScore);
  };

  // Handle reaching the destination
  const handleDestinationReached = () => {
    setLevelComplete(true);
  };

  // Check if level is complete (target items collected OR destination reached)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if ((score >= targetScore || levelComplete) && prevScoreRef.current < targetScore) {
      setShouldComplete(true);
    }
    prevScoreRef.current = score;
  }, [score, levelComplete, targetScore]);

  // Handle completion state update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (shouldComplete) {
      setLevelComplete(true);
      setShouldComplete(false);
      // Automatically advance when reaching target points
      if (score < targetScore) {
        onScoreUpdate(targetScore);
      }
    }
  }, [shouldComplete, score, onScoreUpdate, targetScore]);

  // Handle game reset
  const handleReset = () => {
    setPlayerPosition({ row: 0, col: 5 }); // Reset to valid starting position
    setLevelScore(0);
    setLevelComplete(false);
    onGameReset();
  };

  // // Mobile control handlers - dispatch keyboard events to change direction
  // const handleMoveUp = useCallback(() => {
  //   const upEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
  //   window.dispatchEvent(upEvent);
  // }, []);

  // const handleMoveDown = useCallback(() => {
  //   const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
  //   window.dispatchEvent(downEvent);
  // }, []);

  // const handleMoveLeft = useCallback(() => {
  //   const leftEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" });
  //   window.dispatchEvent(leftEvent);
  // }, []);

  // const handleMoveRight = useCallback(() => {
  //   const rightEvent = new KeyboardEvent("keydown", { key: "ArrowRight" });
  //   window.dispatchEvent(rightEvent);
  // }, []);

  return (
    <div className="w-full h-screen md:h-auto overflow-hidden md:overflow-visible flex flex-col">
      {/* Score and Level Display - Hidden on mobile */}
      <div className="flex md:hidden justify-around items-center bg-green-950 bg-opacity-70 rounded-lg p-1 backdrop-blur-sm border-2 border-green-500">
        <p className="text-4xl font-bold text-teal-400 drop-shadow-lg">
          {levelScore}
        </p>
        <p className="text-4xl font-bold text-lime-400 drop-shadow-lg">
          {score}
        </p>
        <div className="h-16 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">
            TOTAL SCORE
          </p>

        </div>
        <div className="h-16 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">
            ITEMS FOUND
          </p>

        </div>
      </div>
      <div className="hidden md:flex justify-around items-center mb-8 bg-green-950 bg-opacity-70 rounded-lg p-6 backdrop-blur-sm border-2 border-green-500">
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">LEVEL {levelNumber}</p>
          <p className="text-3xl font-bold text-emerald-400 drop-shadow-lg">
            {levelName}
          </p>
        </div>
        <div className="h-16 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">
            TOTAL SCORE
          </p>
          <p className="text-4xl font-bold text-lime-400 drop-shadow-lg">
            {score}
          </p>
        </div>
        <div className="h-16 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">
            ITEMS FOUND
          </p>
          <p className="text-4xl font-bold text-teal-400 drop-shadow-lg">
            {levelScore}
          </p>
        </div>
      </div>
      {/* Level completion status - Hidden on mobile */}
      {levelComplete && (
        <div className="hidden md:block mb-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-10 backdrop-blur-sm border-4 border-green-300 shadow-2xl">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="text-8xl animate-bounce">🏰</div>
            </div>
            <p className="text-6xl font-extrabold text-white mb-6 text-center drop-shadow-2xl animate-pulse">
              🎉 CONGRATULATIONS! 🎉
            </p>
            <div className="bg-green-900 bg-opacity-40 rounded-xl p-6 mb-6">
              <p className="text-3xl font-bold text-white text-center mb-3">
                {score >= targetScore
                  ? `🌟 You collected ${targetScore} items! 🌟`
                  : "👑 You reached the castle! 👑"}
              </p>
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <p className="text-green-200 text-sm font-semibold mb-1">TOTAL SCORE</p>
                  <p className="text-4xl font-bold text-yellow-300 drop-shadow-lg">{score}</p>
                </div>
                <div className="h-16 w-1 bg-gradient-to-b from-white to-transparent opacity-30"></div>
                <div className="text-center">
                  <p className="text-green-200 text-sm font-semibold mb-1">ITEMS COLLECTED</p>
                  <p className="text-4xl font-bold text-yellow-300 drop-shadow-lg">{levelScore}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-2xl text-white font-bold animate-pulse">
              <span>✨</span>
              <span>Advancing to Level {levelNumber + 1}{levelNumber === 2 ? ": Snake Game" : ": Whack-a-Mole II"}</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Maze Game Grid - Full screen on mobile */}
      {!levelComplete ? (
        <div className="flex-1 md:flex-none h-full md:h-auto mb-0 md:mb-8 flex items-center justify-center">
          <MazeGrid
            playerPosition={playerPosition}
            onPlayerPositionChange={setPlayerPosition}
            onCollectibleFound={handleCollectibleFound}
            onDestinationReached={handleDestinationReached}
            onMazeGridUpdate={handleMazeGridUpdate}
          />
        </div>
      ) : (
        <div className="hidden md:block mb-8 bg-green-900 bg-opacity-70 rounded-2xl p-12 backdrop-blur-sm text-center border-2 border-green-500">
          <p className="text-6xl mb-4">🏰</p>
          <p className="text-2xl font-bold text-white mb-4">
            You've reached the castle!
          </p>
          <p className="text-lg text-green-200">
            Successfully navigated the maze and reached your destination!
          </p>
        </div>
      )}

      {/* Instructions and Controls - Hidden on mobile */}
      <div className="hidden md:block bg-green-950 bg-opacity-60 rounded-xl p-6 backdrop-blur-sm mb-8 border-2 border-green-500">
        <h3 className="text-xl font-bold text-white mb-4">
          📍 Level 2: Maze Adventure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-200">
          <div>
            <p className="font-semibold text-white mb-2">🎮 Controls</p>
            <ul className="text-sm space-y-1">
              <li>
                • <span className="text-lime-400">↑ ↓ ← →</span> Arrow Keys / WASD
              </li>
              <li>
                • <span className="text-lime-400">📱 Swipe</span> on mobile
              </li>
              <li>• Character auto-runs, just turn!</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">🎯 Objectives</p>
            <ul className="text-sm space-y-1">
              <li>• Collect scattered items 💰 🍎 🏠 ⭐ 💎</li>
              <li>
                •{" "}
                <span className="text-lime-300 font-bold">
                  Collect 20 items to WIN!
                </span>
              </li>
              <li>• Or reach the castle 🏰 to complete</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">📊 Maze Features</p>
            <ul className="text-sm space-y-1">
              <li>• Start: Top-left 🧑</li>
              <li>• Goal: Bottom-right 🏰</li>
              <li>• More walls = harder challenge</li>
            </ul>


          </div>
        </div>
      </div>

      {/* Game Actions - Hidden on mobile */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-95 border-2 border-red-600"
        >
          🏠 Back to Start
        </button>
        <button
          onClick={handleReset}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 active:scale-95 border-2 border-emerald-600"
        >
          🔄 New Game
        </button>
      </div>

      {/* Tips Section - Hidden on mobile */}
      <div className="hidden md:block mt-8 bg-gradient-to-r from-green-900 to-emerald-900 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm border-2 border-green-500">
        <p className="text-sm text-green-200">
          💡 <span className="font-semibold">How to Win:</span> Collect{" "}
          <span className="text-lime-300 font-bold">20 items</span> to
          complete the level! You can also reach the castle 🏰 to finish the
          level. No time limit - explore and collect at your own pace!
        </p>
      </div>
    </div>
  );
}

export default MazeLevel;
