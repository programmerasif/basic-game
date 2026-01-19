import { useState } from "react";
import SnakeBoard from "./SnakeBoard.tsx";

interface SnakeLevelProps {
    score: number;
    onScoreUpdate: (newScore: number) => void;
    onGameReset: () => void;
}

/**
 * SnakeLevel Component
 * Level 3: Classic Snake Game
 * Player controls a snake with arrow keys or WASD, or touch buttons on mobile.
 * Objectives:
 * 1. Eat food (🍎) to grow and increase score
 * 2. Avoid collisions with walls and the snake's own body
 * 3. Reach 30 total points to complete the game
 * Controls: Arrow keys or WASD to move, or tap on-screen directional buttons
 */
function SnakeLevel({ score, onScoreUpdate, onGameReset }: SnakeLevelProps) {
    const [levelScore, setLevelScore] = useState(0);
    const [gameActive, setGameActive] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [gameKey, setGameKey] = useState(0); // Key to force remount of SnakeBoard

    // Handle food eaten
    const handleFoodEaten = () => {
        const newScore = score + 1;
        setLevelScore((prev) => prev + 1);
        onScoreUpdate(newScore);
    };

    // Handle game over (collision)
    const handleGameOver = () => {
        setGameActive(false);
        setGameOver(true);
    };

    // Handle reset button - restart Level 3 without going back to Level 1
    const handleReset = () => {
        setLevelScore(0);
        setGameActive(true);
        setGameOver(false);
        setGameKey(prev => prev + 1); // Force SnakeBoard to remount
        // Don't call onGameReset() - that would reset to Level 1
        // Just reset the local game state to restart Level 3
    };

    // Handle start from beginning - reset entire game to Level 1
    const handleStartFromBeginning = () => {
        onGameReset();
    };






    return (
        <div className="w-full">
            {/* Score and Level Display */}
            <div className="flex justify-around items-center mb-8 bg-green-950 bg-opacity-70 rounded-lg p-6 backdrop-blur-sm border-2 border-green-500">
                <div className="text-center">
                    <p className="text-green-300 text-sm font-semibold mb-1">LEVEL 3</p>
                    <p className="text-3xl font-bold text-emerald-400 drop-shadow-lg">
                        Snake Game
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
                        FOOD EATEN
                    </p>
                    <p className="text-4xl font-bold text-teal-400 drop-shadow-lg">
                        {levelScore}
                    </p>
                </div>
            </div>

            {/* Game Over Status */}
            {gameOver && (
                <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 backdrop-blur-sm animate-pulse border-4 border-red-300">
                    <p className="text-5xl font-bold text-white mb-4 text-center">
                        💀 Game Over! 💀
                    </p>
                    <p className="text-2xl text-white text-center mb-2">
                        You hit a wall or yourself!
                    </p>
                    <p className="text-xl text-red-100 text-center mb-6">
                        Food eaten this level: {levelScore}
                    </p>
                    {score < 30 && (
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleReset}
                                className="px-8 py-4 bg-white text-red-600 font-bold text-lg rounded-lg shadow-lg hover:bg-red-100 transition-all transform hover:scale-105 active:scale-95 border-2 border-red-600"
                            >
                                🔄 Try Again
                            </button>
                            <button
                                onClick={handleStartFromBeginning}
                                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 active:scale-95 border-2 border-orange-600"
                            >
                                🏠 Start from Beginning
                            </button>
                        </div>
                    )}
                </div>
            )}



            {/* Game Board */}
            {gameActive && (
                <SnakeBoard
                    key={gameKey}
                    onFoodEaten={handleFoodEaten}
                    onGameOver={handleGameOver}
                />
            )}
            {/* Progress indicator for level completion */}
            {!gameOver && score >= 30 && (
                <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 backdrop-blur-sm animate-pulse border-4 border-green-300">
                    <p className="text-5xl font-bold text-white mb-4 text-center">
                        🎉 Level Complete! 🎉
                    </p>
                    <p className="text-2xl text-white text-center">
                        You've reached 30 points! Great job!
                    </p>
                </div>
            )}

            {score < 30 && (
                <div className="mt-8 text-center">
                    <p className="text-white text-lg">
                        Score to complete: <span className="font-bold text-lime-400">{Math.max(0, 30 - score)}</span> more points
                    </p>
                </div>
            )}
        </div>
    );
}

export default SnakeLevel;
