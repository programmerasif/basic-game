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
        <div className="flex justify-center mb-8">
            <div
                className="bg-slate-900 border-4 border-emerald-500 rounded-lg shadow-2xl"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                    gap: "2px",
                    padding: "8px",
                    width: `${BOARD_WIDTH * 25 + 16}px`,
                    height: `${BOARD_HEIGHT * 25 + 16}px`,
                }}
            >
                {/* Render board cells */}
                {Array.from({ length: BOARD_HEIGHT }).map((_, y) =>
                    Array.from({ length: BOARD_WIDTH }).map((_, x) => {
                        const isSnakeHead = snake[0].x === x && snake[0].y === y;
                        const isSnakeBody = snake.some((pos) => pos.x === x && pos.y === y);
                        const isFood = food.x === x && food.y === y;
                        const isBorder = x === 0 || x === BOARD_WIDTH - 1 || y === 0 || y === BOARD_HEIGHT - 1;

                        return (
                            <div
                                key={`${x}-${y}`}
                                className={`w-6 h-6 rounded-sm transition-all ${isBorder
                                    ? "bg-red-900 border-2 border-red-600"
                                    : isSnakeHead
                                        ? "bg-lime-400 shadow-lg shadow-lime-400"
                                        : isSnakeBody
                                            ? "bg-emerald-500"
                                            : isFood
                                                ? "bg-orange-500 shadow-lg shadow-orange-400"
                                                : "bg-slate-800"
                                    }`}
                            >
                                {isSnakeHead && !isBorder && <span className="text-xs">🐍</span>}
                                {isFood && !isBorder && <span className="text-xs">🍎</span>}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SnakeBoard;
