/**
 * Simple Example: Using the Pixel Collision Hook
 * 
 * This is a minimal example showing how to use usePixelCollision
 * for any SVG-based maze or game with pixel-perfect collision.
 */

import { useState, useEffect } from 'react';
import { usePixelCollision } from '../hooks/usePixelCollision';

// Simple square maze SVG (100x100)
const SIMPLE_MAZE_SVG = `
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Walkable area (green) -->
  <rect x="10" y="10" width="80" height="80" fill="#00FF00"/>
  <!-- Obstacle (black) -->
  <rect x="40" y="40" width="20" height="20" fill="#000000"/>
</svg>
`;

export function SimpleCollisionExample() {
    const [playerPos, setPlayerPos] = useState({ x: 20, y: 20 });

    // Initialize collision detection
    const { isAreaWalkable, isReady } = usePixelCollision({
        svgString: SIMPLE_MAZE_SVG,
        width: 100,
        height: 100,
        walkableColor: { r: 0, g: 255, b: 0 }, // Green (#00FF00)
        colorTolerance: 10,
    });

    // Handle keyboard movement
    useEffect(() => {
        if (!isReady) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const speed = 5;
            let nextX = playerPos.x;
            let nextY = playerPos.y;

            switch (e.key) {
                case 'ArrowUp': nextY -= speed; break;
                case 'ArrowDown': nextY += speed; break;
                case 'ArrowLeft': nextX -= speed; break;
                case 'ArrowRight': nextX += speed; break;
                default: return;
            }

            // Only move if the area is walkable
            if (isAreaWalkable(nextX, nextY, 3)) {
                setPlayerPos({ x: nextX, y: nextY });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [playerPos, isAreaWalkable, isReady]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Pixel Collision Example</h1>

            {!isReady && <p>Loading collision map...</p>}

            <div className="relative w-[400px] h-[400px] border-4 border-gray-800">
                {/* SVG Maze */}
                <div
                    className="absolute inset-0"
                    dangerouslySetInnerHTML={{ __html: SIMPLE_MAZE_SVG }}
                    style={{
                        width: '100%',
                        height: '100%',
                        imageRendering: 'pixelated'
                    }}
                />

                {/* Player */}
                <div
                    className="absolute w-6 h-6 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                    style={{
                        left: `${playerPos.x}%`,
                        top: `${playerPos.y}%`,
                    }}
                />
            </div>

            <div className="mt-4 text-sm text-gray-600">
                <p>Use arrow keys to move</p>
                <p>Position: ({Math.round(playerPos.x)}, {Math.round(playerPos.y)})</p>
                <p>Collision Ready: {isReady ? 'Yes' : 'No'}</p>
            </div>
        </div>
    );
}
