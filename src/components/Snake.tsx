/**
 * Snake Utility Module
 * Provides utility functions for snake game logic.
 * Main logic is implemented in SnakeBoard component using React hooks.
 */

export interface Position {
    x: number;
    y: number;
}

/**
 * Check if the snake head collides with a position
 */
export const checkCollision = (head: Position, body: Position[]): boolean => {
    for (let i = 0; i < body.length; i++) {
        if (head.x === body[i].x && head.y === body[i].y) {
            return true;
        }
    }
    return false;
};

/**
 * Check if position is within board bounds
 */
export const isWithinBounds = (
    pos: Position,
    boardWidth: number,
    boardHeight: number
): boolean => {
    return pos.x >= 0 && pos.x < boardWidth && pos.y >= 0 && pos.y < boardHeight;
};

/**
 * Check if snake eats food
 */
export const checkFoodCollision = (head: Position, food: Position): boolean => {
    return head.x === food.x && head.y === food.y;
};

/**
 * Calculate new head position based on direction
 */
export const calculateNewHead = (
    currentHead: Position,
    direction: Position
): Position => {
    return {
        x: currentHead.x + direction.x,
        y: currentHead.y + direction.y,
    };
};

/**
 * Check if direction would cause the snake to reverse into itself
 */
export const isReverseDirection = (
    newDir: Position,
    oldDir: Position
): boolean => {
    return newDir.x === -oldDir.x && newDir.y === -oldDir.y;
};
