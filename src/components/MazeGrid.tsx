import { useEffect, useState, useCallback } from "react";
import type { Position } from "./Player";
import Player from "./Player";

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

const MAZE_SIZE = 14; // 14x14 grid for more complexity
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

  // Generate random collectibles in the maze
  const generateCollectibles = useCallback((grid: boolean[][]) => {
    const newCollectibles: Collectible[] = [];
    const numCollectibles = 10;

    for (let i = 0; i < numCollectibles; i++) {
      let position: Position | null = null;
      let validPosition = false;

      // Find a valid path position for the collectible in inner area only
      while (!validPosition) {
        position = {
          row: Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1, // Stay within inner area (1 to MAZE_SIZE-2)
          col: Math.floor(Math.random() * (MAZE_SIZE - 2)) + 1, // Stay within inner area (1 to MAZE_SIZE-2)
        };

        // Make sure it's a path and not in start/destination area
        if (position && grid[position.row] && grid[position.row][position.col]) {
          // Avoid start area (top-left inner)
          if (!(position.row < 3 && position.col < 3)) {
            // Avoid destination area (bottom-right inner)
            if (
              !(position.row >= MAZE_SIZE - 3 && position.col >= MAZE_SIZE - 3)
            ) {
              validPosition = true;
            }
          }
        }
      }

      if (position) {
        const icon =
          COLLECTIBLE_ICONS[Math.floor(Math.random() * COLLECTIBLE_ICONS.length)];

        newCollectibles.push({
          id: `collectible-${i}`,
          position: position,
          icon: icon,
        });
      }
    }

    setCollectibles(newCollectibles);
  }, []);

  // Generate maze using recursive backtracking algorithm for better structure
  const generateMaze = useCallback(() => {
    // Create a grid where true = path, false = wall
    const grid: boolean[][] = Array(MAZE_SIZE)
      .fill(null)
      .map(() => Array(MAZE_SIZE).fill(false));

    // Set fixed boundary walls - outer border is always walls (false)
    // Top and bottom rows are walls
    for (let col = 0; col < MAZE_SIZE; col++) {
      grid[0][col] = false;
      grid[MAZE_SIZE - 1][col] = false;
    }
    // Left and right columns are walls
    for (let row = 0; row < MAZE_SIZE; row++) {
      grid[row][0] = false;
      grid[row][MAZE_SIZE - 1] = false;
    }

    // Generate maze for INNER cells only (row 1 to MAZE_SIZE-2, col 1 to MAZE_SIZE-2)
    for (let row = 1; row < MAZE_SIZE - 1; row++) {
      for (let col = 1; col < MAZE_SIZE - 1; col++) {
        // Start area (top-left inner) - safe zone
        if (row < 3 && col < 3) {
          grid[row][col] = true;
        }
        // Destination area (bottom-right inner) - goal zone
        else if (row >= MAZE_SIZE - 3 && col >= MAZE_SIZE - 3) {
          grid[row][col] = true;
        }
        // Create main corridors (vertical and horizontal main paths for inner area)
        else if (
          row === 2 ||
          row === Math.floor(MAZE_SIZE / 2) ||
          row === MAZE_SIZE - 3
        ) {
          grid[row][col] = true;
        } else if (
          col === 2 ||
          col === Math.floor(MAZE_SIZE / 2) ||
          col === MAZE_SIZE - 3
        ) {
          grid[row][col] = true;
        }
        // Create secondary paths with pattern (40% chance - makes more walls)
        else if (Math.random() < 0.4) {
          grid[row][col] = true;
        }
      }
    }

    // Carve out some random paths in inner area to ensure connectivity
    for (let i = 0; i < MAZE_SIZE * 2; i++) {
      const row = Math.floor(Math.random() * (MAZE_SIZE - 3)) + 2;
      const col = Math.floor(Math.random() * (MAZE_SIZE - 3)) + 2;
      grid[row][col] = true;
    }

    setMazeGrid(grid);

    // Notify parent component of maze grid for collision detection
    if (onMazeGridUpdate) {
      onMazeGridUpdate(grid);
    }

    // Set destination to bottom-right inner area (safe from boundary walls)
    const destPos: Position = {
      row: MAZE_SIZE - 3,
      col: MAZE_SIZE - 3,
    };
    setDestination(destPos);

    generateCollectibles(grid);
  }, [generateCollectibles, onMazeGridUpdate]);

  // Generate maze on component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="relative w-full aspect-square bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
      {/* Grid cell-based maze with improved wall rendering */}
      <div
        className="absolute inset-0 grid gap-0"
        style={{ gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)` }}
      >
        {mazeGrid.map((row, rowIdx) =>
          row.map((isPath, colIdx) => {
            // Determine if this cell should render a wall with full pillar styling
            const isWall = !isPath;

            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`w-full aspect-square ${isWall
                  ? "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-inner"
                  : "bg-slate-700 border border-slate-600 hover:bg-slate-600 transition-colors"
                  }`}
              />
            );
          })
        )}
      </div>

      {/* Destination marker (goal) */}
      {destination && (
        <div
          className="absolute flex items-center justify-center text-3xl animate-pulse drop-shadow-lg"
          style={{
            left: `${(destination.col * 100) / MAZE_SIZE}%`,
            top: `${(destination.row * 100) / MAZE_SIZE}%`,
            width: `${100 / MAZE_SIZE}%`,
            height: `${100 / MAZE_SIZE}%`,
          }}
        >
          🏰
        </div>
      )}

      {/* Collectibles layer */}
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)`,
        }}
      >
        {collectibles.map((collectible) => (
          <div
            key={collectible.id}
            className="absolute flex items-center justify-center text-2xl animate-bounce drop-shadow-lg"
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

      {/* Player */}
      {mazeGrid.length > 0 && (
        <Player
          position={playerPosition}
          onPositionChange={onPlayerPositionChange}
          mazeGrid={mazeGrid}
          mazeSize={MAZE_SIZE}
        />
      )}

      {/* Instructions overlay */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-xs text-purple-200 max-w-xs">
        <p className="font-bold text-white mb-1">Controls:</p>
        <p>📍 Arrow Keys or WASD</p>
        <p>💰 Collect items</p>
        <p>🏰 Reach castle!</p>
      </div>
    </div>
  );
}

export default MazeGrid;
