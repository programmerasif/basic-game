import { useState, useEffect, useCallback } from "react";

interface SnakeBoardProps {
    onFoodEaten: () => void;
    onGameOver: () => void;
}

export interface Position {
    x: number;
    y: number;
}

const BOARD_WIDTH = 15;
const BOARD_HEIGHT = 15;
const GAME_SPEED = 250; // milliseconds

/**
 * SnakeBoard Component
 * Manages the game board, food positioning, collision detection, and rendering.
 * Uses a 15x15 grid-based board.
 * Supports both keyboard and mobile touch controls.
 */
function SnakeBoard({ onFoodEaten, onGameOver }: SnakeBoardProps) {
    // Snake state: array of positions from head to tail
    const [snake, setSnake] = useState<Position[]>([
        { x: 7, y: 7 },
        { x: 6, y: 7 },
        { x: 5, y: 7 },
    ]);

    // Current direction of movement
    const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
    // Next direction (buffered to prevent double-moves in fast inputs)
    const [nextDirection, setNextDirection] = useState<Position>({ x: 1, y: 0 });

    // Food position
    const [food, setFood] = useState<Position>(generateFoodPosition(snake));

    // Generate random food position not on snake
    function generateFoodPosition(snakeBody: Position[]): Position {
        let newFood: Position;
        const snakePositions = new Set(
            snakeBody.map((pos) => `${pos.x},${pos.y}`)
        );

        do {
            // Ensure food spawns only in the playable area (not on border)
            // Borders are at 0 and BOARD_WIDTH-1, so playable area is 1 to BOARD_WIDTH-2
            newFood = {
                x: 1 + Math.floor(Math.random() * (BOARD_WIDTH - 2)),
                y: 1 + Math.floor(Math.random() * (BOARD_HEIGHT - 2)),
            };
        } while (snakePositions.has(`${newFood.x},${newFood.y}`));

        return newFood;
    }

    // Handle keyboard input
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const key = e.key.toLowerCase();

        // Arrow keys
        if (key === "arrowup" || key === "w") {
            e.preventDefault();
            setNextDirection({ x: 0, y: -1 });
        } else if (key === "arrowdown" || key === "s") {
            e.preventDefault();
            setNextDirection({ x: 0, y: 1 });
        } else if (key === "arrowleft" || key === "a") {
            e.preventDefault();
            setNextDirection({ x: -1, y: 0 });
        } else if (key === "arrowright" || key === "d") {
            e.preventDefault();
            setNextDirection({ x: 1, y: 0 });
        }
    }, []);

    // Attach keyboard event listener
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Touch/swipe controls for mobile
    useEffect(() => {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchMove = (e: TouchEvent) => {
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        };

        const handleTouchEnd = () => {
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 15; // Reduced for faster response

            // Only process if there was actual movement
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return;
            }

            // Determine swipe direction based on larger delta
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    setNextDirection({ x: 1, y: 0 }); // right
                } else {
                    setNextDirection({ x: -1, y: 0 }); // left
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    setNextDirection({ x: 0, y: 1 }); // down
                } else {
                    setNextDirection({ x: 0, y: -1 }); // up
                }
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    // Direction button handlers
    const handleDirectionUp = () => setNextDirection({ x: 0, y: -1 });
    const handleDirectionDown = () => setNextDirection({ x: 0, y: 1 });
    const handleDirectionLeft = () => setNextDirection({ x: -1, y: 0 });
    const handleDirectionRight = () => setNextDirection({ x: 1, y: 0 });

    // Game loop
    useEffect(() => {
        const gameLoop = setInterval(() => {
            setSnake((prevSnake) => {
                // Prevent reversing into itself
                const newDirection = nextDirection;
                if (
                    newDirection.x === -direction.x &&
                    newDirection.y === -direction.y
                ) {
                    setDirection({ x: prevSnake[0].x - prevSnake[1].x, y: prevSnake[0].y - prevSnake[1].y });
                } else {
                    setDirection(newDirection);
                }

                const head = prevSnake[0];
                const newHead: Position = {
                    x: head.x + newDirection.x,
                    y: head.y + newDirection.y,
                };

                // Check wall collision
                if (
                    newHead.x < 0 ||
                    newHead.x >= BOARD_WIDTH ||
                    newHead.y < 0 ||
                    newHead.y >= BOARD_HEIGHT
                ) {
                    onGameOver();
                    return prevSnake;
                }

                // Check self collision
                for (let i = 0; i < prevSnake.length; i++) {
                    if (newHead.x === prevSnake[i].x && newHead.y === prevSnake[i].y) {
                        onGameOver();
                        return prevSnake;
                    }
                }

                let newSnake = [newHead, ...prevSnake];

                // Check food collision
                if (newHead.x === food.x && newHead.y === food.y) {
                    onFoodEaten();
                    // Don't remove tail - snake grows
                    setFood(generateFoodPosition(newSnake));
                } else {
                    // Remove tail if not eating food
                    newSnake = newSnake.slice(0, -1);
                }

                return newSnake;
            });
        }, GAME_SPEED);

        return () => clearInterval(gameLoop);
    }, [direction, nextDirection, food, onFoodEaten, onGameOver]);

    return (
        <div className="flex flex-col items-center mb-8 relative">
            {/* Game Instructions - visible on desktop */}
            <div className="hidden md:flex gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2 bg-emerald-900 bg-opacity-60 px-3 py-2 rounded-lg border border-emerald-500">
                    <span className="text-lg">🐍</span>
                    <span className="text-emerald-300">= You (Snake Head)</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-900 bg-opacity-60 px-3 py-2 rounded-lg border border-orange-500">
                    <span className="text-lg">🍎</span>
                    <span className="text-orange-300">= Food (Eat to grow!)</span>
                </div>
                <div className="flex items-center gap-2 bg-red-900 bg-opacity-60 px-3 py-2 rounded-lg border border-red-500">
                    <span className="text-lg">🚧</span>
                    <span className="text-red-300">= Wall (Avoid!)</span>
                </div>
            </div>

            {/* Mobile Instructions */}
            <div className="flex md:hidden gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1 bg-emerald-900 bg-opacity-80 px-2 py-1 rounded border border-emerald-500">
                    <span>🐍</span>
                    <span className="text-emerald-300">You</span>
                </div>
                <div className="flex items-center gap-1 bg-orange-900 bg-opacity-80 px-2 py-1 rounded border border-orange-500">
                    <span>🍎</span>
                    <span className="text-orange-300">Eat!</span>
                </div>
                <div className="flex items-center gap-1 bg-red-900 bg-opacity-80 px-2 py-1 rounded border border-red-500">
                    <span>🚧</span>
                    <span className="text-red-300">Avoid!</span>
                </div>
            </div>

            {/* Game Board */}
            <div
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-emerald-500 rounded-xl shadow-2xl relative"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                    gap: "1px",
                    padding: "6px",
                    width: `${BOARD_WIDTH * 22 + 12}px`,
                    height: `${BOARD_HEIGHT * 22 + 12}px`,
                }}
            >
                {/* Render board cells */}
                {Array.from({ length: BOARD_HEIGHT }).map((_, y) =>
                    Array.from({ length: BOARD_WIDTH }).map((_, x) => {
                        const isSnakeHead = snake[0].x === x && snake[0].y === y;
                        const isSnakeBody = snake.some((pos, idx) => idx > 0 && pos.x === x && pos.y === y);
                        const isFood = food.x === x && food.y === y;
                        const isBorder = x === 0 || x === BOARD_WIDTH - 1 || y === 0 || y === BOARD_HEIGHT - 1;

                        return (
                            <div
                                key={`${x}-${y}`}
                                className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all duration-75 ${isBorder
                                    ? "bg-gradient-to-br from-red-800 to-red-900 border border-red-600"
                                    : isSnakeHead
                                        ? "bg-gradient-to-br from-lime-400 to-lime-500 shadow-lg shadow-lime-400/50 rounded-md"
                                        : isSnakeBody
                                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-sm"
                                            : isFood
                                                ? "bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-400/50 animate-pulse rounded-full"
                                                : "bg-slate-700/50"
                                    }`}
                            >
                                {isSnakeHead && !isBorder && <span className="text-sm drop-shadow-lg">🐍</span>}
                                {isFood && !isBorder && <span className="text-sm drop-shadow-lg">🍎</span>}
                                {isBorder && <span className="text-[8px] opacity-60">🚧</span>}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Direction hint for desktop */}
            <div className="hidden md:block mt-4 text-center">
                <p className="text-emerald-300 text-sm">Use <span className="bg-slate-700 px-2 py-1 rounded text-white font-mono">↑ ↓ ← →</span> or <span className="bg-slate-700 px-2 py-1 rounded text-white font-mono">W A S D</span> to move</p>
            </div>

            {/* Compact Mobile Direction Buttons */}
            <div className="mt-4 md:hidden">
                <p className="text-emerald-300 text-xs text-center mb-2">Swipe or tap buttons to move</p>
                <div className="relative w-24 h-24 mx-auto">
                    {/* Up Button */}
                    <button
                        onTouchStart={(e) => { e.stopPropagation(); handleDirectionUp(); }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-600 bg-opacity-90 border-2 border-emerald-400 flex items-center justify-center text-white text-sm font-bold active:bg-emerald-500 active:scale-95 shadow-lg"
                    >
                        ▲
                    </button>
                    {/* Down Button */}
                    <button
                        onTouchStart={(e) => { e.stopPropagation(); handleDirectionDown(); }}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-emerald-600 bg-opacity-90 border-2 border-emerald-400 flex items-center justify-center text-white text-sm font-bold active:bg-emerald-500 active:scale-95 shadow-lg"
                    >
                        ▼
                    </button>
                    {/* Left Button */}
                    <button
                        onTouchStart={(e) => { e.stopPropagation(); handleDirectionLeft(); }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-600 bg-opacity-90 border-2 border-emerald-400 flex items-center justify-center text-white text-sm font-bold active:bg-emerald-500 active:scale-95 shadow-lg"
                    >
                        ◀
                    </button>
                    {/* Right Button */}
                    <button
                        onTouchStart={(e) => { e.stopPropagation(); handleDirectionRight(); }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-600 bg-opacity-90 border-2 border-emerald-400 flex items-center justify-center text-white text-sm font-bold active:bg-emerald-500 active:scale-95 shadow-lg"
                    >
                        ▶
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SnakeBoard;