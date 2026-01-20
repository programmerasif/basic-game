# Pixel-Based Collision Detection for SVG Maze Game

## Overview

This implementation provides **pixel-perfect collision detection** for a React + TypeScript maze game where the map is rendered as an SVG. The collision system uses an offscreen HTML canvas and `getImageData()` to read pixel data, ensuring the player can never cross borders or move outside the SVG shape.

## Architecture

### Key Components

1. **`usePixelCollision` Hook** (`src/hooks/usePixelCollision.ts`)
   - Reusable custom React hook for pixel-based collision detection
   - Renders SVG to offscreen canvas
   - Reads pixel data using `CanvasRenderingContext2D.getImageData()`
   - Provides `isWalkable()` and `isAreaWalkable()` functions

2. **`BangladeshMazeGrid` Component** (`src/components/BangladeshMazeGrid.tsx`)
   - Game component that uses the collision hook
   - Handles player movement (keyboard + mobile touch)
   - Manages collectibles and destination
   - Renders the SVG map and game elements

## How It Works

### 1. SVG to Canvas Conversion

```typescript
// SVG string is converted to a Blob
const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
const url = URL.createObjectURL(svgBlob);

// Image is loaded and drawn to offscreen canvas
const img = new Image();
img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    // Store pixel data for collision detection
};
```

### 2. Pixel-Based Collision Detection

The collision system reads the RGBA values of pixels:

```typescript
const index = (pixelY * width + pixelX) * 4;
const r = collisionData[index];     // Red channel
const g = collisionData[index + 1]; // Green channel
const b = collisionData[index + 2]; // Blue channel
const a = collisionData[index + 3]; // Alpha channel
```

**Collision Rules:**
- **Transparent pixels** (alpha === 0) → **BLOCKED** (outside map)
- **Pixels matching #074139** (rgb(7,65,57)) → **WALKABLE** (inside map)
- **Any other colored pixels** → **BLOCKED** (obstacles/borders)

### 3. Area-Based Collision (Player Safety)

Instead of checking just one pixel, we check a circular area around the player:

```typescript
// Check center point + 8 points around circumference
const angles = [0, 45, 90, 135, 180, 225, 270, 315];
for (const angle of angles) {
    const rad = (angle * Math.PI) / 180;
    const checkX = x + radius * Math.cos(rad);
    const checkY = y + radius * Math.sin(rad);
    if (!isWalkable(checkX, checkY)) {
        return false; // Not safe to move
    }
}
```

This ensures the player's entire hitbox is within walkable space.

## Usage

### Basic Usage

```tsx
import { usePixelCollision } from './hooks/usePixelCollision';

function MyMazeGame() {
    const { isWalkable, isAreaWalkable, isReady } = usePixelCollision({
        svgString: YOUR_SVG_STRING,
        width: 827,
        height: 1051,
        walkableColor: { r: 7, g: 65, b: 57 }, // #074139
        colorTolerance: 10,
    });

    // Check if player can move to a position
    const handleMove = (nextX: number, nextY: number) => {
        if (isAreaWalkable(nextX, nextY, 10)) {
            // Move player
            setPlayerPosition({ x: nextX, y: nextY });
        }
    };
}
```

### Player Movement Logic

```typescript
// Keyboard movement
const handleKeyDown = (event: KeyboardEvent) => {
    const moveSpeed = 12;
    let nextX = playerPosition.x;
    let nextY = playerPosition.y;

    switch (event.key.toLowerCase()) {
        case "arrowup":
        case "w":
            nextY -= moveSpeed;
            break;
        case "arrowdown":
        case "s":
            nextY += moveSpeed;
            break;
        case "arrowleft":
        case "a":
            nextX -= moveSpeed;
            break;
        case "arrowright":
        case "d":
            nextX += moveSpeed;
            break;
        default:
            return;
    }

    // Only move if the next position is walkable
    if (isAreaWalkable(nextX, nextY, 10)) {
        onPlayerPositionChange({ x: nextX, y: nextY });
    }
};
```

### Mobile Touch Controls

```typescript
const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Determine swipe direction and move
    let nextX = playerPosition.x;
    let nextY = playerPosition.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        nextX += deltaX > 0 ? moveSpeed : -moveSpeed;
    } else {
        nextY += deltaY > 0 ? moveSpeed : -moveSpeed;
    }

    if (isAreaWalkable(nextX, nextY, 10)) {
        onPlayerPositionChange({ x: nextX, y: nextY });
    }
};
```

## API Reference

### `usePixelCollision` Hook

```typescript
interface UsePixelCollisionOptions {
    svgString: string;          // SVG markup as string
    width: number;              // Canvas width (match SVG viewBox)
    height: number;             // Canvas height (match SVG viewBox)
    walkableColor: {            // RGB color of walkable areas
        r: number;
        g: number;
        b: number;
    };
    colorTolerance?: number;    // Color matching tolerance (default: 10)
}

interface UsePixelCollisionReturn {
    isWalkable: (x: number, y: number) => boolean;
    isAreaWalkable: (x: number, y: number, radius: number) => boolean;
    isReady: boolean;
    canvas: HTMLCanvasElement | null;
}
```

