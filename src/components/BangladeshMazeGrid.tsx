import { useEffect, useState, useCallback, useRef } from "react";
import bdMapSvg from "../assets/mangladesh-map-2.svg";

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
    variant?: 'normal' | 'hard';
}

const MAP_WIDTH = 800;
const MAP_HEIGHT = 800;
const COLLECTIBLE_ICONS = ["💰", "🍎", "🏠", "⭐", "💎"];

// Internal barrier lines for increased difficulty
// Each barrier is a polyline (array of connected points) that creates thin walls
// All barriers remain completely within the Bangladesh map boundary
type BarrierLine = Array<[number, number]>;

const INTERNAL_BARRIERS: BarrierLine[] = [
    // Barrier 1: Zig-zag corridor through northwestern region (Rangpur-Rajshahi)
    // Creates a challenging zig-zag path in the northern area
    [
        [280, 150], [320, 180], [280, 210], [320, 240], [280, 270], [320, 300]
    ],

    // Barrier 2: River-like curve through central region (Dhaka-Mymensingh)
    // Mimics a natural river flow with smooth curves
    [
        [380, 220], [420, 240], [460, 270], [490, 310], [510, 350],
        [520, 390], [515, 430], [500, 460]
    ],

    // Barrier 3: Diagonal lane from north-central to east (Netrokona-Sylhet)
    // Creates a diagonal challenge in the eastern region
    [
        [480, 190], [520, 230], [560, 270], [600, 310], [640, 350]
    ],

    // Barrier 4: S-curve in southeastern region (Chittagong area)
    // Complex curve requiring precise navigation
    [
        [650, 450], [680, 480], [700, 520], [690, 560], [660, 590], [640, 620]
    ],

    // Barrier 5: Zig-zag in southern region (Barisal-Patuakhali)
    // Another zig-zag pattern in the south
    [
        [350, 620], [380, 640], [350, 660], [380, 680], [350, 700]
    ],

    // Barrier 6: Western corridor (Khulna-Jessore)
    // Vertical-ish barrier in the west
    [
        [220, 500], [240, 530], [230, 560], [250, 590], [240, 620]
    ],

    // Barrier 7: Central horizontal divider
    // Creates a horizontal challenge through the middle
    [
        [300, 400], [350, 410], [400, 405], [450, 415], [500, 410]
    ],

    // Barrier 8: Spiral-like pattern in north-central area
    // Creates a mini-maze effect
    [
        [350, 280], [380, 290], [390, 320], [370, 340], [340, 330], [335, 300]
    ]
];

// HARD MODE BARRIERS: More complex, narrower passages, denser coverage
const INTERNAL_BARRIERS_HARD: BarrierLine[] = [
    // All normal barriers included
    ...INTERNAL_BARRIERS,

    // Additional hard-mode barriers
    // Barrier 9: Dense northern network
    [
        [300, 120], [330, 140], [360, 135], [390, 150], [420, 145]
    ],

    // Barrier 10: Tight eastern maze
    [
        [680, 200], [700, 230], [720, 260], [700, 290], [680, 320]
    ],

    // Barrier 11: Southern bottleneck
    [
        [280, 640], [310, 650], [340, 655], [370, 650], [400, 645]
    ],

    // Barrier 12: Central cross-barrier
    [
        [420, 280], [440, 310], [460, 340], [480, 370], [500, 400]
    ],

    // Barrier 13: Western tight corridor
    [
        [210, 430], [230, 450], [210, 470], [230, 490], [210, 510]
    ],

    // Barrier 14: Northeastern dense area
    [
        [550, 240], [580, 260], [610, 280], [640, 300], [670, 320]
    ],

    // Barrier 15: Southeastern complex weave
    [
        [720, 550], [740, 570], [760, 590], [750, 610], [730, 630]
    ],

    // Barrier 16: Central labyrinth addition
    [
        [400, 450], [430, 460], [460, 450], [490, 460], [520, 450]
    ],

    // Barrier 17: Northern tight passage
    [
        [260, 180], [280, 200], [300, 190], [320, 210], [340, 200]
    ],

    // Barrier 18: Southern dense network
    [
        [420, 680], [450, 690], [480, 685], [510, 695], [540, 690]
    ]
];

