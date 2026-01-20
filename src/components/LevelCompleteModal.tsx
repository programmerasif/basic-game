

import { useMemo } from "react";

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

function LevelCompleteModal({
    isOpen,
    currentLevel,
    totalLevels,
    levelScore,
    totalScore,
    levelName,
    onContinue,
}: LevelCompleteModalProps) {

    /* ------------------ ✅ Hooks FIRST ------------------ */
    const confettiDots = useMemo(() => {
        const colors = [
            "bg-yellow-300",
            "bg-pink-400",
            "bg-orange-400",
            "bg-red-400",
            "bg-green-400",
        ];

        return Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            color: colors[i % colors.length],
            // eslint-disable-next-line react-hooks/purity
            top: Math.random() * 90 + 5,
            // eslint-disable-next-line react-hooks/purity
            left: Math.random() * 90 + 5,
        }));
    }, []);
    /* --------------------------------------------------- */

    if (!isOpen) return null;

    const isLastLevel = currentLevel >= totalLevels;

    const newsLinks: Record<number, string> = {
        1: "https://www.jamatnama.net/rape-harassment",
        2: "https://www.jamatnama.net/abuse-of-religion",
        3: "https://www.jamatnama.net/crime-activities",
        4: "https://www.jamatnama.net/extortion-corruption",
        5: "https://www.jamatnama.net/abuse-of-religion",
    };

    const handleNewsClick = () => {
        const newsUrl = newsLinks[currentLevel];
        if (newsUrl) {
            window.open(newsUrl, "_blank", "noopener,noreferrer");
        }
    };

    const progressCircles = Array.from({ length: totalLevels }, (_, i) => (
        <span
            key={i}
            className={`inline-flex items-center justify-center w-7 h-7 mx-1 rounded-full border-2 font-bold text-sm
                ${
                    i + 1 === currentLevel
                        ? "bg-green-500 text-white border-green-700"
                        : "bg-gray-900 text-gray-300 border-gray-600"
                }`}
        >
            {i + 1}
        </span>
    ));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-950 rounded-2xl p-0 max-w-md w-full shadow-2xl border border-green-700 overflow-hidden">
                
                {/* Confetti */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {confettiDots.map(dot => (
                        <div
                            key={dot.id}
                            className={`absolute rounded-full ${dot.color}`}
                            style={{
                                width: 7,
                                height: 7,
                                top: `${dot.top}%`,
                                left: `${dot.left}%`,
                                opacity: 0.7,
                            }}
                        />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-7 pb-4">
                    <div className="text-4xl mb-2 text-yellow-400">🏆</div>

                    <div className="text-xl font-extrabold text-orange-400 mb-1">
                        {levelName}
                    </div>

                    <div className="text-base font-bold text-white mb-2">
                        স্কোর: {levelScore} | মোট: {totalScore}
                    </div>

                    <div className="bg-green-800 rounded-lg px-4 py-1 mb-3 text-sm text-white font-semibold">
                        স্টেজ {currentLevel} সম্পন্ন!
                    </div>

                    <div className="w-full flex justify-center bg-green-950 py-3 rounded-lg mb-2">
                        {progressCircles}
                    </div>

                    <button
                        onClick={handleNewsClick}
                        className="w-full px-4 py-2 mb-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-green-700"
                    >
                        📰 নিউজ দেখুন
                    </button>

                    {!isLastLevel && (
                        <button
                            onClick={onContinue}
                            className="w-full px-4 py-3 mt-1 bg-orange-500 text-white font-extrabold rounded-lg hover:bg-orange-600"
                        >
                            পরের স্টেজ খেলুন →
                        </button>
                    )}
                    
                </div>
            </div>
        </div>
    );
}

export default LevelCompleteModal;
