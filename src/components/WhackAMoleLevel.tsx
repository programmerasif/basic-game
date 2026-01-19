import { useState, useEffect } from "react";

interface WhackAMoleLevelProps {
  score: number;
  onScoreUpdate: (newScore: number) => void;
  onLevelComplete: () => void;
  levelNumber?: number;
  targetScore?: number;
  levelName?: string;
  nextLevelName?: string;
}

interface LevelGameState {
  timeLeft: number;
  molePosition: number | null;
  gameActive: boolean;
}

/**
 * WhackAMoleLevel Component
 * Level 1: Whack-a-Mole game
 * Player clicks moles as fast as possible within 30 seconds.
 * Reaching 10 points triggers advancement to Level 2.
 */
function WhackAMoleLevel({
  score,
  onScoreUpdate,
  onLevelComplete,
  levelNumber = 1,
  targetScore = 10,
  levelName = "Whack-a-Mole",
  nextLevelName = "Maze Adventure",
}: WhackAMoleLevelProps) {
  const [gameState, setGameState] = useState<LevelGameState>({
    timeLeft: 30,
    molePosition: null,
    gameActive: true,
  });

  // Timer effect - countdown from 30 to 0
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setGameState((prev) => {
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          return { ...prev, timeLeft: 0, gameActive: false };
        }
        return { ...prev, timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Check for level completion (dynamic targetScore)
  useEffect(() => {
    if (score >= targetScore) {
      onLevelComplete();
    }
  }, [score, targetScore, onLevelComplete]);

  // Mole position effect - changes mole location every 1200-1600ms
  useEffect(() => {
    if (!gameState.gameActive) return;

    const changeMole = () => {
      const randomPosition = Math.floor(Math.random() * 9);
      setGameState((prev) => ({ ...prev, molePosition: randomPosition }));
    };

    // Set initial mole position
    changeMole();

    // Change mole position at random intervals
    const intervalDuration = Math.random() * 400 + 1200; // 1200-1600ms
    const moleInterval = setInterval(changeMole, intervalDuration);

    return () => clearInterval(moleInterval);
  }, [gameState.gameActive]);

  // Handle hole click
  const handleHoleClick = (index: number) => {
    if (!gameState.gameActive) return;

    // Check if clicked on the mole
    if (index === gameState.molePosition) {
      const newScore = score + 1;
      onScoreUpdate(newScore);

      // Move mole to a different position immediately
      setGameState((prev) => {
        const randomPosition = Math.floor(Math.random() * 9);
        return { ...prev, molePosition: randomPosition };
      });
    }
  };

  // Show transition message when score reaches target
  if (score >= targetScore && gameState.gameActive) {
    return (
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-10 backdrop-blur-sm animate-pulse border-4 border-green-400">
          <p className="text-5xl font-bold text-white mb-4">🎉 Level Up! 🎉</p>
          <p className="text-2xl text-white mb-4">
            Amazing job reaching {targetScore} points!
          </p>
          <p className="text-xl text-green-100">
            Loading Level {levelNumber + 1}: {nextLevelName}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Score and Timer Display */}
      <div className="flex justify-around items-center mb-8 bg-green-950 bg-opacity-70 rounded-lg p-6 backdrop-blur-sm border-2 border-green-500">
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">LEVEL {levelNumber}</p>
          <p className="text-3xl font-bold text-emerald-400 drop-shadow-lg">
            {levelName}
          </p>
        </div>
        <div className="h-16 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">SCORE</p>
          <p className="text-4xl font-bold text-lime-400 drop-shadow-lg">
            {score}
            <span className="text-xl"> / {targetScore}</span>
          </p>
        </div>
        <div className="h-16 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
        <div className="text-center">
          <p className="text-green-300 text-sm font-semibold mb-1">TIME</p>
          <p
            className={`text-4xl font-bold drop-shadow-lg transition-colors ${gameState.timeLeft <= 10 ? "text-red-400" : "text-emerald-400"
              }`}
          >
            {gameState.timeLeft}s
          </p>
        </div>
      </div>

      {/* Game Grid - 3x3 mole holes */}
      <div className="bg-green-950 bg-opacity-50 rounded-2xl p-8 backdrop-blur-sm mb-8 shadow-2xl border-2 border-green-500">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              onClick={() => handleHoleClick(index)}
              className="aspect-square bg-gradient-to-br from-emerald-700 to-green-900 rounded-lg shadow-lg cursor-pointer transform transition-transform hover:scale-105 active:scale-95 border-4 border-emerald-600 flex items-center justify-center hover:border-lime-400"
            >
              {/* Hole appearance */}
              <div className="w-20 h-20 bg-gradient-to-b from-green-800 to-black rounded-lg shadow-inner flex items-center justify-center">
                {/* Mole appears here */}
                {index === gameState.molePosition && gameState.gameActive && (
                  <span className="text-6xl animate-bounce">🐹</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Game Status */}
      <div className="text-center">
        {!gameState.gameActive ? (
          <div className="mb-6 p-6 bg-red-500 bg-opacity-90 rounded-xl backdrop-blur-sm border-2 border-red-400">
            <p className="text-white text-3xl font-bold mb-2">⏰ Time's Up!</p>
            <p className="text-xl text-white mb-2">Final Score: {score}</p>
            {score < targetScore ? (
              <p className="text-sm text-white">
                You needed {targetScore} points to advance. Try again!
              </p>
            ) : (
              <p className="text-sm text-white">
                You've advanced to Level {levelNumber + 1}! 🎉
              </p>
            )}
          </div>
        ) : (
          <p className="text-center text-green-300 text-sm mt-6 font-semibold">
            ✨{" "}
            {score >= targetScore
              ? `Level ${levelNumber} Complete! Advancing...`
              : "Keep clicking! You're doing great! ✨"}
          </p>
        )}
      </div>
    </div>
  );
}

export default WhackAMoleLevel;
