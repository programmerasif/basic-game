import { useEffect, useState, useCallback, useRef, useMemo, forwardRef, useImperativeHandle } from "react";

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
    playerPosition: Position | null;
    onPlayerPositionChange: (newPosition: Position) => void;
    variant?: 'normal' | 'hard';
}

export interface MazeGridRef {
    requestMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
    getInitialPosition: () => Position;
}

const MAP_WIDTH = 827;  // Match SVG viewBox width
const MAP_HEIGHT = 1052; // Match SVG viewBox height (updated to 1052)
const COLLECTIBLE_ICONS = ["💰", "🍎", "🏠", "⭐", "💎"];

// CORRECT SVG structure from your map:
// 1. INNER_WALKABLE_BOUNDARY - The main playable area inside Bangladesh where player CAN walk (the hole/inner area)
// 2. OBSTACLE_PATHS - Internal walls/barriers within the walkable area that player must NOT cross

// The INNER walkable area of Bangladesh (extracted from second <path> in your SVG) - player MUST stay INSIDE this
// This is the hole/inner area where the player can walk - using exact .5 decimal values from your SVG
const INNER_WALKABLE_BOUNDARY = "M82 8.5C82 32.92 82 57.34 82 82.5C57.58 82.5 33.16 82.5 8 82.5C8 104.61 8 126.72 8 149.5C32.42 149.5 56.84 149.5 82 149.5C82 152.14 82 154.78 82 157.5C57.58 157.5 33.16 157.5 8 157.5C8 179.61 8 201.72 8 224.5C32.42 224.5 56.84 224.5 82 224.5C82 251.56 82 278.62 82 306.5C57.25 306.5 32.5 306.5 7 306.5C7 328.61 7 350.72 7 373.5C31.75 373.5 56.5 373.5 82 373.5C82 375.81 82 378.12 82 380.5C57.25 380.5 32.5 380.5 7 380.5C7 402.61 7 424.72 7 447.5C31.75 447.5 56.5 447.5 82 447.5C82 472.25 82 497 82 522.5C106.75 522.5 131.5 522.5 157 522.5C157 524.81 157 527.12 157 529.5C155.613 529.497 155.613 529.497 154.197 529.493C145.5 529.473 136.804 529.458 128.107 529.448C123.635 529.443 119.163 529.436 114.692 529.425C110.38 529.414 106.068 529.408 101.756 529.405C100.108 529.403 98.4589 529.4 96.8102 529.394C94.509 529.387 92.2078 529.386 89.9065 529.386C87.9379 529.383 87.9379 529.383 85.9296 529.38C83.11 529.164 83.11 529.164 82 530.5C81.9059 532.556 81.8826 534.614 81.8865 536.672C81.8863 537.654 81.8863 537.654 81.8861 538.655C81.8869 540.782 81.8945 542.908 81.9023 545.035C81.9034 546.332 81.9044 547.628 81.9054 548.964C81.9106 553.83 81.9246 558.696 81.9375 563.562C81.9581 574.432 81.9787 585.301 82 596.5C106.75 596.5 131.5 596.5 157 596.5C157 621.25 157 646 157 671.5C181.42 671.5 205.84 671.5 231 671.5C231 695.92 231 720.34 231 745.5C255.75 745.5 280.5 745.5 306 745.5C306 748.14 306 750.78 306 753.5C278.94 753.5 251.88 753.5 224 753.5C224 728.75 224 704 224 678.5C201.89 678.5 179.78 678.5 157 678.5C157 749.78 157 821.06 157 894.5C179.11 894.5 201.22 894.5 224 894.5C224 870.08 224 845.66 224 820.5C226.31 820.5 228.62 820.5 231 820.5C231 845.25 231 870 231 895.5C252.976 895.53 252.976 895.53 274.952 895.531C275.773 895.531 276.594 895.53 277.439 895.53C302.587 895.509 327.735 895.393 352.883 895.281C354.116 895.276 355.35 895.27 356.621 895.265C371.884 895.197 387.147 895.126 402.41 895.055C415.596 894.993 428.782 894.933 441.969 894.873C468.979 894.751 495.99 894.626 523 894.5C523 870.08 523 845.66 523 820.5C547.42 820.5 571.84 820.5 597 820.5C597 795.75 597 771 597 745.5C599.31 745.5 601.62 745.5 604 745.5C604 770.25 604 795 604 820.5C628.42 820.5 652.84 820.5 678 820.5C678 894.09 678 967.68 678 1043.5C700.11 1043.5 722.22 1043.5 745 1043.5C745.33 1019.41 745.66 995.32 746 970.5C770.42 970.17 794.84 969.84 820 969.5C820 873.47 820 777.44 820 678.5C795.25 678.5 770.5 678.5 745 678.5C745 654.08 745 629.66 745 604.5C696.16 604.5 647.32 604.5 597 604.5C597 552.69 597 500.88 597 447.5C645.84 447.5 694.68 447.5 745 447.5C745 376.22 745 304.94 745 231.5C698.47 231.5 651.94 231.5 604 231.5C604 256.25 604 281 604 306.5C579.58 306.5 555.16 306.5 530 306.5C530 328.61 530 350.72 530 373.5C554.42 373.5 578.84 373.5 604 373.5C604 375.81 604 378.12 604 380.5C577.27 380.5 550.54 380.5 523 380.5C523.062 344 523.062 344 523.09 332.514C523.093 329.089 523.093 329.089 523.095 325.664C523.097 324.15 523.1 322.635 523.106 321.12C523.113 318.814 523.114 316.508 523.114 314.201C523.117 312.256 523.117 312.256 523.12 310.271C522.995 306.332 522.489 302.411 522 298.5C546.75 298.5 571.5 298.5 597 298.5C597 276.39 597 254.28 597 231.5C498.66 231.5 400.32 231.5 299 231.5C299 229.19 299 226.88 299 224.5C323.75 224.5 348.5 224.5 374 224.5C374 202.39 374 180.28 374 157.5C348.92 157.5 323.84 157.5 298 157.5C298 132.75 298 108 298 82.5C273.25 82.5 248.5 82.5 223 82.5C223 58.08 223 33.66 223 8.5C176.47 8.5 129.94 8.5 82 8.5Z";

