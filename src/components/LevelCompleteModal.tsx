interface LevelCompleteModalProps {
    isOpen: boolean;
    currentLevel: number;
    nextLevel: number;
    totalLevels: number;
    levelScore: number;
    totalScore: number;
    levelName: string;
    nextLevelName: string;
    onContinue: () => void;
    onReturnHome: () => void;
}

/**
 * LevelCompleteModal Component
 * Displays a popup modal when a game level is completed
 * Shows the completed level info and buttons to proceed or return home
 */
function LevelCompleteModal({
    isOpen,
    currentLevel,
    nextLevel,
    totalLevels,
    levelScore,
    totalScore,
    levelName,
    nextLevelName,
    onContinue,
    onReturnHome,
}: LevelCompleteModalProps) {
    if (!isOpen) return null;

    const isLastLevel = currentLevel >= totalLevels;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-black bg-opacity-75 backdrop-blur-sm overflow-y-auto">
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-12 max-w-[95vw] xs:max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full shadow-2xl border-2 xs:border-3 sm:border-4 border-yellow-400 relative overflow-hidden animate-pulse my-auto">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-16 xs:w-20 sm:w-24 md:w-32 h-16 xs:h-20 sm:h-24 md:h-32 bg-white rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute bottom-0 left-0 w-20 xs:w-24 sm:w-32 md:w-40 h-20 xs:h-24 sm:h-32 md:h-40 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
                </div>

                <div className="relative z-10 text-center">
                    {/* Success Icon */}
                    <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2 xs:mb-3 sm:mb-4 animate-bounce">
                        🎉 ✨ 🎊
                    </div>

                    {/* Title */}
                    <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2 xs:mb-3 sm:mb-4 drop-shadow-2xl">
                        Level {currentLevel} Complete!
                    </h2>

                    {/* Level Name */}
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-yellow-200 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                        {levelName}
                    </p>

                    {/* Score Display */}
                    <div className="bg-white bg-opacity-90 rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 mb-3 xs:mb-4 sm:mb-5 md:mb-6 backdrop-blur-sm border-2 xs:border-3 sm:border-4 border-yellow-400 shadow-xl">
                        <p className="text-sm xs:text-base sm:text-lg md:text-xl text-green-900 font-bold mb-1 xs:mb-2">
                            Level Score
                        </p>
                        <p className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                            +{levelScore}
                        </p>
                        <div className="mt-2 xs:mt-3 sm:mt-4 pt-2 xs:pt-3 sm:pt-4 border-t-2 border-green-300">
                            <p className="text-sm xs:text-base md:text-lg text-green-800 font-semibold">
                                Total Score: {totalScore}
                            </p>
                        </div>
                    </div>

                    {/* Next Level Info */}
                    {!isLastLevel && (
                        <div className="bg-green-900 bg-opacity-80 rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 md:p-6 mb-4 xs:mb-5 sm:mb-6 md:mb-8 border-2 xs:border-3 sm:border-4 border-yellow-300 shadow-xl">
                            <p className="text-white text-sm xs:text-base sm:text-lg md:text-xl font-bold mb-1 xs:mb-2 sm:mb-3">
                                🎮 Next: Level {nextLevel} 🎮
                            </p>
                            <p className="text-yellow-200 text-xs xs:text-sm sm:text-base md:text-lg font-semibold">
                                {nextLevelName}
                            </p>
                            <p className="text-green-300 text-xs sm:text-sm md:text-base mt-1 xs:mt-2">
                                {currentLevel} / {totalLevels} Levels Completed
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Continue Button */}
                        {!isLastLevel && (
                            <button
                                onClick={onContinue}
                                className="flex-1 px-4 xs:px-6 sm:px-8 md:px-10 py-2.5 xs:py-3 sm:py-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 font-extrabold text-sm xs:text-base sm:text-lg md:text-xl rounded-lg sm:rounded-xl shadow-2xl hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-105 active:scale-95 border-2 xs:border-3 sm:border-4 border-yellow-300"
                            >
                                🚀 Continue to Level {nextLevel}
                            </button>
                        )}

                        {/* Return Home Button */}
                        <button
                            onClick={onReturnHome}
                            className={`${isLastLevel ? 'w-full' : 'flex-1'} px-4 xs:px-6 sm:px-8 md:px-10 py-2.5 xs:py-3 sm:py-4 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 text-white font-extrabold text-sm xs:text-base sm:text-lg md:text-xl rounded-lg sm:rounded-xl shadow-2xl hover:from-red-600 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-95 border-2 xs:border-3 sm:border-4 border-red-400`}
                        >
                            🏠 Return to Home
                        </button>
                    </div>

                    <p className="text-white text-[10px] xs:text-xs sm:text-sm mt-3 xs:mt-4 sm:mt-5 md:mt-6 opacity-90">
                        {isLastLevel ? "🏆 Congratulations! You've completed all levels! 🏆" : "Keep going! More fun awaits! 🎯"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LevelCompleteModal;
