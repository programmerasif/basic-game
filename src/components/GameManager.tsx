import { useState, useEffect, useRef } from "react";
import WhackAMoleLevel from "./WhackAMoleLevel";
import MazeLevel from "./MazeLevel";
import SnakeLevel from "./SnakeLevel";
import LevelCompleteModal from "./LevelCompleteModal";

// Import music
import commonMusic from "../assets/music/common.mp3";
import victoryMusic from "../assets/music/victory.mp3";
import pointSound from "../assets/music/point.mp3";


interface SharedGameState {
  score: number;
  currentLevel: number;
}

/**
 * GameManager Component
 * Manages overall game flow, state transitions, and level progression.
 * Handles progression: Level 1 (10 pts) → Level 2 (20 pts) → Level 3 (30 pts = completion)
 */
function GameManager() {
  const [sharedState, setSharedState] = useState<SharedGameState>({
    score: 0,
    currentLevel: 1,
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [shouldAdvanceLevel, setShouldAdvanceLevel] = useState(false);
  const [nextLevel, setNextLevel] = useState(1);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [completedLevelScore, setCompletedLevelScore] = useState(0);

  // Level names in Bengali
  const levelNames: Record<number, string> = {
    1: "ধর্ষক গুপ্ত",
    2: "খুনি গুপ্ত",
    3: "রাজাকার গুপ্ত",
    4: "রগকাটা-সন্ত্রাসি গুপ্ত",
    5: "চাঁদাবাজ গুপ্ত",
  };

  // Use refs to track previous values
  const prevScoreRef = useRef(0);

  // Audio refs for background music and victory music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const victoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const pointAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio(commonMusic);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    victoryAudioRef.current = new Audio(victoryMusic);
    victoryAudioRef.current.loop = false;
    victoryAudioRef.current.volume = 0.6;

    pointAudioRef.current = new Audio(pointSound);
    pointAudioRef.current.loop = false;
    pointAudioRef.current.volume = 0.7;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (victoryAudioRef.current) {
        victoryAudioRef.current.pause();
        victoryAudioRef.current = null;
      }
      if (pointAudioRef.current) {
        pointAudioRef.current.pause();
        pointAudioRef.current = null;
      }
    };
  }, []);

  // Control music based on game state
  useEffect(() => {
    if (!audioRef.current || !victoryAudioRef.current) return;

    if (showLevelCompleteModal || gameCompleted) {
      // Level complete or game completed - play victory music, pause game music
      audioRef.current.pause();
      victoryAudioRef.current.currentTime = 0;
      victoryAudioRef.current.play().catch(() => {
        console.log("Victory audio play failed");
      });
    } else if (gameStarted) {
      // Game is active - play game music, stop victory music
      victoryAudioRef.current.pause();
      victoryAudioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        console.log("Audio autoplay blocked - will play on user interaction");
      });
    } else {
      // Game not started - pause all music
      audioRef.current.pause();
      victoryAudioRef.current.pause();
    }
  }, [gameStarted, gameCompleted, showLevelCompleteModal]);

  // Monitor score and determine if level should advance
  useEffect(() => {
    const currentScore = sharedState.score;
    const currentLevel = sharedState.currentLevel;
    const prevScore = prevScoreRef.current;

    // Level 1 → Level 2 at 10 points
    if (currentScore >= 10 && currentLevel === 1 && prevScore < 10) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNextLevel(2);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(10);
      setShowLevelCompleteModal(true);
    }
    // Level 2 → Level 3 at 20 points
    else if (currentScore >= 20 && currentLevel === 2 && prevScore < 20) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNextLevel(3);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(10);
      setShowLevelCompleteModal(true);
    }
    // Level 3 → Level 4 at 30 points
    else if (currentScore >= 30 && currentLevel === 3 && prevScore < 30) {
      setNextLevel(4);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(10);
      setShowLevelCompleteModal(true);
    }
    // Level 4 → Level 5 at 40 points
    else if (currentScore >= 40 && currentLevel === 4 && prevScore < 40) {
      setNextLevel(5);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(10);
      setShowLevelCompleteModal(true);
    }
    // Check for game completion (50 points)
    else if (currentScore >= 50 && currentLevel === 5) {
      setCompletedLevelScore(10);
      setShowLevelCompleteModal(true);
    }

    prevScoreRef.current = currentScore;
  }, [sharedState.score, sharedState.currentLevel]);

  // Handle level advancement when user clicks continue
  const handleContinueToNextLevel = () => {
    if (sharedState.currentLevel === 5) {
      setGameCompleted(true);
    } else if (shouldAdvanceLevel && nextLevel !== sharedState.currentLevel) {
      setSharedState((prev) => ({
        ...prev,
        currentLevel: nextLevel,
      }));
      setShouldAdvanceLevel(false);
    }
    setShowLevelCompleteModal(false);
  };

  // Handle return to home
  const handleReturnHome = () => {
    setShowLevelCompleteModal(false);
    resetGame();
  };

  // Handle score updates from level components
  const handleScoreUpdate = (newScore: number) => {
    // Play point sound effect
    if (pointAudioRef.current && newScore > sharedState.score) {
      pointAudioRef.current.currentTime = 0;
      pointAudioRef.current.play().catch(() => {
        console.log("Point sound play failed");
      });
    }
    setSharedState((prev) => ({
      ...prev,
      score: newScore,
    }));
  };

  // Reset game to initial state
  const resetGame = () => {
    setSharedState({
      score: 0,
      currentLevel: 1,
    });
    setGameStarted(false);
    // Reset all audio to beginning
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (victoryAudioRef.current) {
      victoryAudioRef.current.pause();
      victoryAudioRef.current.currentTime = 0;
    }
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    // Try to play music on user interaction (button click)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("Audio play failed");
      });
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center ${gameStarted && (sharedState.currentLevel === 2 || sharedState.currentLevel === 4) ? 'p-0 md:p-4 fixed md:relative inset-0 overflow-hidden md:overflow-visible' : 'p-4'}`}>
      {/* Level Complete Modal */}
      <LevelCompleteModal
        isOpen={showLevelCompleteModal}
        currentLevel={sharedState.currentLevel}
        nextLevel={nextLevel}
        totalLevels={5}
        levelScore={completedLevelScore}
        totalScore={sharedState.score}
        levelName={levelNames[sharedState.currentLevel] || "Unknown Level"}
        nextLevelName={levelNames[nextLevel] || "Final Level"}
        onContinue={handleContinueToNextLevel}
        onReturnHome={handleReturnHome}
      />

      <div className={`w-full ${gameStarted && sharedState.currentLevel === 2 ? 'max-w-full md:max-w-4xl h-screen md:h-auto overflow-hidden' : 'max-w-4xl'}`}>
        {/* Game Completion Screen */}
        {gameCompleted ? (
          <div className="text-center px-4">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 backdrop-blur-sm animate-pulse shadow-2xl border-2 md:border-4 border-green-400">
              <p className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6">🏆 🎊 🏆</p>
              <h2 className="text-xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg px-2">
                অভিনন্দন!
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4 drop-shadow-lg px-2">
                আপনি সব গুপ্ত ধরেছেন!
              </p>
              <p className="text-lg sm:text-xl md:text-2xl text-green-50 mb-6 sm:mb-8">
                মোট স্কোর: <span className="font-bold text-2xl sm:text-3xl md:text-4xl">{sharedState.score}</span>
              </p>
              <div className="space-y-2 sm:space-y-3 text-left max-w-2xl mx-auto text-white mb-6 sm:mb-10 bg-green-900 bg-opacity-60 rounded-xl p-4 sm:p-6 border-2 border-green-400">
                <p className="text-sm sm:text-base md:text-lg">✅ লেভেল১: ধর্ষক গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm sm:text-base md:text-lg">✅ লেভেল২: খুনি গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm sm:text-base md:text-lg">✅ লেভেল৩: রাজাকার গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm sm:text-base md:text-lg">✅ লেভেল৪: রগকাটা-সন্ত্রাসি গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm sm:text-base md:text-lg">✅ লেভেল৫: চাঁদাবাজ গুপ্ত - ধরা হয়েছে!</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-green-400 text-slate-900 font-bold text-lg sm:text-xl rounded-lg shadow-lg hover:bg-emerald-300 transition-all transform hover:scale-105 active:scale-95 border-2 border-green-600 w-full sm:w-auto"
              >
                আবার খেলুন
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Global Header - Hidden on mobile for Maze levels (2 and 4) */}
            <div className={`text-center mb-8 ${(sharedState.currentLevel === 2 || sharedState.currentLevel === 4) ? 'hidden md:block' : ''}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                � গুপ্ত ধর 🎯
              </h1>
              {gameStarted && (
                <div className="flex justify-center gap-8 mb-6 bg-green-950 bg-opacity-70 rounded-lg p-4 backdrop-blur-sm border-2 border-green-500">
                  <div className="text-center">
                    <p className="text-green-300 text-sm font-semibold mb-1">
                      স্তর
                    </p>
                    <p className="text-3xl font-bold text-emerald-400 drop-shadow-lg">
                      {sharedState.currentLevel}
                    </p>
                  </div>
                  <div className="h-12 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="text-center">
                    <p className="text-green-300 text-sm font-semibold mb-1">
                      মোট স্কোর
                    </p>
                    <p className="text-3xl font-bold text-lime-400 drop-shadow-lg">
                      {sharedState.score}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Level Content */}
            {!gameStarted ? (
              // Start Screen - Flowchart Style
              <div className="text-center">
                <div className="bg-green-950 bg-opacity-60 rounded-2xl p-6 md:p-10 backdrop-blur-sm mb-8 border-2 border-green-500">
                  {/* Title */}
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    গুপ্ত ধর
                  </h2>
                  <p className="text-green-300 text-lg mb-6">
                    গুপ্ত ধর গেম-এ আপনাকে স্বাগতম
                  </p>

                  {/* Score Display */}
                  <div className="flex justify-end mb-4">
                    <div className="bg-green-900 bg-opacity-70 px-4 py-2 rounded-lg border border-green-500">
                      <span className="text-green-300 text-sm">মোট স্কোর: </span>
                      <span className="text-lime-400 font-bold">{sharedState.score}</span>
                    </div>
                  </div>

                  {/* Flowchart Level Progression */}
                  <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 mb-8 p-4 bg-green-900 bg-opacity-40 rounded-xl border border-green-600">
                    {/* Level 1 */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-6 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg">
                        <p className="text-white font-bold text-xs md:text-sm">ধর্ষক গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">▶</div>

                    {/* Level 2 */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-6 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg">
                        <p className="text-white font-bold text-xs md:text-sm">খুনি গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">▶</div>

                    {/* Level 3 */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-6 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg">
                        <p className="text-white font-bold text-xs md:text-sm">রাজাকার গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">▶</div>

                    {/* Level 4 */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-6 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg">
                        <p className="text-white font-bold text-xs md:text-sm">রগকাটা-সন্ত্রাসি গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">▶</div>

                    {/* Level 5 */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-6 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg">
                        <p className="text-white font-bold text-xs md:text-sm">চাঁদাবাজ গুপ্ত</p>
                      </div>
                    </div>
                  </div>

                  {/* Game Rules */}
                  <div className="text-left max-w-lg mx-auto mb-8">
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 text-center">
                      গুপ্ত ধর গেম নিয়ম
                    </h3>
                    <div className="space-y-3 text-green-200">
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400">👤</span>
                        <div>
                          <span className="text-white font-bold">ধর্ষক গুপ্ত</span>
                          <p className="text-sm">৫টি ধর্ষক গুপ্তকে ধরলে, পরের স্টেজ হবে খুনি গুপ্ত।</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400">👤</span>
                        <div>
                          <span className="text-white font-bold">খুনি গুপ্ত</span>
                          <p className="text-sm">৫টি খুনি গুপ্তকে ধরলে, পরের স্টেজ হবে রাজাকার গুপ্ত।</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400">👤</span>
                        <div>
                          <span className="text-white font-bold">রাজাকার গুপ্ত</span>
                          <p className="text-sm">৫টি রাজাকার গুপ্তকে ধরলে, পরের স্টেজ হবে রগকাটা-সন্ত্রাসি গুপ্ত।</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400">👤</span>
                        <div>
                          <span className="text-white font-bold">রগকাটা-সন্ত্রাসি গুপ্ত</span>
                          <p className="text-sm">৫টি রগকাটা-সন্ত্রাসি গুপ্তকে ধরলে, পরের স্টেজ হবে চাঁদাবাজ গুপ্ত।</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400">👤</span>
                        <div>
                          <span className="text-white font-bold">চাঁদাবাজ গুপ্ত</span>
                          <p className="text-sm">৫টি চাঁদাবাজ গুপ্তকে ধরলে, গেম শেষ!</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={startGame}
                    className="px-12 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95 border-2 border-green-400"
                  >
                    শুরু করুন
                  </button>
                </div>
              </div>
            ) : sharedState.currentLevel === 1 ? (
              // Level 1: ধর্ষক গুপ্ত
              <WhackAMoleLevel
                key="whack-level-1"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onLevelComplete={() => {
                  // Level complete when reaching 10 points
                  // Transition handled by useEffect
                }}
                levelNumber={1}
                targetScore={10}
                levelName="ধর্ষক গুপ্ত"
                nextLevelName="খুনি গুপ্ত"
              />
            ) : sharedState.currentLevel === 2 ? (
              // Level 2: খুনি গুপ্ত
              <MazeLevel
                key="maze-level-2"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
                levelNumber={2}
                targetScore={20}
                levelName="খুনি গুপ্ত"
              />
            ) : sharedState.currentLevel === 3 ? (
              // Level 3: রাজাকার গুপ্ত
              <SnakeLevel
                key="snake-level-3"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
                levelNumber={3}
                targetScore={30}
                levelName="রাজাকার গুপ্ত"
              />
            ) : sharedState.currentLevel === 4 ? (
              // Level 4: রগকাটা-সন্ত্রাসি গুপ্ত
              <MazeLevel
                key="maze-level-4"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
                levelNumber={4}
                targetScore={40}
                levelName="রগকাটা-সন্ত্রাসি গুপ্ত"
              />
            ) : (
              // Level 5: চাঁদাবাজ গুপ্ত
              <WhackAMoleLevel
                key="whack-level-5"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onLevelComplete={() => {
                  // Level complete when reaching 50 points
                  // Transition handled by useEffect
                }}
                levelNumber={5}
                targetScore={50}
                levelName="চাঁদাবাজ গুপ্ত"
                nextLevelName="গেম শেষ!"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GameManager;