// Internal obstacle paths (walls/barriers) - player must NOT be in these (exact paths from your SVG)
const OBSTACLE_PATHS = [
    "M149 224.5C151.31 224.5 153.62 224.5 156 224.5C157 225.5 157 225.5 157.12 228.43C157.117 230.398 157.117 230.398 157.114 232.406C157.114 233.14 157.114 233.874 157.114 234.63C157.113 237.015 157.106 239.4 157.098 241.785C157.096 243.254 157.095 244.722 157.095 246.19C157.089 251.648 157.075 257.105 157.062 262.562C157.042 274.752 157.021 286.941 157 299.5C181.42 299.5 205.84 299.5 231 299.5C231 326.56 231 353.62 231 381.5C206.58 381.5 182.16 381.5 157 381.5C157 406.25 157 431 157 456.5C154.69 456.5 152.38 456.5 150 456.5C150 429.44 150 402.38 150 374.5C174.42 374.5 198.84 374.5 224 374.5C224 352.39 224 330.28 224 307.5C199.25 307.5 174.5 307.5 149 307.5C149 280.11 149 252.72 149 224.5Z",
    "M298 597.5C349.81 597.5 401.62 597.5 455 597.5C455 624.56 455 651.62 455 679.5C452.36 679.5 449.72 679.5 447 679.5C447 655.08 447 630.66 447 605.5C400.47 605.5 353.94 605.5 306 605.5C306 629.92 306 654.34 306 679.5C303.36 679.5 300.72 679.5 298 679.5C298 652.44 298 625.38 298 597.5Z",
    "M298 374.5C300.64 374.5 303.28 374.5 306 374.5C306 398.92 306 423.34 306 448.5C352.86 448.5 399.72 448.5 448 448.5C448 424.08 448 399.66 448 374.5C450.31 374.5 452.62 374.5 455 374.5C455 401.56 455 428.62 455 456.5C415.919 456.54 415.919 456.54 399.596 456.549C388.306 456.555 377.016 456.562 365.726 456.575C357.505 456.585 349.284 456.592 341.063 456.594C336.707 456.595 332.352 456.598 327.996 456.606C323.901 456.612 319.806 456.615 315.712 456.613C314.204 456.613 312.697 456.615 311.19 456.619C309.141 456.624 307.091 456.622 305.042 456.62C303.893 456.621 302.743 456.622 301.559 456.623C299 456.5 299 456.5 298 455.5C297.905 452.975 297.874 450.477 297.886 447.951C297.886 447.161 297.886 446.371 297.886 445.556C297.887 442.932 297.894 440.308 297.902 437.684C297.904 435.869 297.905 434.054 297.906 432.24C297.91 427.454 297.92 422.668 297.931 417.883C297.941 413.003 297.946 408.124 297.951 403.244C297.962 393.663 297.979 384.081 298 374.5Z",
    "M671 672.5C673.31 672.5 675.62 672.5 678 672.5C678 696.92 678 721.34 678 746.5C702.75 746.5 727.5 746.5 753 746.5C753.04 785.581 753.04 785.581 753.049 801.904C753.055 813.194 753.062 824.484 753.075 835.774C753.085 843.995 753.092 852.216 753.094 860.437C753.095 864.792 753.098 869.148 753.106 873.504C753.112 877.599 753.115 881.693 753.113 885.788C753.113 887.296 753.115 888.803 753.119 890.31C753.124 892.359 753.122 894.408 753.12 896.457C753.121 897.607 753.122 898.756 753.123 899.941C753 902.5 753 902.5 752 903.5C749.69 903.5 747.38 903.5 745 903.5C745 854 745 804.5 745 753.5C720.58 753.5 696.16 753.5 671 753.5C671 726.77 671 700.04 671 672.5Z",
    "M374 671.5C376.31 671.5 378.62 671.5 381 671.5C381 721 381 770.5 381 821.5C405.42 821.5 429.84 821.5 455 821.5C455 823.81 455 826.12 455 828.5C403.52 828.5 352.04 828.5 299 828.5C299 826.19 299 823.88 299 821.5C323.42 821.17 347.84 820.84 373 820.5C373.33 771.33 373.66 722.16 374 671.5Z",
    "M149 75.5C151.64 75.5 154.28 75.5 157 75.5C157 100.58 157 125.66 157 151.5C181.42 151.5 205.84 151.5 231 151.5C231 178.56 231 205.62 231 233.5C228.36 233.5 225.72 233.5 223 233.5C223 208.75 223 184 223 158.5C198.58 158.5 174.16 158.5 149 158.5C149 131.11 149 103.72 149 75.5Z",
    "M522 672.5C549.06 672.5 576.12 672.5 604 672.5C604 674.81 604 677.12 604 679.5C579.58 679.5 555.16 679.5 530 679.5C530 703.92 530 728.34 530 753.5C502.94 753.5 475.88 753.5 448 753.5C448 751.52 448 749.54 448 747.5C472.42 747.17 496.84 746.84 522 746.5C522 722.08 522 697.66 522 672.5Z",
    "M223 448.5C225.64 448.5 228.28 448.5 231 448.5C231 500.31 231 552.12 231 605.5C228.36 605.5 225.72 605.5 223 605.5C223 553.69 223 501.88 223 448.5Z",
    "M522 448.5C524.64 448.5 527.28 448.5 530 448.5C530 500.31 530 552.12 530 605.5C527.36 605.5 524.72 605.5 522 605.5C522 553.69 522 501.88 522 448.5Z",
    "M298 523.5C349.81 523.5 401.62 523.5 455 523.5C455 525.81 455 528.12 455 530.5C403.19 530.5 351.38 530.5 298 530.5C298 528.19 298 525.88 298 523.5Z",
    "M373 299.5C375.64 299.5 378.28 299.5 381 299.5C381 326.89 381 354.28 381 382.5C378.36 382.5 375.72 382.5 373 382.5C373 355.11 373 327.72 373 299.5Z",
    "M671 300.5C673.31 300.5 675.62 300.5 678 300.5C678 327.23 678 353.96 678 381.5C675.69 381.5 673.38 381.5 671 381.5C671 354.77 671 328.04 671 300.5Z",
    "M300 603.5C304.875 605.375 304.875 605.375 306 606.5C306.094 608.77 306.117 611.043 306.114 613.315C306.114 614.027 306.114 614.739 306.114 615.473C306.113 617.837 306.105 620.202 306.098 622.566C306.096 624.202 306.094 625.837 306.093 627.472C306.09 631.784 306.08 636.097 306.069 640.409C306.058 644.806 306.054 649.203 306.049 653.6C306.038 662.233 306.021 670.867 306 679.5C303.36 679.5 300.72 679.5 298 679.5C298.12 672.695 298.245 665.889 298.372 659.084C298.415 656.781 298.457 654.478 298.497 652.176C298.785 635.939 299.279 619.723 300 603.5Z",
    "M223 151.5C225.31 151.5 227.62 151.5 230 151.5C230 178.23 230 204.96 230 232.5C228.02 232.5 226.04 232.5 224 232.5C223.67 205.77 223.34 179.04 223 151.5Z"
];


