// interface LevelStartModalProps {
//     isOpen: boolean;
//     currentLevel: number;
//     levelName: string;
//     onStart: () => void;
// }

// /**
//  * LevelStartModal Component
//  * Displays a popup modal when starting a new level
//  * Shows the level slogan and instructions before the game begins
//  */
// function LevelStartModal({
//     isOpen,
//     currentLevel,
//     levelName,
//     onStart,
// }: LevelStartModalProps) {
//     if (!isOpen) return null;

//     // Level slogans mapping
//     const levelSlogans: Record<number, { slogan: string; instruction: string }> = {
//         1: {
//             slogan: "উপরে ধর্মের বেশ, নারী দেখলেই জেগে উঠে দুষ্টু মন",
//             instruction: "৫ টি ধর্ষক গুপ্তকে ধরলে, পরের স্টেজ হবে খুনি গুপ্ত।"
//         },
//         2: {
//             slogan: "খুনের নেশায় মত্ত, ওত পেতে থাকা গুপ্ত",
//             instruction: "৫ টি খুনি গুপ্তকে ধরলে, পরের স্টেজ হবে রাজাকার গুপ্ত।"
//         },
//         3: {
//             slogan: "৭১ এ দেশের সাথে বেইমানির আদর্শ এখনো লুকিয়ে আছে অন্তরে",
//             instruction: "৫ টি রাজাকার গুপ্তকে ধরলে, পরের স্টেজ হবে রগকাটা-সন্ত্রাসি গুপ্ত।"
//         },
//         4: {
//             slogan: "সাধারণের মাঝে লুকিয়ে আছে হিংস্র হায়নারা",
//             instruction: "৫টি রগকাটা-সন্ত্রাসি গুপ্তকে ধরলে, পরের স্টেজ হবে চাঁদাবাজ গুপ্ত।"
//         },
//         5: {
//             slogan: "ধর্মের নামে হাদিয়া বলে চাঁদা চেয়ে বেড়ায় গুপ্তরা",
//             instruction: "৫ টি চাঁদাবাজ গুপ্তকে ধরে গেম শেষ করুন।"
//         }
//     };

//     const currentLevelData = levelSlogans[currentLevel];

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-black bg-opacity-80 backdrop-blur-md overflow-y-auto">
//             <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 max-w-[95vw] xs:max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full shadow-2xl border-4 border-yellow-300 relative overflow-hidden my-auto">
//                 {/* Animated background elements */}
//                 <div className="absolute inset-0 opacity-20">
//                     <div className="absolute top-0 right-0 w-20 xs:w-24 sm:w-32 h-20 xs:h-24 sm:h-32 bg-white rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
//                     <div className="absolute bottom-0 left-0 w-24 xs:w-32 sm:w-40 h-24 xs:h-32 sm:h-40 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
//                 </div>

//                 <div className="relative z-10 text-center">
//                     {/* Level Icon */}
//                     <div className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl mb-3 xs:mb-4 sm:mb-5 animate-bounce">
//                         🎯
//                     </div>

//                     {/* Title */}
//                     <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 xs:mb-3 drop-shadow-2xl">
//                         স্টেজ {currentLevel}
//                     </h2>

//                     {/* Level Name */}
//                     <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-yellow-200 mb-4 xs:mb-5 sm:mb-6 drop-shadow-lg">
//                         {levelName}
//                     </p>

//                     {/* Slogan Section - HIGHLIGHTED */}
//                     {currentLevelData && (
//                         <div className="bg-white rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 mb-4 xs:mb-5 sm:mb-6 shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform">
//                             {/* Slogan - Main highlight */}
//                             <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 mb-3 xs:mb-4 shadow-lg">
//                                 <p className="text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold leading-relaxed drop-shadow-lg">
//                                     "{currentLevelData.slogan}"
//                                 </p>
//                             </div>

//                             {/* Instruction */}
//                             <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 xs:p-4 sm:p-5 border-2 border-green-300">
//                                 <p className="text-gray-800 text-xs xs:text-sm sm:text-base md:text-lg font-bold leading-relaxed">
//                                     {currentLevelData.instruction}
//                                 </p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Start Button */}
//                     <button
//                         onClick={onStart}
//                         className="w-full px-6 xs:px-8 sm:px-10 md:px-12 py-3 xs:py-4 sm:py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 font-extrabold text-base xs:text-lg sm:text-xl md:text-2xl rounded-xl sm:rounded-2xl shadow-2xl hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-105 active:scale-95 border-4 border-yellow-300 animate-pulse"
//                     >
//                         🚀 শুরু করুন
//                     </button>

