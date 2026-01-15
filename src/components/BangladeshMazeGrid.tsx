import { useEffect, useState, useCallback, useRef } from "react";
import bdMapSvg from "../assets/bd-map.svg";

export interface Position {
    x: number;
    y: number;
}

export interface Collectible {
    id: string;
    position: Position;
    icon: string;
}

interface BangladeshMazeGridProps {
    onCollectibleFound: () => void;
    onDestinationReached: () => void;
    playerPosition: Position;
    onPlayerPositionChange: (newPosition: Position) => void;
}

const MAP_WIDTH = 800;
const MAP_HEIGHT = 800;
const COLLECTIBLE_ICONS = ["💰", "🍎", "🏠", "⭐", "💎"];

// Bangladesh map path data (simplified from SVG)
const BANGLADESH_PATH = "M212.9 910 C350 850, 450 750, 531.9 550.6 C600 400, 700 200, 787.1 92 L740.7 628.8 C700 700, 600 750, 486 674.7 C400 650, 350 600, 359.9 596.9 C320 580, 280 500, 332.8 354 C320 300, 300 200, 333.4 187.6 C400 150, 500 200, 516 321.7 C550 250, 650 250, 683.8 342.9 C720 400, 750 500, 740.7 628.8 C700 750, 600 800, 485.3 471.6 Z";

/**
 * BangladeshMazeGrid Component
 * Renders a maze using the Bangladesh map shape as the boundary.
 * Features:
 * - SVG-based collision detection
 * - Player cannot escape the Bangladesh map boundary
 * - Collectibles spawn inside the map
 * - Destination at a specific location within the map
 */