// SVG data for rendering - show the walkable area in green and obstacles in darker green
const BANGLADESH_SVG = `<svg width="1000" height="1052" viewBox="0 0 827 1052" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="${INNER_WALKABLE_BOUNDARY}" fill="#074139" fill-rule="evenodd"/>
${OBSTACLE_PATHS.map(path => `<path d="${path}" fill="#022d27" fill-rule="evenodd"/>`).join('\n')}
</svg>`;

/**
 * BangladeshMazeGrid Component
 * Collision detection: Player must stay INSIDE inner boundary and OUTSIDE all obstacles
 */
const BangladeshMazeGrid = forwardRef<MazeGridRef, BangladeshMazeGridProps>(({
    onCollectibleFound,
    onDestinationReached,
    playerPosition,
    onPlayerPositionChange,
    variant = 'normal',
}, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const innerBoundaryRef = useRef<Path2D | null>(null);
    const obstaclePathsRef = useRef<Path2D[]>([]);
    const [collectibles, setCollectibles] = useState<Collectible[]>([]);
    const [destination, setDestination] = useState<Position>({ x: 680, y: 850 });
    const [isReady, setIsReady] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    // Movement constants
    const MOVE_SPEED = 10;
    const PLAYER_RADIUS = 12;

    // Initialize Path2D objects for boundary and obstacles
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Create INNER boundary Path2D (the walkable area of Bangladesh)
        const innerPath = new Path2D(INNER_WALKABLE_BOUNDARY);
        innerBoundaryRef.current = innerPath;

        // Create Path2D objects for all obstacles (internal walls)
        const obstaclePaths = OBSTACLE_PATHS.map(pathData => new Path2D(pathData));
        obstaclePathsRef.current = obstaclePaths;

        // Set ready state after path creation
        setTimeout(() => {
            setIsReady(true);
            console.log('✅ INNER boundary and obstacle paths created with evenodd fill rule');
        }, 0);
    }, []);

    /**
     * Check if a point is walkable
     * MUST be INSIDE the inner boundary AND OUTSIDE all obstacles (using evenodd fill rule)
     */
    const isWalkable = useCallback((x: number, y: number): boolean => {
        const canvas = canvasRef.current;
        const innerBoundary = innerBoundaryRef.current;
        const obstaclePaths = obstaclePathsRef.current;
        if (!canvas || !innerBoundary || !isReady) return false;

        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        // MUST be inside the INNER boundary (walkable area of Bangladesh) using evenodd fill rule
        const isInBoundary = ctx.isPointInPath(innerBoundary, x, y, 'evenodd');
        if (!isInBoundary) {
            return false;
        }

        // MUST NOT be inside any obstacle using evenodd fill rule
        for (const obstaclePath of obstaclePaths) {
            if (ctx.isPointInPath(obstaclePath, x, y, 'evenodd')) {
                return false;
            }
        }

        return true;
    }, [isReady]);

    /**
     * Check if a circular area is fully walkable (for player collision with radius)
     * Tests center + 8 points around circumference + 4 intermediate points
     */
    const isAreaWalkable = useCallback((x: number, y: number, radius: number = 12): boolean => {
        if (!isReady) return false;

        // Check center point first
        if (!isWalkable(x, y)) {
            return false;
        }

        // Check 12 points around the player (every 30 degrees for thorough checking)
        const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
        for (const angle of angles) {
            const rad = (angle * Math.PI) / 180;
            const checkX = x + radius * Math.cos(rad);
            const checkY = y + radius * Math.sin(rad);
            if (!isWalkable(checkX, checkY)) {
                return false;
            }
        }

        return true;
    }, [isWalkable, isReady]);

    // Generate random walkable position for items
    const getRandomWalkablePosition = useCallback((): Position => {
        let attempts = 0;
        const maxAttempts = 500;

        while (attempts < maxAttempts) {
            const x = 100 + Math.random() * (MAP_WIDTH - 200);
            const y = 100 + Math.random() * (MAP_HEIGHT - 200);

            if (isAreaWalkable(x, y, 15)) {
                return { x, y };
            }
            attempts++;
        }

        // Fallback to known safe positions
        const safeFallbacks = [
            { x: 413, y: 525 }, // Center
            { x: 200, y: 400 },
            { x: 600, y: 400 },
            { x: 400, y: 700 },
        ];

        for (const pos of safeFallbacks) {
            if (isAreaWalkable(pos.x, pos.y, 15)) {
                return pos;
            }
        }

        console.warn('Using center fallback position');
        return { x: 413, y: 525 };
    }, [isAreaWalkable]);

    // Generate collectibles - wrapped in useCallback without changing dependencies
    const generateCollectibles = useCallback(() => {
        if (!isReady) return;

        const newCollectibles: Collectible[] = [];
        const numCollectibles = 10;

        for (let i = 0; i < numCollectibles; i++) {
            let position: Position | null = null;
            let attempts = 0;
            const maxAttempts = 100;

            // Find walkable position for this collectible
            while (!position && attempts < maxAttempts) {
                const x = 100 + Math.random() * (MAP_WIDTH - 200);
                const y = 100 + Math.random() * (MAP_HEIGHT - 200);
                if (isAreaWalkable(x, y, 15)) {
                    position = { x, y };
                }
                attempts++;
            }

            if (position) {
                const icon = COLLECTIBLE_ICONS[Math.floor(Math.random() * COLLECTIBLE_ICONS.length)];
                newCollectibles.push({
                    id: `collectible-${i}-${Date.now()}`,
                    position,
                    icon,
                });
            }
        }

        setCollectibles(newCollectibles);
    }, [isReady, isAreaWalkable]);

    // Initialize collectibles when collision map is ready (ONLY ONCE)
    useEffect(() => {
        if (isReady && !isInitialized) {
            setTimeout(() => {
                // Set initial player position if not set
                if (!playerPosition) {
                    const initialPos = getRandomWalkablePosition();
                    console.log('Setting initial player position:', initialPos);
                    onPlayerPositionChange(initialPos);
                }

                generateCollectibles();
                const safeDestination = getRandomWalkablePosition();
                setDestination(safeDestination);
                setIsInitialized(true);
            }, 0);
        }
    }, [isReady, isInitialized, playerPosition, getRandomWalkablePosition, onPlayerPositionChange, generateCollectibles]);

    // Exposed move function with collision detection (for mobile controls)
    const handleMoveRequest = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
        if (!isReady || !playerPosition) return;

        let nextX = playerPosition.x;
        let nextY = playerPosition.y;

        switch (direction) {
            case 'up':
                nextY -= MOVE_SPEED;
                break;
            case 'down':
                nextY += MOVE_SPEED;
                break;
            case 'left':
                nextX -= MOVE_SPEED;
                break;
            case 'right':
                nextX += MOVE_SPEED;
                break;
        }

        // STRICT collision check - only move if entire player area is walkable
        if (isAreaWalkable(nextX, nextY, PLAYER_RADIUS)) {
            onPlayerPositionChange({ x: nextX, y: nextY });
        } else {
            console.log('Movement blocked:', direction, 'from', playerPosition, 'to', { x: nextX, y: nextY });
        }
    }, [playerPosition, isAreaWalkable, onPlayerPositionChange, isReady, MOVE_SPEED, PLAYER_RADIUS]);

    // Expose move function through ref for parent component to use
    useImperativeHandle(ref, () => ({
        requestMove: handleMoveRequest,
        getInitialPosition: getRandomWalkablePosition
    }), [handleMoveRequest, getRandomWalkablePosition]);

    // Handle keyboard movement with STRICT collision checking
    useEffect(() => {
        if (!isReady) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();

            let direction: 'up' | 'down' | 'left' | 'right' | null = null;

            switch (key) {
                case "arrowup":
                case "w":
                    direction = 'up';
                    break;
                case "arrowdown":
                case "s":
                    direction = 'down';
                    break;
                case "arrowleft":
                case "a":
                    direction = 'left';
                    break;
                case "arrowright":
                case "d":
                    direction = 'right';
                    break;
                default:
                    return;
            }

            event.preventDefault();

            if (direction) {
                handleMoveRequest(direction);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleMoveRequest, isReady]);

    // Handle mobile touch controls
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!touchStartRef.current || !isReady) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;

        // Threshold for movement
        const threshold = 15;
        if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return;

        // Determine dominant direction and use handleMoveRequest
        let direction: 'up' | 'down' | 'left' | 'right' | null = null;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? 'right' : 'left';
        } else {
            direction = deltaY > 0 ? 'down' : 'up';
        }

        if (direction) {
            handleMoveRequest(direction);
        }

        // Reset touch start
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }, [handleMoveRequest, isReady]);

    const handleTouchEnd = useCallback(() => {
        touchStartRef.current = null;
    }, []);

    // Check for destination reached
    useEffect(() => {
        if (!playerPosition) return;

        const distance = Math.sqrt(
            Math.pow(playerPosition.x - destination.x, 2) +
            Math.pow(playerPosition.y - destination.y, 2)
        );

        if (distance < 40) {
            onDestinationReached();
        }
    }, [playerPosition, destination, onDestinationReached]);

    // Check for collectible collection
    useEffect(() => {
        if (!playerPosition) return;

        const collectedIndex = collectibles.findIndex((item) => {
            const distance = Math.sqrt(
                Math.pow(playerPosition.x - item.position.x, 2) +
                Math.pow(playerPosition.y - item.position.y, 2)
            );
            return distance < 30;
        });

        if (collectedIndex !== -1) {
            // Use setTimeout to avoid synchronous state update in effect
            setTimeout(() => {
                setCollectibles((prev) => {
                    const newCollectibles = prev.filter((_, idx) => idx !== collectedIndex);

                    // Only regenerate all collectibles if this was the LAST one
                    if (newCollectibles.length === 0) {
                        setTimeout(() => generateCollectibles(), 100);
                    }

                    return newCollectibles;
                });
                onCollectibleFound();
            }, 0);
        }
    }, [playerPosition, collectibles, onCollectibleFound, generateCollectibles]);

    // Create SVG data URL for display
    const svgDataUrl = useMemo(() => {
        const svgBlob = new Blob([BANGLADESH_SVG], { type: 'image/svg+xml;charset=utf-8' });
        return URL.createObjectURL(svgBlob);
    }, []);

    return (
        <div
            className="relative w-full aspect-square bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-green-600"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Hidden canvas for Path2D collision detection */}
            <canvas
                ref={canvasRef}
                width={MAP_WIDTH}
                height={MAP_HEIGHT}
                style={{ display: 'none' }}
            />

            {/* Loading indicator */}
            {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="text-white text-xl">Loading collision map...</div>
                </div>
            )}

            {/* Bangladesh map visualization */}
            <div className="absolute inset-0 flex items-center justify-center p-1 md:p-4">
                <div className="relative w-full h-full">
                    {/* SVG Map */}
                    <img
                        src={svgDataUrl}
                        alt="Bangladesh Map"
                        className="absolute inset-0 w-full h-full object-contain opacity-80"
                        style={{ filter: "brightness(1.1)" }}
                        draggable={false}
                    />

                    {/* Destination marker */}
                    <div
                        className="absolute flex items-center justify-center text-2xl md:text-4xl animate-pulse drop-shadow-2xl transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
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
                            className="absolute flex items-center justify-center text-lg md:text-2xl animate-bounce drop-shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                            style={{
                                left: `${(collectible.position.x / MAP_WIDTH) * 100}%`,
                                top: `${(collectible.position.y / MAP_HEIGHT) * 100}%`,
                            }}
                        >
                            {collectible.icon}
                        </div>
                    ))}

                    {/* Player - rendered as SVG circle */}
                    {playerPosition && (
                        <svg
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none transition-all duration-75"
                            style={{
                                left: `${(playerPosition.x / MAP_WIDTH) * 100}%`,
                                top: `${(playerPosition.y / MAP_HEIGHT) * 100}%`,
                                width: '40px',
                                height: '40px',
                            }}
                            viewBox="0 0 40 40"
                        >
                            <circle
                                cx="20"
                                cy="20"
                                r="15"
                                fill="#FFD700"
                                stroke="#FF6B6B"
                                strokeWidth="3"
                            />
                            <circle cx="15" cy="16" r="3" fill="#000" />
                            <circle cx="25" cy="16" r="3" fill="#000" />
                            <path
                                d="M 12 24 Q 20 28 28 24"
                                stroke="#000"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                    )}
                </div>
            </div>

            {/* Instructions overlay */}
            <div className="hidden md:block absolute top-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-xs text-green-200 max-w-xs z-40 pointer-events-none">
                <p className="font-bold text-white mb-1">🗺️ Navigate Bangladesh:</p>
                <p>⌨️ Arrow Keys or WASD</p>
                <p>📱 Touch & Swipe (Mobile)</p>
                <p>💰 Collect items inside the map</p>
                <p>🏰 Reach the castle!</p>
                <p className="text-yellow-300 mt-2 text-[10px]">
                    ⚠️ Boundary + Obstacle collision active!
                    {variant === 'hard' && ' (HARD MODE)'}
                </p>
            </div>

            {/* Mobile instructions */}
            <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 rounded-lg px-4 py-2 text-xs text-green-200 z-40 pointer-events-none">
                <p className="text-center">📱 Swipe to move • 💰 Collect items • 🏰 Reach castle</p>
            </div>
        </div>
    );
});

BangladeshMazeGrid.displayName = 'BangladeshMazeGrid';

export default BangladeshMazeGrid;
