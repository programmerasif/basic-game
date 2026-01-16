import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePixelCollisionOptions {
    svgString: string;
    width: number;
    height: number;
    walkableColor: { r: number; g: number; b: number };
    colorTolerance?: number;
}

interface UsePixelCollisionReturn {
    isWalkable: (x: number, y: number) => boolean;
    isAreaWalkable: (x: number, y: number, radius: number) => boolean;
    isReady: boolean;
}

/**
 * Custom React Hook: Pixel-based collision detection using canvas getImageData()
 * 
 * This hook renders an SVG to an offscreen canvas and reads pixel data
 * to provide precise collision detection based on pixel color values.
 * 
 * @param options Configuration object
 * @param options.svgString - The SVG markup as a string
 * @param options.width - Canvas width (should match SVG viewBox width)
 * @param options.height - Canvas height (should match SVG viewBox height)
 * @param options.walkableColor - RGB color that represents walkable areas
 * @param options.colorTolerance - Tolerance for color matching (default: 10)
 * 
 * @returns Object with collision detection functions and readiness state
 * 
 * @example
 * ```tsx
 * const { isWalkable, isAreaWalkable, isReady } = usePixelCollision({
 *   svgString: '<svg>...</svg>',
 *   width: 800,
 *   height: 600,
 *   walkableColor: { r: 7, g: 65, b: 57 }, // #074139
 *   colorTolerance: 10
 * });
 * 
 * // Check if a single point is walkable
 * if (isWalkable(100, 200)) {
 *   // Player can move here
 * }
 * 
 * // Check if an area around a point is walkable (for player collision)
 * if (isAreaWalkable(100, 200, 10)) {
 *   // Player (with 10px radius) can move here
 * }
 * ```
 */
export function usePixelCollision({
    svgString,
    width,
    height,
    walkableColor,
    colorTolerance = 10,
}: UsePixelCollisionOptions): UsePixelCollisionReturn {
    const [collisionData, setCollisionData] = useState<Uint8ClampedArray | null>(null);
    const [isReady, setIsReady] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvasRef.current = canvas;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            console.error('Failed to get 2D context for collision detection');
            return;
        }

        // Convert SVG string to image and draw to canvas
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
            // Clear canvas and draw SVG
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Read pixel data using getImageData
            const imageData = ctx.getImageData(0, 0, width, height);
            setCollisionData(imageData.data);
            setIsReady(true);

            // Clean up blob URL
            URL.revokeObjectURL(url);
            console.log(`✅ Collision map loaded: ${width}x${height} pixels`);
        };

        img.onerror = () => {
            console.error('❌ Failed to load SVG image for collision detection');
            URL.revokeObjectURL(url);
        };

        img.src = url;

        // Cleanup
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [svgString, width, height]);

    /**
     * Check if a single pixel is walkable
     * 
     * Walkable conditions:
     * - Pixel is within canvas bounds
     * - Pixel has alpha > 0 (not transparent)
     * - Pixel color matches walkableColor within tolerance
     * 
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns true if walkable, false if blocked or out of bounds
     */
    const isWalkable = useCallback(
        (x: number, y: number): boolean => {
            if (!collisionData || !isReady) return false;

            // Round to integer pixel coordinates
            const pixelX = Math.round(x);
            const pixelY = Math.round(y);

            // Check bounds
            if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) {
                return false;
            }

            // Calculate pixel index in flat RGBA array
            // Each pixel has 4 values: [R, G, B, A]
            const index = (pixelY * width + pixelX) * 4;

            const r = collisionData[index];
            const g = collisionData[index + 1];
            const b = collisionData[index + 2];
            const a = collisionData[index + 3];

            // Transparent pixels are blocked (outside map boundary)
            if (a === 0) {
                return false;
            }

            // Check if pixel color matches walkable color within tolerance
            const isWalkableColor =
                Math.abs(r - walkableColor.r) <= colorTolerance &&
                Math.abs(g - walkableColor.g) <= colorTolerance &&
                Math.abs(b - walkableColor.b) <= colorTolerance;

            return isWalkableColor && a > 0;
        },
        [collisionData, isReady, width, height, walkableColor, colorTolerance]
    );

    /**
     * Check if a circular area is walkable (for player/entity collision)
     * 
     * Tests the center point and 8 points around the circumference
     * to ensure the entire circular area is safe to move into.
     * 
     * @param x - Center X coordinate
     * @param y - Center Y coordinate
     * @param radius - Collision radius in pixels
     * @returns true if entire area is walkable, false otherwise
     */
    const isAreaWalkable = useCallback(
        (x: number, y: number, radius: number = 8): boolean => {
            if (!isReady) return false;

            // Check center point
            if (!isWalkable(x, y)) return false;

            // Check 8 points around the circumference at given angles
            const angles = [0, 45, 90, 135, 180, 225, 270, 315];
            for (const angle of angles) {
                const rad = (angle * Math.PI) / 180;
                const checkX = x + radius * Math.cos(rad);
                const checkY = y + radius * Math.sin(rad);
                if (!isWalkable(checkX, checkY)) {
                    return false;
                }
            }

            return true;
        },
        [isWalkable, isReady]
    );

    return {
        isWalkable,
        isAreaWalkable,
        isReady,
    };
}
