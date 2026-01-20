interface StageCompleteModalProps {
    isOpen: boolean;
    currentStage: number;
    nextStage: number;
    totalStages: number;
    stageScore: number;
    totalScore: number;
    stageName: string;
    nextStageName: string;
    onContinue: () => void;
}

/**
 * StageCompleteModal Component
 * Displays a popup modal when a game stage is completed
 * Shows the completed stage info and a button to proceed to the next stage
 */
function StageCompleteModal({
    isOpen,
    currentStage,
    nextStage,
    totalStages,
    stageScore,
    totalScore,
    stageName,
    nextStageName,
    onContinue,
}: StageCompleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl border-4 border-yellow-400 relative overflow-hidden animate-scale-in">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
                </div>

                <div className="relative z-10 text-center">
                    {/* Success Icon */}
                    <div className="text-6xl md:text-7xl mb-4 animate-bounce">
                        🎉 ✨ 🎊
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-2xl">
                        স্টেজ {currentStage} সম্পূর্ণ!
                    </h2>

                    {/* Stage Name */}
                    <p className="text-xl md:text-2xl font-bold text-yellow-200 mb-6">
                        {stageName}
                    </p>

                    {/* Score Display */}
                    <div className="bg-white bg-opacity-90 rounded-2xl p-6 mb-6 backdrop-blur-sm border-4 border-yellow-400 shadow-xl">
                        <p className="text-lg md:text-xl text-green-900 font-bold mb-2">
                            স্টেজ স্কোর
                        </p>
                        <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
                            +{stageScore}
                        </p>
                        <div className="mt-4 pt-4 border-t-2 border-green-300">
                            <p className="text-base md:text-lg text-green-800 font-semibold">
                                মোট স্কোর: {totalScore}
                            </p>
                        </div>
                    </div>

                    {/* Next Stage Info */}
                    <div className="bg-green-900 bg-opacity-80 rounded-xl p-6 mb-8 border-4 border-yellow-300 shadow-xl">
                        <p className="text-white text-lg md:text-xl font-bold mb-3">
                            🎮 পরবর্তী স্টেজ {nextStage} 🎮
                        </p>
                        <p className="text-yellow-200 text-base md:text-lg font-semibold">
                            {nextStageName}
                        </p>
                        <p className="text-green-300 text-sm md:text-base mt-2">
                            {nextStage} / {totalStages} স্টেজ
                        </p>
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={onContinue}
                        className="px-12 md:px-16 py-4 md:py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 font-extrabold text-xl md:text-2xl rounded-xl shadow-2xl hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-110 active:scale-95 border-4 border-yellow-300 w-full md:w-auto animate-pulse"
                    >
                        🚀 পরবর্তী স্টেজ শুরু করুন 🚀
                    </button>

                    <p className="text-white text-xs md:text-sm mt-6 opacity-90">
                        চালিয়ে যান! আরও মজা আসছে! 🎯
                    </p>
                </div>
            </div>
        </div>
    );
}

export default StageCompleteModal;