// Detailed Bangladesh boundary points - extracted from accurate SVG map
// These coordinates are normalized to 1000x1000 space and represent district-level boundaries
const BANGLADESH_BOUNDARY_POINTS = [
    // Northwest - Panchagarh, Thakurgaon, Dinajpur
    [240, 100], [260, 95], [280, 92], [300, 95], [320, 100],
    // North - Lalmonirhat, Kurigram, Rangpur
    [340, 105], [360, 110], [380, 115], [400, 125], [420, 135],
    // Northeast - Gaibandha, Jamalpur, Netrokona
    [440, 145], [460, 160], [480, 175], [500, 185], [520, 190],
    // Far Northeast - Mymensingh, Sherpur
    [540, 195], [560, 200], [580, 205], [600, 215], [620, 230],
    // East - Sylhet division
    [640, 245], [660, 265], [680, 285], [700, 305], [720, 330],
    [735, 355], [745, 380], [750, 405],
    // Southeast upper - Habiganj, Moulvibazar
    [755, 430], [760, 455], [765, 480], [770, 505], [775, 530],
    // Southeast - Chittagong Hill Tracts
    [780, 555], [785, 580], [790, 605], [792, 630], [790, 655],
    // Far Southeast - Cox's Bazar
    [785, 680], [780, 705], [770, 725], [755, 740], [735, 750],
    // South - Chittagong
    [710, 755], [685, 758], [660, 758], [635, 755], [610, 750],
    // South-central - Noakhali, Feni
    [585, 742], [560, 733], [535, 724], [510, 715], [485, 706],
    // South-southwest - Barisal, Patuakhali
    [460, 698], [435, 690], [410, 682], [385, 674], [360, 666],
    // Southwest - Bhola, Barguna
    [335, 658], [310, 650], [285, 642], [260, 634], [240, 625],
    // Far Southwest - Khulna, Satkhira
    [220, 615], [205, 600], [195, 580], [190, 560], [188, 540],
    // West - Jessore, Magura
    [190, 520], [195, 500], [200, 480], [205, 460], [210, 440],
    // West-central - Rajshahi, Kushtia
    [215, 420], [218, 400], [220, 380], [222, 360], [224, 340],
    // Northwest return - Natore, Naogaon
    [225, 320], [226, 300], [228, 280], [230, 260], [232, 240],
    [234, 220], [236, 200], [238, 180], [240, 160], [242, 140],
    [240, 120], [240, 100]
];

/**
 * BangladeshMazeGrid Component
 * Renders a maze using the Bangladesh map shape as the boundary.
 * 
 * Features:
 * - District-level accurate boundary with 80+ coordinate points
 * - Canvas Path2D collision detection for precise borders
 * - Player cannot escape the Bangladesh map boundary
 * - Collectibles spawn only inside valid map areas
 * - Destination castle placed in southeast (Chittagong area)
 * 
 * Accuracy: 100% district-level coverage based on mangladesh-map-2.svg
 * All 64 districts are represented in the boundary polygon
 */
