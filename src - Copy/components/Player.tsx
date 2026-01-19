import { useEffect, useState } from "react";

export interface Position {
  row: number;
  col: number;
}

interface PlayerProps {
  position: Position;
  onPositionChange: (newPosition: Position) => void;
  mazeGrid: boolean[][];
  mazeSize: number;
}

/**
 * Player Component
 * Handles the controllable character in the maze.
 * Supports keyboard controls:
 * - Arrow keys (↑ ↓ ← →)
 * - WASD keys
 * Prevents movement through walls.
 */
function Player({
  position,
  onPositionChange,
  mazeGrid,
  mazeSize,
}: PlayerProps) {
  const [isMoving, setIsMoving] = useState(false);

  // Handle keyboard input for player movement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      // Only handle movement keys
      if (
        ![
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          "w",
          "a",
          "s",
          "d",
        ].includes(key)
      ) {
        return;
      }

      event.preventDefault();
      let newRow = position.row;
      let newCol = position.col;

      // Determine new position based on key pressed
      switch (key) {
        case "arrowup":
        case "w":
          newRow = Math.max(0, position.row - 1);
          break;
        case "arrowdown":
        case "s":
          newRow = Math.min(mazeSize - 1, position.row + 1);
          break;
        case "arrowleft":
        case "a":
          newCol = Math.max(0, position.col - 1);
          break;
        case "arrowright":
        case "d":
          newCol = Math.min(mazeSize - 1, position.col + 1);
          break;
      }

      // Check if the new position is a valid path (not a wall)
      if (mazeGrid[newRow] && mazeGrid[newRow][newCol]) {
        if (!isMoving) {
          setIsMoving(true);
          onPositionChange({ row: newRow, col: newCol });
          setTimeout(() => setIsMoving(false), 100);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [position, onPositionChange, mazeGrid, mazeSize, isMoving]);

  // Render the player character at their current position
  return (
    <div
      className="absolute w-8 h-8 flex items-center justify-center text-2xl transition-all duration-100 animate-pulse"
      style={{
        left: `${(position.col * 100) / mazeSize}%`,
        top: `${(position.row * 100) / mazeSize}%`,
      }}
    >
      🧑
    </div>
  );
}

export default Player;
