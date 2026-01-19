interface MobileControlsProps {
    onUp: () => void;
    onDown: () => void;
    onLeft: () => void;
    onRight: () => void;
    label?: string;
}

/**
 * MobileControls Component
 * Provides on-screen directional buttons for touch/mobile devices.
 * Features responsive design that works alongside keyboard input.
 */
function MobileControls({
    onUp,
    onDown,
    onLeft,
    onRight,
    label = "Mobile Controls",
}: MobileControlsProps) {
    return (
        <div className="w-full flex-1 flex flex-col items-center gap-4 mt-8 px-4">
            {/* Label */}
            <p className="text-green-300 text-sm font-semibold">
                📱 {label}
            </p>

            {/* D-Pad Layout */}
            <div className="flex flex-col items-center gap-2 w-full">
                {/* Up Button */}
                <button
                    onMouseDown={onUp}
                    onTouchStart={onUp}
                    onTouchEnd={(e) => e.preventDefault()}
                    className="w-full h-14 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:from-emerald-400 hover:to-emerald-500 active:scale-95 transition-all transform border-2 border-emerald-700 flex items-center justify-center"
                    aria-label="Move Up"
                >
                    ⬆️
                </button>

                {/* Left, Right Buttons Row */}
                <div className="flex gap-2 w-full">
                    <button
                        onMouseDown={onLeft}
                        onTouchStart={onLeft}
                        onTouchEnd={(e) => e.preventDefault()}
                        className="w-1/2 h-14 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:from-emerald-400 hover:to-emerald-500 active:scale-95 transition-all transform border-2 border-emerald-700 flex items-center justify-center"
                        aria-label="Move Left"
                    >
                        ⬅️
                    </button>

                    <button
                        onMouseDown={onRight}
                        onTouchStart={onRight}
                        onTouchEnd={(e) => e.preventDefault()}
                        className="w-1/2 h-14 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:from-emerald-400 hover:to-emerald-500 active:scale-95 transition-all transform border-2 border-emerald-700 flex items-center justify-center"
                        aria-label="Move Right"
                    >
                        ➡️
                    </button>
                </div>

                {/* Down Button */}
                <button
                    onMouseDown={onDown}
                    onTouchStart={onDown}
                    onTouchEnd={(e) => e.preventDefault()}
                    className="w-full h-14 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white text-2xl font-bold rounded-lg shadow-lg hover:from-emerald-400 hover:to-emerald-500 active:scale-95 transition-all transform border-2 border-emerald-700 flex items-center justify-center"
                    aria-label="Move Down"
                >
                    ⬇️
                </button>
            </div>

            {/* Help text for desktop/mobile */}
            <p className="text-green-100 text-xs text-center opacity-70">
                Tap buttons or use arrow keys / WASD
            </p>
        </div>
    );
}

export default MobileControls;
