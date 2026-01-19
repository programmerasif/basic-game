import { useEffect, useState, useCallback } from "react";
import type { Position } from "./Player";

export interface Collectible {
  id: string;
  position: Position;
  icon: string;
}

interface MazeGridProps {
  onCollectibleFound: () => void;
  onDestinationReached: () => void;
  playerPosition: Position;
  onPlayerPositionChange: (newPosition: Position) => void;
  onMazeGridUpdate?: (grid: boolean[][]) => void;
}

const MAZE_SIZE = 30; // 30x30 grid for finer granularity and more movement space
const COLLECTIBLE_ICONS = ["💰", "🍎", "🏠", "⭐", "💎"];

/**
 * MazeGrid Component
 * Renders a grid-based maze with fixed boundary walls and procedural inner paths.
 * Features:
 * - Fixed square boundary: all outer edges (row 0, row MAZE_SIZE-1, col 0, col MAZE_SIZE-1) are walls
 * - Procedurally generated inner maze with random walls and paths
 * - Player cannot escape the boundary or pass through walls
 * - Destination goal at bottom-right inner area (🏰)
 * - Collectible placement and detection (only in inner area)
 * - Player character navigation with collision detection
 */
function MazeGrid({
  onCollectibleFound,
  onDestinationReached,
  playerPosition,
  onPlayerPositionChange,
  onMazeGridUpdate,
}: MazeGridProps) {
  // Initialize maze with walls and paths
  const [mazeGrid, setMazeGrid] = useState<boolean[][]>([]);
  // Collectibles in the maze
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  // Destination position (bottom-right area)
  const [destination, setDestination] = useState<Position | null>(null);

  // Generate collectibles in a circular pattern around the center of the maze
  const generateCollectibles = useCallback((grid: boolean[][]) => {
    const newCollectibles: Collectible[] = [];
    const centerRow = Math.floor(MAZE_SIZE / 2);
    const centerCol = Math.floor(MAZE_SIZE / 2);
    const usedPositions: Set<string> = new Set();

    // Helper function to check if position is valid and on a path
    const isValidPosition = (row: number, col: number): boolean => {
      if (row < 0 || row >= MAZE_SIZE || col < 0 || col >= MAZE_SIZE) return false;
      if (!grid[row] || !grid[row][col]) return false;
      if (usedPositions.has(`${row}-${col}`)) return false;
      return true;
    };

    // Find valid positions in expanding circles from center
    const findNearestValidPosition = (targetRow: number, targetCol: number): Position | null => {
      // Search in expanding squares around the target
      for (let offset = 0; offset < 10; offset++) {
        for (let dr = -offset; dr <= offset; dr++) {
          for (let dc = -offset; dc <= offset; dc++) {
            const row = targetRow + dr;
            const col = targetCol + dc;
            if (isValidPosition(row, col)) {
              return { row, col };
            }
          }
        }
      }
      return null;
    };

    // Place home icon at the center first
    const homePos = findNearestValidPosition(centerRow, centerCol);
    if (homePos) {
      newCollectibles.push({
        id: `collectible-home`,
        position: homePos,
        icon: "🏠",
      });
      usedPositions.add(`${homePos.row}-${homePos.col}`);
    }

    // Place other collectibles in a circular pattern around center
    const otherIcons = COLLECTIBLE_ICONS.filter(icon => icon !== "🏠");
    const numOtherCollectibles = 9;
    const radii = [5, 8, 11]; // Different radii for circular placement

    for (let i = 0; i < numOtherCollectibles; i++) {
      const radius = radii[i % radii.length];
      const angle = (i / numOtherCollectibles) * 2 * Math.PI;
      const targetRow = Math.round(centerRow + radius * Math.sin(angle));
      const targetCol = Math.round(centerCol + radius * Math.cos(angle));

      const pos = findNearestValidPosition(targetRow, targetCol);
      if (pos) {
        const icon = otherIcons[i % otherIcons.length];
        newCollectibles.push({
          id: `collectible-${i}`,
          position: pos,
          icon: icon,
        });
        usedPositions.add(`${pos.row}-${pos.col}`);
      }
    }

    setCollectibles(newCollectibles);
  }, []);

  // Generate maze matching the provided image pattern
  const generateMaze = useCallback(() => {
    // Create a grid where true = path, false = wall
    const grid: boolean[][] = Array(MAZE_SIZE)
      .fill(null)
      .map(() => Array(MAZE_SIZE).fill(true)); // Start with all paths

    // Exact maze pattern traced from the provided high-contrast images
    // 0 = wall (outside maze boundary or internal walls), 1 = path (navigable space)






    const mazePattern = [
      [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0],
      [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1],


    ];

    // Apply the maze pattern (0 = wall, 1 = path)
    for (let row = 0; row < MAZE_SIZE && row < mazePattern.length; row++) {
      for (let col = 0; col < MAZE_SIZE && col < mazePattern[row].length; col++) {
        grid[row][col] = mazePattern[row][col] === 1;
      }
    }

    // Do NOT modify the maze pattern - keep it exactly as designed

    setMazeGrid(grid);

    // Notify parent component of maze grid for collision detection
    if (onMazeGridUpdate) {
      onMazeGridUpdate(grid);
    }

    // Find a valid destination position on the maze path (bottom-right area)
    let destPos: Position = { row: 27, col: 23 }; // Default to a known path position
    // Search for a valid path in the bottom-right area
    for (let r = MAZE_SIZE - 1; r >= MAZE_SIZE - 5; r--) {
      for (let c = MAZE_SIZE - 1; c >= MAZE_SIZE - 10; c--) {
        if (grid[r] && grid[r][c]) {
          destPos = { row: r, col: c };
          break;
        }
      }
      if (grid[destPos.row] && grid[destPos.row][destPos.col]) break;
    }
    setDestination(destPos);

    generateCollectibles(grid);
  }, [generateCollectibles, onMazeGridUpdate]);

  // Generate maze on component mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateMaze();
  }, [generateMaze]);

  // Track current movement direction for auto-run
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right'>('right');
  const [isRunning, setIsRunning] = useState(true);

  // Handle keyboard controls - just change direction
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (!["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
        return;
      }

      event.preventDefault();

      // Change direction based on key pressed
      switch (key) {
        case "arrowup":
        case "w":
          setDirection('up');
          break;
        case "arrowdown":
        case "s":
          setDirection('down');
          break;
        case "arrowleft":
        case "a":
          setDirection('left');
          break;
        case "arrowright":
        case "d":
          setDirection('right');
          break;
      }

      // Start running if paused
      if (!isRunning) {
        setIsRunning(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning]);

  // Auto-run movement effect
  useEffect(() => {
    if (!isRunning || mazeGrid.length === 0) return;

    const moveInterval = setInterval(() => {
      let newRow = playerPosition.row;
      let newCol = playerPosition.col;

      switch (direction) {
        case 'up':
          newRow = Math.max(0, playerPosition.row - 1);
          break;
        case 'down':
          newRow = Math.min(MAZE_SIZE - 1, playerPosition.row + 1);
          break;
        case 'left':
          newCol = Math.max(0, playerPosition.col - 1);
          break;
        case 'right':
          newCol = Math.min(MAZE_SIZE - 1, playerPosition.col + 1);
          break;
      }

      // Check if the new position is a valid path (not a wall)
      if (mazeGrid[newRow] && mazeGrid[newRow][newCol]) {
        onPlayerPositionChange({ row: newRow, col: newCol });
      }
      // If hitting a wall, stop running - player needs to change direction
      else {
        setIsRunning(false);
      }
    }, 200); // Move every 200ms

    return () => clearInterval(moveInterval);
  }, [direction, isRunning, playerPosition, mazeGrid, onPlayerPositionChange]);

  // Check if player has reached the destination
  useEffect(() => {
    if (
      destination &&
      playerPosition.row === destination.row &&
      playerPosition.col === destination.col
    ) {
      onDestinationReached();
    }
  }, [playerPosition, destination, onDestinationReached]);

  // Check if player has collected an item
  useEffect(() => {
    const collectedIndex = collectibles.findIndex(
      (item) =>
        item.position.row === playerPosition.row &&
        item.position.col === playerPosition.col
    );

    if (collectedIndex !== -1) {
      // Remove the collected item
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollectibles((prev) =>
        prev.filter((_, idx) => idx !== collectedIndex)
      );
      onCollectibleFound();

      // Generate new collectibles if all are collected
      if (collectibles.length === 1) {
        generateCollectibles(mazeGrid);
      }
    }
  }, [playerPosition, collectibles, mazeGrid, onCollectibleFound, generateCollectibles]);

  return (
    <div className="relative w-full aspect-[1/1.15] bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-green-500">
      {/* Grid cell-based maze with thinner walls */}
      <div
        className="absolute inset-0 grid gap-0 p-4 md:p-14"
        style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)` }}
      >
        {mazeGrid.map((row, rowIdx) =>
          row.map((isPath, colIdx) => {
            // Determine if this cell should render a wall
            const isWall = !isPath;

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`w-full h-full ${isWall
                  ? "bg-green-900"
                  : "bg-gradient-to-br from-green-100 to-green-50"
                  }`}
                style={{
                  boxShadow: isWall ? 'inset 0 0 2px rgba(0, 0, 0, 0.3)' : 'inset 0 0 1px rgba(34, 197, 94, 0.2)'
                }}
              />
            );
          })
        )}
      </div>

      {/* Destination marker (goal) - positioned within the padded area */}
      {destination && (
        <div
          className="absolute inset-0 p-14 pointer-events-none"
        >
          <div
            className="absolute flex items-center justify-center text-2xl animate-pulse drop-shadow-lg"
            style={{
              left: `${(destination.col * 100) / MAZE_SIZE}%`,
              top: `${(destination.row * 100) / MAZE_SIZE}%`,
              width: `${100 / MAZE_SIZE}%`,
              height: `${100 / MAZE_SIZE}%`,
            }}
          >
            🏰
          </div>
        </div>
      )}

      {/* Collectibles layer - positioned within the padded area */}
      <div className="absolute inset-0 p-14 pointer-events-none">
        <div className="relative w-full h-full">
          {collectibles.map((collectible) => (
            <div
              key={collectible.id}
              className="absolute flex items-center justify-center text-xl animate-bounce drop-shadow-lg"
              style={{
                left: `${(collectible.position.col * 100) / MAZE_SIZE}%`,
                top: `${(collectible.position.row * 100) / MAZE_SIZE}%`,
                width: `${100 / MAZE_SIZE}%`,
                height: `${100 / MAZE_SIZE}%`,
              }}
            >
              {collectible.icon}
            </div>
          ))}
        </div>
      </div>

      {/* Player - positioned within the padded area */}
      {mazeGrid.length > 0 && (
        <div className="absolute inset-0 p-14 pointer-events-none">
          <div className="relative w-full h-full">
            <div
              className="absolute flex items-center justify-center text-xl transition-all duration-100 animate-pulse"
              style={{
                left: `${(playerPosition.col * 100) / MAZE_SIZE}%`,
                top: `${(playerPosition.row * 100) / MAZE_SIZE}%`,
                width: `${100 / MAZE_SIZE}%`,
                height: `${100 / MAZE_SIZE}%`,
              }}
            >
              🧑
            </div>
          </div>
        </div>
      )}

      {/* Instructions overlay */}
      <div className="absolute top-4 right-4 bg-green-950 bg-opacity-90 rounded-xl p-3 text-xs text-green-100 max-w-xs border border-green-500 shadow-lg">
        <p className="font-bold text-green-300 mb-1">🎮 Auto-Run Mode:</p>
        <p>🏃 Character runs automatically</p>
        <p>↔️ Press arrows to turn</p>
        <p>💰 Collect items</p>
        <p>🏰 Reach castle!</p>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg opacity-50"></div>
      <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg opacity-50"></div>
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg opacity-50"></div>
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg opacity-50"></div>
    </div>
  );
}

export default MazeGrid;
