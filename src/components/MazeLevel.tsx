import { useState, useEffect, useRef, useCallback } from "react";
import BangladeshMazeGrid from "./BangladeshMazeGrid";
import MobileControls from "./MobileControls";

interface MazeLevelProps {
  score: number;
  onScoreUpdate: (newScore: number) => void;
  onGameReset: () => void;
}

/**
 * MazeLevel Component
 * Level 2: Maze Adventure game
 * Player navigates a procedurally generated maze with walls and paths.
 * Objectives:
 * 1. Collect items scattered throughout the maze (� � � ⭐ 💎)
 * 2. Reach the destination castle (�) at bottom-right to complete the level
 * Controls: Arrow keys or WASD to move through the maze, or touch buttons on mobile
 * No time limit - explore at your own pace!
 */
function MazeLevel({ score, onScoreUpdate, onGameReset }: MazeLevelProps) {
  // Player starting position (inside Bangladesh map)
  const [playerPosition, setPlayerPosition] = useState({ x: 300, y: 250 });

  // Track items collected in this level
  const [levelScore, setLevelScore] = useState(0);

  // Track if level is completed
  const [levelComplete, setLevelComplete] = useState(false);

  // Use ref to track previous score
  const prevScoreRef = useRef(0);
  const [shouldComplete, setShouldComplete] = useState(false);

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

  // Check if level is complete (20 items collected OR destination reached)
  useEffect(() => {
    if ((score >= 20 || levelComplete) && prevScoreRef.current < 20) {
      setTimeout(() => setShouldComplete(true), 0);
    }
    prevScoreRef.current = score;
  }, [score, levelComplete]);

  // Handle completion state update
  useEffect(() => {
    if (shouldComplete) {
      setTimeout(() => {
        setLevelComplete(true);
        setShouldComplete(false);
        // Automatically advance to Level 3 when reaching 20 points
        if (score < 20) {
          onScoreUpdate(20);
        }
      }, 0);
    }
  }, [shouldComplete, score, onScoreUpdate]);

  // Handle game reset
  const handleReset = () => {
    setPlayerPosition({ x: 300, y: 250 });
    setLevelScore(0);
    setLevelComplete(false);
    onGameReset();
  };

  // Mobile control handlers - passed to MobileControls
  const handleMoveUp = useCallback(() => {
    setPlayerPosition((prev) => ({ ...prev, y: prev.y - 15 }));
  }, []);

  const handleMoveDown = useCallback(() => {
    setPlayerPosition((prev) => ({ ...prev, y: prev.y + 15 }));
  }, []);

  const handleMoveLeft = useCallback(() => {
    setPlayerPosition((prev) => ({ ...prev, x: prev.x - 15 }));
  }, []);

  const handleMoveRight = useCallback(() => {
    setPlayerPosition((prev) => ({ ...prev, x: prev.x + 15 }));
  }, []);

  return (
    <div className="w-full">
      {/* Score and Level Display */}
      <div className="flex justify-around items-center mb-8 bg-green-950 bg-opacity-70 rounded-lg p-6 backdrop-blur-sm border-2 border-green-500">
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">LEVEL 2</p>
          <p className="text-3xl font-bold text-emerald-400 drop-shadow-lg">
            Bangladesh Map
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

      {/* Level completion status */}
      {levelComplete && (
        <div className="mb-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl p-10 backdrop-blur-sm border-4 border-green-300 shadow-2xl">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="text-8xl animate-bounce">🏰</div>
            </div>
            <p className="text-6xl font-extrabold text-white mb-6 text-center drop-shadow-2xl animate-pulse">
              🎉 CONGRATULATIONS! 🎉
            </p>
            <div className="bg-green-900 bg-opacity-40 rounded-xl p-6 mb-6">
              <p className="text-3xl font-bold text-white text-center mb-3">
                {score >= 20
                  ? "🌟 You collected 20 items! 🌟"
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
              <span>Advancing to Level 3: Snake Game</span>
              <span>✨</span>
            </div>
          </div>
        </div>
      )}

      {/* Maze Game Grid */}
      {!levelComplete ? (
        <div className="mb-8">
          <BangladeshMazeGrid
            playerPosition={playerPosition}
            onPlayerPositionChange={setPlayerPosition}
            onCollectibleFound={handleCollectibleFound}
            onDestinationReached={handleDestinationReached}
          />
        </div>
      ) : (
        <div className="mb-8 bg-green-900 bg-opacity-70 rounded-2xl p-12 backdrop-blur-sm text-center border-2 border-green-500">
          <p className="text-6xl mb-4">🏰</p>
          <p className="text-2xl font-bold text-white mb-4">
            You've reached the castle!
          </p>
          <p className="text-lg text-green-200">
            Successfully navigated the maze and reached your destination!
          </p>
        </div>
      )}
      <div className="w-full">
        {/* Mobile Controls */}
        <MobileControls
          onUp={handleMoveUp}
          onDown={handleMoveDown}
          onLeft={handleMoveLeft}
          onRight={handleMoveRight}
          label="Use arrow buttons to navigate the maze"
        />
      </div>
      {/* Instructions and Controls */}
      <div className="bg-green-950 bg-opacity-60 rounded-xl p-6 backdrop-blur-sm mb-8 border-2 border-green-500">
        <h3 className="text-xl font-bold text-white mb-4">
          📍 Level 2: Bangladesh Map Adventure
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-200">
          <div>
            <p className="font-semibold text-white mb-2">🎮 Controls</p>
            <ul className="text-sm space-y-1">
              <li>
                • <span className="text-lime-400">↑ ↓ ← →</span> Arrow Keys
              </li>
              <li>
                • <span className="text-lime-400">W A S D</span> Alternative
              </li>
              <li>• Stay within Bangladesh borders!</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-2">🎯 Objectives</p>
            <ul className="text-sm space-y-1">
              <li>• Navigate inside the Bangladesh map</li>
              <li>• Collect items 💰 🍎 🏠 ⭐ 💎</li>
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
            <p className="font-semibold text-white mb-2">📊 Map Features</p>
            <ul className="text-sm space-y-1">
              <li>• Real Bangladesh map boundary</li>
              <li>• Items spawn inside the map</li>
              <li>• Castle destination within borders</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Game Actions */}
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

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-green-900 to-emerald-900 bg-opacity-50 rounded-lg p-4 backdrop-blur-sm border-2 border-green-500">
        <p className="text-sm text-green-200">
          💡 <span className="font-semibold">How to Win:</span> Navigate inside
          the Bangladesh map and collect{" "}
          <span className="text-lime-300 font-bold">20 items</span> to
          complete the level! You can also reach the castle 🏰 to finish. Stay
          within the borders and explore at your own pace!
        </p>
      </div>
    </div>
  );
}

export default MazeLevel;