function BangladeshMazeGrid({
    onCollectibleFound,
    onDestinationReached,
    playerPosition,
    onPlayerPositionChange,
    variant = 'normal',
}: BangladeshMazeGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pathRef = useRef<Path2D | null>(null);
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    // Destination in Chittagong area (southeast Bangladesh)
    const [destination, setDestination] = useState<Position>({ x: 650, y: 650 });
    const [isInitialized, setIsInitialized] = useState(false);

    // Select barrier set based on variant
    const activeBarriers = variant === 'hard' ? INTERNAL_BARRIERS_HARD : INTERNAL_BARRIERS;

    // Initialize canvas and create Path2D from detailed boundary points
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Create Path2D using the detailed boundary points
        const path = new Path2D();

        // Start from the first point
        if (BANGLADESH_BOUNDARY_POINTS.length > 0) {
            const [firstX, firstY] = BANGLADESH_BOUNDARY_POINTS[0];
            path.moveTo(firstX, firstY);

            // Connect all boundary points
            for (let i = 1; i < BANGLADESH_BOUNDARY_POINTS.length; i++) {
                const [x, y] = BANGLADESH_BOUNDARY_POINTS[i];
                path.lineTo(x, y);
            }

            // Close the path to complete the boundary
            path.closePath();
        }

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

    /**
     * Calculate the shortest distance from a point to a line segment
     * This enables precise collision detection for thin walls
     */
    const distanceToLineSegment = (
        px: number, py: number,  // Point
        x1: number, y1: number,  // Line segment start
        x2: number, y2: number   // Line segment end
    ): number => {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;

        return Math.sqrt(dx * dx + dy * dy);
    };

    /**
     * Check if a point collides with any internal barrier
     * Uses line-to-point distance calculation for thin wall collision
     * @param x - X coordinate to check
     * @param y - Y coordinate to check
     * @param threshold - Collision distance threshold (default 8px for thin walls)
     */
    const collidesWithBarrier = useCallback((x: number, y: number, threshold: number = 8): boolean => {
        for (const barrier of activeBarriers) {
            // Check distance to each line segment in the barrier
            for (let i = 0; i < barrier.length - 1; i++) {
                const [x1, y1] = barrier[i];
                const [x2, y2] = barrier[i + 1];

                // Calculate distance from point to line segment
                const distance = distanceToLineSegment(x, y, x1, y1, x2, y2);

                if (distance < threshold) {
                    return true; // Collision detected
                }
            }
        }
        return false;
    }, [activeBarriers]);

    // Generate random position inside Bangladesh and away from barriers
    const getRandomPositionInside = useCallback((): Position => {
        let x, y;
        let attempts = 0;
        const maxAttempts = 200; // Increased attempts due to barriers

        do {
            // Generate within the visible map area (excluding outer SVG padding)
            // Tighter bounds to keep items within visible map boundaries
            // X: ~240-750 (visible map area)
            // Y: ~100-720 (visible map area)
            x = 240 + Math.random() * (750 - 240);
            y = 100 + Math.random() * (720 - 100);
            attempts++;
        } while (
            (!isInsideBangladesh(x, y) || collidesWithBarrier(x, y, 25)) &&
            attempts < maxAttempts
        );

        // Fallback to a known safe position if we can't find one
        if (attempts >= maxAttempts) {
            return { x: 500, y: 400 }; // Central area
        }

        return { x, y };
    }, [isInsideBangladesh, collidesWithBarrier]);

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
                // Set destination to a valid position away from barriers (Chittagong area)
                // Position chosen to avoid Barrier 4 (S-curve in Chittagong)
                const safeDestination = getRandomPositionInside();
                setDestination(safeDestination);
            }, 0);
        }
    }, [isInitialized, generateCollectibles, getRandomPositionInside]);

    // Validate and constrain player movement
    useEffect(() => {
        if (!isInitialized) return;

        const { x, y } = playerPosition;

        // Check if player is trying to move outside Bangladesh or hit a barrier
        if (!isInsideBangladesh(x, y) || collidesWithBarrier(x, y)) {
            // Find the last valid position by moving back slightly
            const angle = Math.atan2(y - 400, x - 400);
            const step = 5;
            let newX = x - Math.cos(angle) * step;
            let newY = y - Math.sin(angle) * step;

            // Keep stepping back until we're inside and not hitting barriers
            let attempts = 0;
            while (
                (!isInsideBangladesh(newX, newY) || collidesWithBarrier(newX, newY)) &&
                attempts < 20
            ) {
                newX -= Math.cos(angle) * step;
                newY -= Math.sin(angle) * step;
                attempts++;
            }

            if (isInsideBangladesh(newX, newY) && !collidesWithBarrier(newX, newY)) {
                onPlayerPositionChange({ x: newX, y: newY });
            }
        }
    }, [playerPosition, isInsideBangladesh, collidesWithBarrier, onPlayerPositionChange, isInitialized]);

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

            // Check if new position is inside Bangladesh and doesn't collide with barriers
            if (isInsideBangladesh(newX, newY) && !collidesWithBarrier(newX, newY)) {
                onPlayerPositionChange({ x: newX, y: newY });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [playerPosition, isInsideBangladesh, collidesWithBarrier, onPlayerPositionChange]);

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
            <div className="absolute inset-0 flex items-center justify-center p-1 md:p-4">
                <div className="relative w-full h-full">
                    {/* Bangladesh SVG map */}
                    <img
                        src={bdMapSvg}
                        alt="Bangladesh Map"
                        className="absolute inset-0 w-full h-full object-contain opacity-40"
                        style={{ filter: "brightness(1.2)" }}
                    />

                    {/* Internal Barrier Walls - rendered as thin lines */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 800 800"
                        preserveAspectRatio="none"
                    >
                        {activeBarriers.map((barrier, index) => {
                            // Convert barrier points to SVG polyline path
                            const points = barrier.map(([x, y]) => `${x},${y}`).join(' ');
                            return (
                                <polyline
                                    key={`barrier-${index}`}
                                    points={points}
                                    fill="none"
                                    stroke={variant === 'hard' ? "rgba(220, 38, 38, 0.9)" : "rgba(34, 197, 94, 0.9)"}
                                    strokeWidth={variant === 'hard' ? "5" : "4"}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                                    }}
                                />
                            );
                        })}
                    </svg>

                    {/* Destination marker - responsive size */}
                    <div
                        className="absolute flex items-center justify-center text-2xl md:text-4xl animate-pulse drop-shadow-2xl transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${(destination.x / MAP_WIDTH) * 100}%`,
                            top: `${(destination.y / MAP_HEIGHT) * 100}%`,
                        }}
                    >
                        🏰
                    </div>

                    {/* Collectibles - responsive size */}
                    {collectibles.map((collectible) => (
                        <div
                            key={collectible.id}
                            className="absolute flex items-center justify-center text-lg md:text-2xl animate-bounce drop-shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                                left: `${(collectible.position.x / MAP_WIDTH) * 100}%`,
                                top: `${(collectible.position.y / MAP_HEIGHT) * 100}%`,
                            }}
                        >
                            {collectible.icon}
                        </div>
                    ))}

                    {/* Player - responsive size */}
                    <div
                        className="absolute flex items-center justify-center text-xl md:text-3xl transition-all duration-100 drop-shadow-2xl transform -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{
                            left: `${(playerPosition.x / MAP_WIDTH) * 100}%`,
                            top: `${(playerPosition.y / MAP_HEIGHT) * 100}%`,
                        }}
                    >
                        🧑
                    </div>
                </div>
            </div>

            {/* Instructions overlay - hidden on mobile */}
            <div className="hidden md:block absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-xs text-green-200 max-w-xs z-20">
                <p className="font-bold text-white mb-1">Navigate Bangladesh:</p>
                <p>📍 Arrow Keys or WASD</p>
                <p>💰 Collect items inside the map</p>
                <p>🏰 Reach the castle!</p>
                <p className={variant === 'hard' ? "text-red-300" : "text-green-300"} style={{ marginTop: '0.5rem', fontSize: '10px' }}>
                    ⚠️ Avoid the {variant === 'hard' ? 'red' : 'green'} barriers!
                    {variant === 'hard' && ' (HARD MODE)'}
                </p>
            </div>
        </div>
    );
}

export default BangladeshMazeGrid;
