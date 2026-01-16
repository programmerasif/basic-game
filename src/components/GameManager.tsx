import { useState, useEffect, useRef } from "react";
import WhackAMoleLevel from "./WhackAMoleLevel";
import MazeLevel from "./MazeLevel";
import SnakeLevel from "./SnakeLevel";
import StageCompleteModal from "./StageCompleteModal";

interface SharedGameState {
  score: number;
  currentStage: number;
}

// Stage Configuration System
interface StageConfig {
  id: number;
  type: 'whack-a-mole' | 'maze' | 'snake' | 'maze-hard';
  name: string;
  description: string;
  targetPoints: number;
  difficulty?: 'easy' | 'normal' | 'hard';
  mazeVariant?: 'normal' | 'hard';
}

const STAGE_CONFIGS: StageConfig[] = [
  {
    id: 1,
    type: 'whack-a-mole',
    name: 'ধর্ষক গুপ্ত',
    description: '৫ টি ধর্ষক গুপ্তকে ধরলে, পরের স্টেজ হবে খুনি গুপ্ত।',
    targetPoints: 5,
    difficulty: 'easy'  // Changed from 'normal' to 'easy' for first stage
  },
  {
    id: 2,
    type: 'maze',
    name: 'খুনি গুপ্ত',
    description: '৫ টি খুনি গুপ্তকে ধরলে, পরের স্টেজ হবে রাজাকার গুপ্ত।',
    targetPoints: 5,
    difficulty: 'normal',
    mazeVariant: 'normal'
  },
  {
    id: 3,
    type: 'snake',
    name: 'রাজাকার গুপ্ত',
    description: '৫ টি রাজাকার গুপ্তকে ধরলে, পরের স্টেজ হবে রগকাটা-সন্ত্রাসি গুপ্ত।',
    targetPoints: 5,
    difficulty: 'normal'
  },
  {
    id: 4,
    type: 'maze-hard',
    name: 'রগকাটা-সন্ত্রাসি গুপ্ত',
    description: '৫ টি রগকাটা-সন্ত্রাসি গুপ্তকে ধরলে, পরের স্টেজ হবে চাঁদাবাজ গুপ্ত।',
    targetPoints: 5,
    difficulty: 'hard',
    mazeVariant: 'hard'
  },
  {
    id: 5,
    type: 'whack-a-mole',
    name: 'চাঁদাবাজ গুপ্ত',
    description: '৫ টি চাঁদাবাজ গুপ্তকে ধরলে win করে গেম শেষ করুন।',
    targetPoints: 5,
    difficulty: 'hard'
  }
];

const TOTAL_STAGES = STAGE_CONFIGS.length;
const MAX_SCORE = STAGE_CONFIGS.reduce((sum, stage) => sum + stage.targetPoints, 0);

/**
 * GameManager Component
 * Manages overall game flow, state transitions, and level progression.
 * Config-driven system: Stage 1→2→3→4→5 (10 points each = 50 total)
 */
