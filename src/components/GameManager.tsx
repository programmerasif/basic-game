import { useState, useEffect, useRef } from "react";
import WhackAMoleLevel from "./WhackAMoleLevel";
import MazeLevel from "./MazeLevel";
import SnakeLevel from "./SnakeLevel";


interface SharedGameState {
  score: number;
  currentLevel: number;
}

/**
 * GameManager Component
 * Manages overall game flow, state transitions, and level progression.
 * Handles progression: Level 1 (10 pts) → Level 2 (20 pts) → Level 3 (30 pts = completion)
 */
function GameManager() {
  const [sharedState, setSharedState] = useState<SharedGameState>({
    score: 0,
    currentLevel: 1,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [shouldAdvanceLevel, setShouldAdvanceLevel] = useState(false);
  const [nextLevel, setNextLevel] = useState(1);

  // Use refs to track previous values
  const prevScoreRef = useRef(0);

  // Monitor score and determine if level should advance
  useEffect(() => {
    const currentScore = sharedState.score;
    const currentLevel = sharedState.currentLevel;
    const prevScore = prevScoreRef.current;

    // Level 1 → Level 2 at 10 points
    if (currentScore >= 10 && currentLevel === 1 && prevScore < 10) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNextLevel(2);
      setShouldAdvanceLevel(true);
    }
    // Level 2 → Level 3 at 20 points
    else if (currentScore >= 20 && currentLevel === 2 && prevScore < 20) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNextLevel(3);
      setShouldAdvanceLevel(true);
    }
    // Check for game completion (30 points)
    else if (currentScore >= 30 && currentLevel === 3) {
      setGameCompleted(true);
    }

    prevScoreRef.current = currentScore;
  }, [sharedState.score, sharedState.currentLevel]);

  // Handle level advancement when flag is set
  useEffect(() => {
    if (shouldAdvanceLevel && nextLevel !== sharedState.currentLevel) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setSharedState((prev) => ({
        ...prev,
        currentLevel: nextLevel,
      }));
      setShouldAdvanceLevel(false);
    }
  }, [shouldAdvanceLevel, nextLevel, sharedState.currentLevel]);

  // Handle score updates from level components
  const handleScoreUpdate = (newScore: number) => {
    setSharedState((prev) => ({
      ...prev,
      score: newScore,
    }));
  };

  // Reset game to initial state
  const resetGame = () => {
    setSharedState({
      score: 0,
      currentLevel: 1,
    });
    setGameStarted(false);
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Game Completion Screen */}
        {gameCompleted ? (
          <div className="text-center px-4">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 backdrop-blur-sm animate-pulse shadow-2xl border-2 md:border-4 border-green-400">
              <p className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">🏆 🎊 🏆</p>
              <h2 className="text-xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg px-2">
                CONGRATULATIONS!
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4 drop-shadow-lg px-2">
                You've completed all three levels!
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8">
                Final Score: <span className="font-bold text-2xl sm:text-3xl md:text-4xl">{sharedState.score}</span>
              </p>
              <div className="space-y-2 sm:space-y-3 text-left max-w-2xl mx-auto text-white mb-6 sm:mb-10 bg-green-900 bg-opacity-60 rounded-xl p-4 sm:p-6 border-2 border-green-400">
                <p className="text-sm sm:text-base md:text-lg">✅ Level 1: Whack-a-Mole - Mastered!</p>
                <p className="text-sm sm:text-base md:text-lg">✅ Level 2: Bangladesh Map - Conquered!</p>
                <p className="text-sm sm:text-base md:text-lg">✅ Level 3: Snake Game - Completed!</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-green-400 text-slate-900 font-bold text-lg sm:text-xl rounded-lg shadow-lg hover:bg-emerald-300 transition-all transform hover:scale-105 active:scale-95 border-2 border-green-600 w-full sm:w-auto"
              >
                Play Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Global Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                🎮 গুপ্ত ধর 🎮
              </h1>
              {gameStarted && (
                <div className="flex justify-center gap-8 mb-6 bg-green-950 bg-opacity-70 rounded-lg p-4 backdrop-blur-sm border-2 border-green-500">
                  <div className="text-center">
                    <p className="text-green-300 text-sm font-semibold mb-1">
                      LEVEL
                    </p>
                    <p className="text-3xl font-bold text-emerald-400 drop-shadow-lg">
                      {sharedState.currentLevel}
                    </p>
                  </div>
                  <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="text-center">
                    <p className="text-green-300 text-sm font-semibold mb-1">
                      TOTAL SCORE
                    </p>
                    <p className="text-3xl font-bold text-lime-400 drop-shadow-lg">
                      {sharedState.score}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Level Content */}
            {!gameStarted ? (
              // Start Screen
              <div className="text-center">
                <div className="bg-green-950 bg-opacity-60 rounded-2xl p-10 backdrop-blur-sm mb-8 border-2 border-green-500">
                  <h2 className="text-3xl font-bold text-white mb-6">
                    গুপ্ত ধর গেম-এ আপনাকে স্বাগতম
                  </h2>
                  <div className="space-y-4 text-left max-w-md mx-auto text-green-200 mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        📍 Level 1: Whack-a-Mole
                      </h3>
                      <p className="text-sm">
                        Click the moles as fast as you can! Reach 10 points to
                        advance.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        🏰 Level 2: Bangladesh Map Adventure
                      </h3>
                      <p className="text-sm">
                        Navigate inside the Bangladesh map shape and collect items
                        to increase your score to 20!
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        🐍 Level 3: Snake Game
                      </h3>
                      <p className="text-sm">
                        Control the snake, eat food, and avoid collisions! Reach 30
                        points to complete all levels!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Start Adventure
                  </button>
                </div>
              </div>
            ) : sharedState.currentLevel === 1 ? (
              // Level 1: Whack-a-Mole
              <WhackAMoleLevel
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onLevelComplete={() => {
                  // Level complete when reaching 10 points
                  // Transition handled by useEffect
                }}
              />
            ) : sharedState.currentLevel === 2 ? (
              // Level 2: Maze
              <MazeLevel
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
              />
            ) : (
              // Level 3: Snake Game
              <SnakeLevel
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
              />
            )}

            {/* Footer */}
            {/* <p className="text-center text-green-400 text-xs mt-8 font-medium">
              © 2026 hit-the-hade | Designed & Developed by <a href="" className="underline">Team</a>
            </p> */}
          </>
        )}
      </div>
    </div>
  );
}

export default GameManager;