#### Functions

**`isWalkable(x, y)`**
- Checks if a single pixel at coordinates (x, y) is walkable
- Returns `false` if out of bounds, transparent, or non-walkable color
- Returns `true` if pixel matches walkable color

**`isAreaWalkable(x, y, radius)`**
- Checks if a circular area around (x, y) is fully walkable
- Tests center + 8 circumference points
- Used for player collision with safety margin
- Returns `true` only if all tested points are walkable

**`isReady`**
- Boolean indicating if collision map is loaded and ready
- Wait for this before allowing player movement

**`canvas`**
- Reference to offscreen canvas element (optional, for debugging)

## Performance Optimizations

1. **Offscreen Canvas**
   - Canvas is created once, never rendered to DOM
   - Pixel data cached in memory after initial load

2. **Integer Coordinates**
   - All pixel coordinates rounded to integers
   - Avoids sub-pixel calculations

3. **`willReadFrequently` Flag**
   - Canvas context created with `{ willReadFrequently: true }`
   - Optimizes for frequent `getImageData()` calls

4. **No Full Canvas Scans**
   - Only checks specific pixels when needed
   - No iteration over entire canvas per frame

5. **Memoization**
   - SVG data URL memoized with `useMemo()`
   - Collision data stored in state, calculated once

## Coordinate System

The game uses SVG viewBox coordinates:

```
(0, 0) ──────────► X (827)
│
│  Bangladesh Map SVG
│  Walkable Area: #074139
│
▼
Y (1051)
```

- **Origin**: Top-left (0, 0)
- **Width**: 827 pixels
- **Height**: 1051 pixels
- **Player positions**: Direct SVG coordinates
- **Rendering**: Percentage-based for responsive scaling

## Rendering

The player is rendered as an SVG element to maintain visual quality:

```tsx
<svg
    className="absolute transform -translate-x-1/2 -translate-y-1/2"
    style={{
        left: `${(playerPosition.x / MAP_WIDTH) * 100}%`,
        top: `${(playerPosition.y / MAP_HEIGHT) * 100}%`,
        width: '40px',
        height: '40px',
    }}
    viewBox="0 0 40 40"
>
    <circle cx="20" cy="20" r="15" fill="#FFD700" />
</svg>
```

## Testing Collision Detection

To verify collision is working:

1. **Visual Test**: Try to move player outside map boundaries
2. **Obstacle Test**: Player should not pass through internal obstacles
3. **Edge Test**: Test movement along map edges
4. **Console**: Check for "✅ Collision map loaded" message

Debug by exposing the canvas:

```tsx
// Temporarily show collision canvas
<canvas
    ref={canvasRef}
    width={MAP_WIDTH}
    height={MAP_HEIGHT}
    style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0.5,
        pointerEvents: 'none'
    }}
/>
```

## Customization

### Change Walkable Color

```typescript
const { isAreaWalkable, isReady } = usePixelCollision({
    svgString: YOUR_SVG,
    width: 800,
    height: 600,
    walkableColor: { r: 255, g: 0, b: 0 }, // Red
    colorTolerance: 15,
});
```

### Adjust Player Collision Radius

```typescript
// Smaller radius = tighter collision (harder)
if (isAreaWalkable(nextX, nextY, 5)) { }

// Larger radius = looser collision (easier)
if (isAreaWalkable(nextX, nextY, 15)) { }
```

### Different Movement Speed

```typescript
const moveSpeed = variant === 'hard' ? 8 : 12;
```

## Requirements Met ✅

- ✅ SVG loaded as raw text (inline string)
- ✅ Drawn to offscreen canvas at exact viewBox size (827 x 1051)
- ✅ Uses `getImageData()` for pixel data
- ✅ Transparent pixels (alpha === 0) treated as BLOCKED
- ✅ Pixels with #074139 treated as WALKABLE
- ✅ `isWalkable(x, y)` helper function implemented
- ✅ Movement calculates nextX/nextY before updating
- ✅ Position updates only if `isWalkable()` returns true
- ✅ Border crossing completely prevented
- ✅ Performance optimized (no full canvas scans)
- ✅ React hooks (useEffect, useRef, useState, useCallback, useMemo)
- ✅ Strict TypeScript typing
- ✅ Player rendered as SVG element
- ✅ SVG map is purely visual, collision handled by canvas
- ✅ Keyboard controls implemented
- ✅ Mobile touch controls implemented

## Files Structure

```
src/
├── hooks/
│   └── usePixelCollision.ts      # Reusable collision hook
├── components/
│   └── BangladeshMazeGrid.tsx    # Main game component
└── README-COLLISION.md            # This documentation
```

## Browser Compatibility

Requires:
- Canvas API support
- SVG support
- Blob API
- ES6+ JavaScript features

All modern browsers (Chrome, Firefox, Safari, Edge) are fully supported.