//                     <p className="text-green-100 text-[10px] xs:text-xs sm:text-sm mt-3 xs:mt-4 opacity-90">
//                         প্রস্তুত হন! গুপ্তদের ধরার সময় এসেছে! 🎮
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default LevelStartModal;
// interface LevelStartModalProps {
//     isOpen: boolean;
//     currentLevel: number;
//     levelName: string;
//     onStart: () => void;
// }

// /**
//  * LevelStartModal Component
//  * Displays a popup modal when starting a new level
//  * Shows the level slogan and instructions before the game begins
//  */
// function LevelStartModal({
//     isOpen,
//     currentLevel,
//     levelName,
//     onStart,
// }: LevelStartModalProps) {
//     if (!isOpen) return null;

//     // Level slogans mapping
//     const levelSlogans: Record<number, { slogan: string; instruction: string }> = {
//         1: {
//             slogan: "উপরে ধর্মের বেশ, নারী দেখলেই জেগে উঠে দুষ্টু মন",
//             instruction: "৫ টি ধর্ষক গুপ্তকে ধরলে, পরের স্টেজ হবে খুনি গুপ্ত।"
//         },
//         2: {
//             slogan: "খুনের নেশায় মত্ত, ওত পেতে থাকা গুপ্ত",
//             instruction: "৫ টি খুনি গুপ্তকে ধরলে, পরের স্টেজ হবে রাজাকার গুপ্ত।"
//         },
//         3: {
//             slogan: "৭১ এ দেশের সাথে বেইমানির আদর্শ এখনো লুকিয়ে আছে অন্তরে",
//             instruction: "৫ টি রাজাকার গুপ্তকে ধরলে, পরের স্টেজ হবে রগকাটা-সন্ত্রাসি গুপ্ত।"
//         },
//         4: {
//             slogan: "সাধারণের মাঝে লুকিয়ে আছে হিংস্র হায়নারা",
//             instruction: "৫টি রগকাটা-সন্ত্রাসি গুপ্তকে ধরলে, পরের স্টেজ হবে চাঁদাবাজ গুপ্ত।"
//         },
//         5: {
//             slogan: "ধর্মের নামে হাদিয়া বলে চাঁদা চেয়ে বেড়ায় গুপ্তরা",
//             instruction: "৫ টি চাঁদাবাজ গুপ্তকে ধরে গেম শেষ করুন।"
//         }
//     };

//     const currentLevelData = levelSlogans[currentLevel];

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-4 bg-black bg-opacity-80 backdrop-blur-md overflow-y-auto">
//             <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-4 xs:p-5 sm:p-6 md:p-8 lg:p-10 max-w-[95vw] xs:max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full shadow-2xl border-4 border-yellow-300 relative overflow-hidden my-auto">
//                 {/* Animated background elements */}
//                 <div className="absolute inset-0 opacity-20">
//                     <div className="absolute top-0 right-0 w-20 xs:w-24 sm:w-32 h-20 xs:h-24 sm:h-32 bg-white rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
//                     <div className="absolute bottom-0 left-0 w-24 xs:w-32 sm:w-40 h-24 xs:h-32 sm:h-40 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
//                 </div>

//                 <div className="relative z-10 text-center">
//                     {/* Level Icon */}
//                     <div className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl mb-3 xs:mb-4 sm:mb-5 animate-bounce">
//                         🎯
//                     </div>

//                     {/* Title */}
//                     <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 xs:mb-3 drop-shadow-2xl">
//                         স্টেজ {currentLevel}
//                     </h2>

//                     {/* Level Name */}
//                     <p className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-yellow-200 mb-4 xs:mb-5 sm:mb-6 drop-shadow-lg">
//                         {levelName}
//                     </p>

//                     {/* Slogan Section - HIGHLIGHTED */}
//                     {currentLevelData && (
//                         <div className="bg-white rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-8 mb-4 xs:mb-5 sm:mb-6 shadow-2xl border-4 border-yellow-400 transform hover:scale-105 transition-transform">
//                             {/* Slogan - Main highlight */}
//                             <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-lg sm:rounded-xl p-3 xs:p-4 sm:p-5 mb-3 xs:mb-4 shadow-lg">
//                                 <p className="text-white text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold leading-relaxed drop-shadow-lg">
//                                     "{currentLevelData.slogan}"
//                                 </p>
//                             </div>