function GameManager() {
  const [sharedState, setSharedState] = useState<SharedGameState>({
    score: 0,
    currentStage: 1,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [shouldAdvanceLevel, setShouldAdvanceLevel] = useState(false);
  const [nextLevel, setNextLevel] = useState(1);
  const [showStageCompleteModal, setShowStageCompleteModal] = useState(false);
  const [completedStageInfo, setCompletedStageInfo] = useState<{
    currentStage: number;
    nextStage: number;
    stageName: string;
    nextStageName: string;
    stageScore: number;
  } | null>(null);

  // Use refs to track previous values
  const prevScoreRef = useRef(0);

  // Monitor score and determine if stage should advance
  useEffect(() => {
    const currentScore = sharedState.score;
    const currentStage = sharedState.currentStage;
    const prevScore = prevScoreRef.current;

    // Calculate cumulative score thresholds for each stage
    let cumulativeScore = 0;
    for (let i = 0; i < STAGE_CONFIGS.length; i++) {
      const stageConfig = STAGE_CONFIGS[i];
      cumulativeScore += stageConfig.targetPoints;

      // Check if we've reached the threshold for advancing to next stage
      if (currentScore >= cumulativeScore && currentStage === stageConfig.id && prevScore < cumulativeScore) {
        if (stageConfig.id < TOTAL_STAGES) {
          // Advance to next stage - show modal first
          const nextStageConfig = STAGE_CONFIGS[stageConfig.id];
          setTimeout(() => {
            setCompletedStageInfo({
              currentStage: stageConfig.id,
              nextStage: stageConfig.id + 1,
              stageName: stageConfig.name,
              nextStageName: nextStageConfig.name,
              stageScore: stageConfig.targetPoints,
            });
            setShowStageCompleteModal(true);
            setNextLevel(stageConfig.id + 1);
          }, 500); // Small delay for better UX
        } else {
          // Game completed (reached max score on final stage)
          setTimeout(() => setGameCompleted(true), 500);
        }
        break;
      }
    }

    prevScoreRef.current = currentScore;
  }, [sharedState.score, sharedState.currentStage]);

  // Handle continuing to next stage from modal
  const handleContinueToNextStage = () => {
    setShowStageCompleteModal(false);
    setCompletedStageInfo(null);
    setShouldAdvanceLevel(true);
  };

  // Handle stage advancement when flag is set
  useEffect(() => {
    if (shouldAdvanceLevel && nextLevel !== sharedState.currentStage) {
      setTimeout(() => {
        setSharedState((prev) => ({
          ...prev,
          currentStage: nextLevel,
        }));
        setShouldAdvanceLevel(false);
      }, 100);
    }
  }, [shouldAdvanceLevel, nextLevel, sharedState.currentStage]);

  // Handle score updates from level components
  const handleScoreUpdate = (newScore: number) => {
    setSharedState((prev) => ({
      ...prev,
      score: newScore,
    }));
  };

  // Reset game to initial state
  const resetGame = () => {
    setSharedState({
      score: 0,
      currentStage: 1,
    });
    setGameStarted(false);
    setGameCompleted(false);
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center p-4">
      {/* Stage Complete Modal */}
      {completedStageInfo && (
        <StageCompleteModal
          isOpen={showStageCompleteModal}
          currentStage={completedStageInfo.currentStage}
          nextStage={completedStageInfo.nextStage}
          totalStages={TOTAL_STAGES}
          stageScore={completedStageInfo.stageScore}
          totalScore={sharedState.score}
          stageName={completedStageInfo.stageName}
          nextStageName={completedStageInfo.nextStageName}
          onContinue={handleContinueToNextStage}
        />
      )}

      <div className="w-full max-w-4xl">
        {/* Game Completion Screen */}
        {gameCompleted ? (
          <div className="text-center px-4">
            <div className="bg-gradient-to-br from-yellow-400 via-green-500 to-emerald-600 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 backdrop-blur-sm shadow-2xl border-4 md:border-8 border-yellow-300 relative overflow-hidden">
              {/* Animated background elements */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-yellow-200 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-green-300 rounded-full animate-bounce" style={{ animationDuration: '2.5s' }}></div>
              </div>

              <div className="relative z-10">
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 animate-bounce">
                  🏆 🎉 🏆 🎊 🏆
                </div>
                <h2 className="text-2xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-2xl px-2 animate-pulse">
                  🎮 অভিনন্দন! 🎮
                </h2>
                <p className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg px-2">
                  আপনি সব {TOTAL_STAGES}টি স্টেজ সম্পূর্ণ করেছেন!
                </p>
                <div className="bg-white bg-opacity-90 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 backdrop-blur-sm border-4 border-yellow-400 shadow-xl">
                  <p className="text-lg sm:text-2xl md:text-3xl text-green-900 font-bold mb-2">
                    সর্বমোট স্কোর
                  </p>
                  <p className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 animate-pulse">
                    {sharedState.score} / {MAX_SCORE}
                  </p>
                  <p className="text-base sm:text-xl text-green-700 mt-2 font-semibold">
                    🌟 পারফেক্ট স্কোর! 🌟
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3 text-left max-w-2xl mx-auto text-white mb-6 sm:mb-10 bg-green-900 bg-opacity-80 rounded-xl p-4 sm:p-6 border-4 border-yellow-300 shadow-xl">
                  <p className="text-base sm:text-lg md:text-xl font-bold mb-3 text-yellow-200">✨ স্টেজ সম্পূর্ণের তালিকা ✨</p>
                  {STAGE_CONFIGS.map((stage) => (
                    <p key={stage.id} className="text-sm sm:text-base md:text-lg flex items-center gap-2">
                      <span className="text-yellow-300 text-xl">✅</span>
                      <span>স্টেজ {stage.id}: {stage.name} - সম্পূর্ণ!</span>
                    </p>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={resetGame}
                    className="px-8 sm:px-12 md:px-16 py-3 sm:py-5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-slate-900 font-extrabold text-lg sm:text-2xl rounded-xl shadow-2xl hover:from-yellow-500 hover:to-yellow-700 transition-all transform hover:scale-110 active:scale-95 border-4 border-yellow-300 w-full sm:w-auto animate-pulse"
                  >
                    🎮 আবার খেলুন
                  </button>
                </div>
                <p className="text-white text-xs sm:text-sm mt-6 opacity-90">
                  আপনি সত্যিই একজন চ্যাম্পিয়ন! 🏆
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Global Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                🎮 গুপ্ত ধর 🎮
              </h1>
              {gameStarted && (
                <div className="flex justify-center gap-4 sm:gap-8 mb-6 bg-green-950 bg-opacity-70 rounded-lg p-3 sm:p-4 backdrop-blur-sm border-2 border-green-500">
                  <div className="text-center">
                    <p className="text-green-300 text-xs sm:text-sm font-semibold mb-1">
                      স্টেজ
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-emerald-400 drop-shadow-lg">
                      {sharedState.currentStage} / {TOTAL_STAGES}
                    </p>
                  </div>
                  <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="text-center">
                    <p className="text-green-300 text-xs sm:text-sm font-semibold mb-1">
                      মোট স্কোর
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-lime-400 drop-shadow-lg">
                      {sharedState.score} / {MAX_SCORE}
                    </p>
                  </div>
                  <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="text-center">
                    <p className="text-green-300 text-xs sm:text-sm font-semibold mb-1">
                      স্টেজ লক্ষ্য
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-400 drop-shadow-lg">
                      {STAGE_CONFIGS[sharedState.currentStage - 1]?.targetPoints || 10}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Level Content */}
            {!gameStarted ? (
              // Start Screen
              <div className="text-center">
                <div className="bg-green-950 bg-opacity-60 rounded-2xl p-10 backdrop-blur-sm mb-8 border-2 border-green-500">
                  <h2 className="text-3xl font-bold text-white mb-6">
                    গুপ্ত ধর গেম-এ আপনাকে স্বাগতম
                  </h2>
                  <div className="space-y-4 text-left max-w-md mx-auto text-green-200 mb-8">
                    {STAGE_CONFIGS.map((stage) => (
                      <div key={stage.id}>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {String.fromCharCode(0x2192)} স্টেজ {stage.id} : {stage.name}
                        </h3>
                        <p className="text-sm">
                          {stage.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={startGame}
                    className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95"
                  >
                    Start Adventure
                  </button>
                </div>
              </div>
            ) : (() => {
              const currentConfig = STAGE_CONFIGS[sharedState.currentStage - 1];

              switch (currentConfig?.type) {
                case 'whack-a-mole':
                  return (
                    <WhackAMoleLevel
                      score={sharedState.score}
                      onScoreUpdate={handleScoreUpdate}
                      onLevelComplete={() => {
                        // Stage completion handled by useEffect
                      }}
                      difficulty={currentConfig.difficulty}
                    />
                  );

                case 'maze':
                  return (
                    <MazeLevel
                      score={sharedState.score}
                      onScoreUpdate={handleScoreUpdate}
                      onGameReset={resetGame}
                      difficulty={currentConfig.difficulty || 'normal'}
                      variant="normal"
                      stageNumber={currentConfig.id}
                    />
                  );

                case 'maze-hard':
                  return (
                    <MazeLevel
                      score={sharedState.score}
                      onScoreUpdate={handleScoreUpdate}
                      onGameReset={resetGame}
                      difficulty="hard"
                      variant="hard"
                      stageNumber={currentConfig.id}
                    />
                  );

                case 'snake':
                  return (
                    <SnakeLevel
                      score={sharedState.score}
                      onScoreUpdate={handleScoreUpdate}
                      onGameReset={resetGame}
                      difficulty={currentConfig.difficulty || 'normal'}
                    />
                  );

                default:
                  return null;
              }
            })()}

            {/* Footer */}
            {/* <p className="text-center text-green-400 text-xs mt-8 font-medium">
              © 2026 hit-the-hade | Designed & Developed by <a href="" className="underline">Team</a>
            </p> */}
          </>
        )}
      </div>
    </div>
  );
}

export default GameManager;