function BangladeshMazeGrid({
    onCollectibleFound,
    onDestinationReached,
    playerPosition,
    onPlayerPositionChange,
}: BangladeshMazeGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathRef = useRef<Path2D | null>(null);
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [destination, setDestination] = useState<Position>({ x: 650, y: 550 });
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize canvas and create Path2D from SVG
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Create a temporary SVG to extract the path
        const parser = new DOMParser();
        parser.parseFromString(
            `<svg viewBox="0 0 1000 1000"><path d="${BANGLADESH_PATH}"/></svg>`,
            "image/svg+xml"
        );

        // For collision detection, we'll use the viewBox coordinates (0-1000)
        // and scale them to our canvas size
        const path = new Path2D();

        // We'll create a simplified Bangladesh boundary
        // Starting from northwest, going clockwise
        path.moveTo(333, 188); // Rangpur (northwest)
        path.lineTo(516, 322); // Mymensingh (north-center)
        path.lineTo(684, 343); // Sylhet (northeast)
        path.lineTo(741, 629); // Chittagong (east)
        path.lineTo(486, 675); // Barisal (south-center)
        path.lineTo(360, 597); // Khulna (southwest)
        path.lineTo(333, 354); // Rajshahi (west)
        path.closePath();

        pathRef.current = path;

        // Use setTimeout to avoid cascading setState
        setTimeout(() => {
            setIsInitialized(true);
        }, 0);
    }, []);

    // Check if a point is inside the Bangladesh boundary
    const isInsideBangladesh = useCallback((x: number, y: number): boolean => {
        const canvas = canvasRef.current;
        const path = pathRef.current;
        if (!canvas || !path) return false;

        const ctx = canvas.getContext("2d");
        if (!ctx) return false;

        // Scale coordinates from our working space (800x800) to SVG viewBox (1000x1000)
        const scaledX = (x / MAP_WIDTH) * 1000;
        const scaledY = (y / MAP_HEIGHT) * 1000;

        return ctx.isPointInPath(path, scaledX, scaledY);
    }, []);

    // Generate random position inside Bangladesh
    const getRandomPositionInside = useCallback((): Position => {
        let x, y;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            // Generate within approximate bounding box of Bangladesh
            x = 250 + Math.random() * 500; // ~250-750
            y = 150 + Math.random() * 600; // ~150-750
            attempts++;
        } while (!isInsideBangladesh(x, y) && attempts < maxAttempts);

        // Fallback to a known safe position if we can't find one
        if (attempts >= maxAttempts) {
            return { x: 485, y: 472 }; // Dhaka area
        }

        return { x, y };
    }, [isInsideBangladesh]);

    // Generate collectibles
    const generateCollectibles = useCallback(() => {
        const newCollectibles: Collectible[] = [];
        const numCollectibles = 10;

        for (let i = 0; i < numCollectibles; i++) {
            const position = getRandomPositionInside();
            const icon = COLLECTIBLE_ICONS[Math.floor(Math.random() * COLLECTIBLE_ICONS.length)];

            newCollectibles.push({
                id: `collectible-${i}-${Date.now()}`,
                position,
                icon,
            });
        }

        setCollectibles(newCollectibles);
    }, [getRandomPositionInside]);

    // Initialize collectibles when ready
    useEffect(() => {
        if (isInitialized) {
            // Use setTimeout to avoid cascading setState
            setTimeout(() => {
                generateCollectibles();
                // Set destination to a valid position (Chittagong area)
                setDestination({ x: 650, y: 550 });
            }, 0);
        }
    }, [isInitialized, generateCollectibles]);

    // Validate and constrain player movement
    useEffect(() => {
        if (!isInitialized) return;

        const { x, y } = playerPosition;

        // Check if player is trying to move outside Bangladesh
        if (!isInsideBangladesh(x, y)) {
            // Find the last valid position by moving back slightly
            const angle = Math.atan2(y - 400, x - 400);
            const step = 5;
            let newX = x - Math.cos(angle) * step;
            let newY = y - Math.sin(angle) * step;

            // Keep stepping back until we're inside
            let attempts = 0;
            while (!isInsideBangladesh(newX, newY) && attempts < 20) {
                newX -= Math.cos(angle) * step;
                newY -= Math.sin(angle) * step;
                attempts++;
            }

            if (isInsideBangladesh(newX, newY)) {
                onPlayerPositionChange({ x: newX, y: newY });
            }
        }
    }, [playerPosition, isInsideBangladesh, onPlayerPositionChange, isInitialized]);

    // Handle keyboard movement with collision detection
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const moveSpeed = 15;

            let newX = playerPosition.x;
            let newY = playerPosition.y;

            switch (key) {
                case "arrowup":
                case "w":
                    newY -= moveSpeed;
                    break;
                case "arrowdown":
                case "s":
                    newY += moveSpeed;
                    break;
                case "arrowleft":
                case "a":
                    newX -= moveSpeed;
                    break;
                case "arrowright":
                case "d":
                    newX += moveSpeed;
                    break;
                default:
                    return;
            }

            event.preventDefault();

            // Check if new position is inside Bangladesh
            if (isInsideBangladesh(newX, newY)) {
                onPlayerPositionChange({ x: newX, y: newY });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playerPosition, isInsideBangladesh, onPlayerPositionChange]);

    // Check if player reached destination
    useEffect(() => {
        const distance = Math.sqrt(
            Math.pow(playerPosition.x - destination.x, 2) +
            Math.pow(playerPosition.y - destination.y, 2)
        );

        if (distance < 40) {
            onDestinationReached();
        }
    }, [playerPosition, destination, onDestinationReached]);

    // Check if player collected an item
    useEffect(() => {
        const collectedIndex = collectibles.findIndex((item) => {
            const distance = Math.sqrt(
                Math.pow(playerPosition.x - item.position.x, 2) +
                Math.pow(playerPosition.y - item.position.y, 2)
            );
            return distance < 30;
        });

        if (collectedIndex !== -1) {
            // Use setTimeout to avoid cascading setState
            setTimeout(() => {
                setCollectibles((prev) => prev.filter((_, idx) => idx !== collectedIndex));
                onCollectibleFound();

                // Generate new collectibles if running low
                if (collectibles.length === 1) {
                    generateCollectibles();
                }
            }, 0);
        }
    }, [playerPosition, collectibles, onCollectibleFound, generateCollectibles]);

    return (
        <div className="relative w-full aspect-square bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-green-600">
            {/* Hidden canvas for collision detection */}
            <canvas
                ref={canvasRef}
                width={1000}
                height={1000}
                style={{ display: "none" }}
            />

            {/* Bangladesh map as visual boundary */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="relative w-full h-full">
                    {/* Bangladesh SVG map */}
                    <img
                        src={bdMapSvg}
                        alt="Bangladesh Map"
                        className="absolute inset-0 w-full h-full object-contain opacity-40"
                        style={{ filter: "brightness(1.2)" }}
                    />

                    {/* Destination marker */}
                    <div
                        className="absolute flex items-center justify-center text-4xl animate-pulse drop-shadow-2xl transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${(destination.x / MAP_WIDTH) * 100}%`,
                            top: `${(destination.y / MAP_HEIGHT) * 100}%`,
                        }}
                    >
                        🏰
                    </div>

                    {/* Collectibles */}
                    {collectibles.map((collectible) => (
                        <div
                            key={collectible.id}
                            className="absolute flex items-center justify-center text-2xl animate-bounce drop-shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                                left: `${(collectible.position.x / MAP_WIDTH) * 100}%`,
                                top: `${(collectible.position.y / MAP_HEIGHT) * 100}%`,
                            }}
                        >
                            {collectible.icon}
                        </div>
                    ))}

                    {/* Player */}
                    <div
                        className="absolute flex items-center justify-center text-3xl transition-all duration-100 drop-shadow-2xl transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{
                            left: `${(playerPosition.x / MAP_WIDTH) * 100}%`,
                            top: `${(playerPosition.y / MAP_HEIGHT) * 100}%`,
                        }}
                    >
                        <div className="relative">
                            <div className="absolute -inset-2 bg-yellow-400 rounded-full opacity-30 animate-pulse"></div>
                            <div className="relative">🧑</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Instructions overlay */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-xs text-green-200 max-w-xs z-20">
                <p className="font-bold text-white mb-1">Navigate Bangladesh:</p>
                <p>📍 Arrow Keys or WASD</p>
                <p>💰 Collect items inside the map</p>
                <p>🏰 Reach the castle!</p>
                <p className="text-green-300 mt-2 text-[10px]">Stay within the borders!</p>
            </div>
        </div>
    );
}

export default BangladeshMazeGrid;