//                             {/* Instruction */}
//                             <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 xs:p-4 sm:p-5 border-2 border-green-300">
//                                 <p className="text-gray-800 text-xs xs:text-sm sm:text-base md:text-lg font-bold leading-relaxed">
//                                     {currentLevelData.instruction}
//                                 </p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Start Button */}
//                     <button
//                         onClick={onStart}
//                         className="w-full px-6 xs:px-8 sm:px-10 md:px-12 py-3 xs:py-4 sm:py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 font-extrabold text-base xs:text-lg sm:text-xl md:text-2xl rounded-xl sm:rounded-2xl shadow-2xl hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-105 active:scale-95 border-4 border-yellow-300 animate-pulse"
//                     >
//                         🚀 শুরু করুন
//                     </button>

//                     <p className="text-green-100 text-[10px] xs:text-xs sm:text-sm mt-3 xs:mt-4 opacity-90">
//                         প্রস্তুত হন! গুপ্তদের ধরার সময় এসেছে! 🎮
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default LevelStartModal;
interface LevelStartModalProps {
    isOpen: boolean;
    currentLevel: number;
    levelName: string;
    onStart: () => void;
}

function LevelStartModal({
    isOpen,
    currentLevel,
    levelName,
    onStart,
}: LevelStartModalProps) {
    if (!isOpen) return null;

    const levelSlogans: Record<number, { slogan: string; instruction: string }> = {
        1: {
            slogan: "উপরে ধর্মের বেশ, নারী দেখলেই জেগে উঠে দুষ্টু মন",
            instruction: "৫ টি ধর্ষক গুপ্তকে ধরলে, পরের স্টেজ হবে খুনি গুপ্ত।",
        },
        2: {
            slogan: "খুনের নেশায় মত্ত, ওত পেতে থাকা গুপ্ত",
            instruction: "৫ টি খুনি গুপ্তকে ধরলে, পরের স্টেজ হবে রাজাকার গুপ্ত।",
        },
        3: {
            slogan: "৭১ এ দেশের সাথে বেইমানির আদর্শ এখনো লুকিয়ে আছে অন্তরে",
            instruction: "৫ টি রাজাকার গুপ্তকে ধরলে, পরের স্টেজ হবে রগকাটা-সন্ত্রাসি গুপ্ত।",
        },
        4: {
            slogan: "সাধারণের মাঝে লুকিয়ে আছে হিংস্র হায়নারা",
            instruction: "৫টি রগকাটা-সন্ত্রাসি গুপ্তকে ধরলে, পরের স্টেজ হবে চাঁদাবাজ গুপ্ত।",
        },
        5: {
            slogan: "ধর্মের নামে হাদিয়া বলে চাঁদা চেয়ে বেড়ায় গুপ্তরা",
            instruction: "৫ টি চাঁদাবাজ গুপ্তকে ধরে গেম শেষ করুন।",
        },
    };

    const data = levelSlogans[currentLevel];

    return (
        <div className="fixed  inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className=" md:w-1/2 max-w-xl rounded-2xl bg-gradient-to-br from-green-700 to-emerald-700 p-6 sm:p-8 shadow-2xl border border-green-400">

                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🎮</div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                       {levelName}
                    </h2>

                </div>

                {/* Content */}
                {data && (
                    <div className="bg-white rounded-xl p-5 sm:p-6 mb-6 shadow-lg">
                        <p className="text-green-800 font-extrabold text-base sm:text-lg mb-4 text-center leading-relaxed">
                            “{data.slogan}”
                        </p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-gray-800 text-sm sm:text-base font-semibold text-center">
                                {data.instruction}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action */}
                <button
                    onClick={onStart}
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all py-3 sm:py-4 text-white font-extrabold text-lg sm:text-xl shadow-lg"
                >
                    শুরু করুন 🚀
                </button>

                <p className="text-center text-green-100 text-xs sm:text-sm mt-4 opacity-90">
                    প্রস্তুত হন! খেলা শুরু হতে যাচ্ছে…
                </p>
            </div>
        </div>
    );
}

export default LevelStartModal;
