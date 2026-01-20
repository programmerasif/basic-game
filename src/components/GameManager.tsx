import { useState, useEffect, useRef } from "react";
import WhackAMoleLevel from "./WhackAMoleLevel";
import MazeLevel from "./MazeLevel";
import SnakeLevel from "./SnakeLevel";
import LevelCompleteModal from "./LevelCompleteModal";
import LevelStartModal from "./LevelStartModal";
import dhorshokIcon from "../assets/dorshok.png"
import razakar from "../assets/razakar.png"
import chadabaj from "../assets/chadabaj.png"
import rog from "../assets/rog.png"
import chor from "../assets/chor.png"

// Import music
import commonMusic from "../assets/music/common.mp3";
import victoryMusic from "../assets/music/victory.mp3";
import pointSound from "../assets/music/point.mp3";
import { ArrowRight } from "lucide-react";


interface SharedGameState {
  score: number;
  currentLevel: number;
}

/**
 * GameManager Component
 * Manages overall game flow, state transitions, and level progression.
 * Handles progression: Level 1 (5 pts) → Level 2 (10 pts) → Level 3 (15 pts) → Level 4 (20 pts) → Level 5 (25 pts = completion)
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
  const [showLevelStartModal, setShowLevelStartModal] = useState(false);
  const [completedLevelScore, setCompletedLevelScore] = useState(0);
  const [levelReady, setLevelReady] = useState(false);

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

    // Level 1 → Level 2 at 5 points
    if (currentScore >= 5 && currentLevel === 1 && prevScore < 5) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNextLevel(2);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(5);
      setShowLevelCompleteModal(true);
    }
    // Level 2 → Level 3 at 10 points
    else if (currentScore >= 10 && currentLevel === 2 && prevScore < 10) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setNextLevel(3);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(5);
      setShowLevelCompleteModal(true);
    }
    // Level 3 → Level 4 at 15 points
    else if (currentScore >= 15 && currentLevel === 3 && prevScore < 15) {
      setNextLevel(4);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(5);
      setShowLevelCompleteModal(true);
    }
    // Level 4 → Level 5 at 20 points
    else if (currentScore >= 20 && currentLevel === 4 && prevScore < 20) {
      setNextLevel(5);
      setShouldAdvanceLevel(true);
      setCompletedLevelScore(5);
      setShowLevelCompleteModal(true);
    }
    // Check for game completion (25 points)
    else if (currentScore >= 25 && currentLevel === 5) {
      setCompletedLevelScore(5);
      setShowLevelCompleteModal(true);
    }

    prevScoreRef.current = currentScore;
  }, [sharedState.score, sharedState.currentLevel]);

  // Handle level advancement when user clicks continue
  const handleContinueToNextLevel = () => {
    if (sharedState.currentLevel === 5) {
      setGameCompleted(true);
      setShowLevelCompleteModal(false);
    } else if (shouldAdvanceLevel && nextLevel !== sharedState.currentLevel) {
      setSharedState((prev) => ({
        ...prev,
        currentLevel: nextLevel,
      }));
      setShouldAdvanceLevel(false);
      setShowLevelCompleteModal(false);
      setLevelReady(false);
      setShowLevelStartModal(true);
    } else {
      setShowLevelCompleteModal(false);
    }
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
    setShowLevelStartModal(true);
  };

  // Handle level start after showing modal
  const handleLevelStart = () => {
    setShowLevelStartModal(false);
    setGameStarted(true);
    setLevelReady(true);
    // Try to play music on user interaction (button click)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("Audio play failed");
      });
    }
  };

  return (
    <div className="min-h-screen max-w bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center p-2 md:p-4">
      {/* Level Start Modal */}
      <LevelStartModal
        isOpen={showLevelStartModal}
        currentLevel={sharedState.currentLevel}
        levelName={levelNames[sharedState.currentLevel] || "Unknown Level"}
        onStart={handleLevelStart}
      />

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

      <div className="w-full  mx-auto">
        {/* Game Completion Screen */}
        {gameCompleted ? (
          <div className="text-center px-2 md:px-4">
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl md:rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-pulse shadow-2xl border-2 md:border-4 border-green-400">
              <p className="text-4xl md:text-5xl mb-3 md:mb-4">🏆 🎊 🏆</p>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
                অভিনন্দন!
              </h2>
              <p className="text-lg md:text-2xl text-white mb-2 md:mb-3 drop-shadow-lg">
                আপনি সব গুপ্ত ধরেছেন!
              </p>
              <p className="text-base md:text-xl text-green-50 mb-4 md:mb-6">
                মোট স্কোর: <span className="font-bold text-xl md:text-3xl">{sharedState.score}</span>
              </p>
              <div className="space-y-2 md:space-y-3 text-left max-w-2xl mx-auto text-white mb-4 md:mb-6 bg-green-900 bg-opacity-60 rounded-xl p-3 md:p-4 border-2 border-green-400">
                <p className="text-sm md:text-base">✅ লেভেল১: ধর্ষক গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm md:text-base">✅ লেভেল২: খুনি গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm md:text-base">✅ লেভেল৩: রাজাকার গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm md:text-base">✅ লেভেল৪: রগকাটা-সন্ত্রাসি গুপ্ত - ধরা হয়েছে!</p>
                <p className="text-sm md:text-base">✅ লেভেল৫: চাঁদাবাজ গুপ্ত - ধরা হয়েছে!</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 md:px-12 py-3 md:py-4 bg-green-400 text-slate-900 font-bold text-base md:text-lg rounded-lg shadow-lg hover:bg-emerald-300 transition-all transform hover:scale-105 active:scale-95 border-2 border-green-600 w-full sm:w-auto"
              >
                আবার খেলুন
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Global Header */}
            {/* <div className="text-center mb-3 md:mb-4">
              {gameStarted && (
                <div className="flex justify-center gap-4 md:gap-6 mb-4 md:mb-6 bg-green-950 bg-opacity-70 rounded-lg p-3 md:p-4 backdrop-blur-sm border-2 border-green-500">
                  <div className="text-center">
                    <p className="text-green-300 text-xs md:text-sm font-semibold mb-1">
                      স্তর
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-400 drop-shadow-lg">
                      {sharedState.currentLevel}
                    </p>
                  </div>
                  <div className="h-10 md:h-12 w-1 bg-gradient-to-b from-green-500 to-transparent"></div>
                  <div className="text-center">
                    <p className="text-green-300 text-xs md:text-sm font-semibold mb-1">
                      মোট স্কোর
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-lime-400 drop-shadow-lg">
                      {sharedState.score}
                    </p>
                  </div>
                </div>
              )}
            </div> */}

            {/* Level Content */}
            {!gameStarted ? (
              // Start Screen - Flowchart Style
              <div className="text-center">
                <div className="bg-green-950 bg-opacity-60 rounded-xl p-4 md:p-6 backdrop-blur-sm border-2 border-green-500 w-full">
                  {/* Title */}
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">
                    গুপ্ত ধর
                  </h2>
                  <p className="text-green-300 text-base md:text-lg mb-3 md:mb-4">
                    গুপ্ত ধর গেম-এ আপনাকে স্বাগতম
                  </p>
                  <p className="text-green-300 text-sm md:text-base mb-4 md:mb-5">
                    ধর্ষক, খুনি, সন্ত্রাসী-রগকাটা, রাজাকার, চাঁদাবাজ গুপ্ত ধরতে তৈরী হোন।
                  </p>

                  {/* Score Display */}
                  <div className="flex justify-end mb-4 md:mb-6">
                    <div className="bg-green-900 bg-opacity-70 px-4 py-2 rounded-lg border border-green-500">
                      <span className="text-green-300 text-sm md:text-base">মোট স্কোর: </span>
                      <span className="text-lime-400 font-bold text-base md:text-lg">{sharedState.score}</span>
                    </div>
                  </div>

                  {/* Flowchart Level Progression */}
                  <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-5 justify-center items-center gap-2 md:gap-3 mb-6 md:mb-8 p-3 md:p-4 bg-green-900 bg-opacity-40 rounded-xl border border-green-600">
                    {/* Level 1 */}
                    <div className="flex flex-col items-center w-full">
                      <div className="bg-gradient-to-r w-full from-green-600 to-emerald-600 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg flex items-center justify-center gap-2">
                        <img src={dhorshokIcon} alt="" className="rounded w-6 md:w-8" />
                        <p className="text-white font-bold text-xs md:text-sm">ধর্ষক গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">
                      <ArrowRight className="text-white hidden md:block items-center w-full" />
                    </div>

                    {/* Level 2 */}
                    <div className="flex flex-col items-center w-full">
                      <div className="bg-gradient-to-r w-full from-green-600 to-emerald-600 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg flex items-center justify-center gap-2">
                        <img src={chor} alt="" className="rounded w-6 md:w-8" />
                        <p className="text-white font-bold text-xs md:text-sm">খুনি গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">
                      <ArrowRight className="text-white hidden md:block items-center w-full" />
                    </div>

                    {/* Level 3 */}
                    <div className="flex flex-col items-center w-full">
                      <div className="bg-gradient-to-r w-full from-green-600 to-emerald-600 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg flex items-center justify-center gap-2">
                        <img src={razakar} alt="" className="rounded w-6 md:w-8" />
                        <p className="text-white font-bold text-xs md:text-sm">রাজাকার গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">
                      <ArrowRight className="text-white hidden md:block items-center w-full" />
                    </div>

                    {/* Level 4 */}
                    <div className="flex flex-col items-center w-full">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg flex items-center justify-center w-full gap-2">
                        <img src={rog} alt="" className="rounded w-6 md:w-8" />
                        <p className="text-white font-bold text-xs md:text-sm">রগকাটা-সন্ত্রাসি গুপ্ত</p>
                      </div>
                    </div>
                    <div className="text-green-400 text-xl md:text-2xl">
                      <ArrowRight className="text-white hidden md:block items-center w-full" />
                    </div>

                    {/* Level 5 */}
                    <div className="flex flex-col items-center w-full">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-3 md:px-4 py-2 md:py-3 rounded-lg border-2 border-green-400 shadow-lg flex items-center justify-center w-full gap-2">
                        <img src={chadabaj} alt="" className="rounded w-6 md:w-8" />
                        <p className="text-white font-bold text-xs md:text-sm">চাঁদাবাজ গুপ্ত</p>
                      </div>
                    </div>
                  </div>



                  <button
                    onClick={startGame}
                    className="mt-4 md:mt-6 px-8 md:px-12 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-base md:text-lg rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 active:scale-95 border-2 border-green-400"
                  >
                    শুরু করুন
                  </button>
                </div>
              </div>
            ) : levelReady && sharedState.currentLevel === 1 ? (
              // Level 1: ধর্ষক গুপ্ত
              <WhackAMoleLevel
                key="whack-level-1"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onLevelComplete={() => {
                  // Level complete when reaching 5 points
                  // Transition handled by useEffect
                }}
                levelNumber={1}
                targetScore={5}
                levelName="ধর্ষক গুপ্ত"
                nextLevelName="খুনি গুপ্ত"
              />
            ) : levelReady && sharedState.currentLevel === 2 ? (
              // Level 2: খুনি গুপ্ত
              <MazeLevel
                key="maze-level-2"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
                levelNumber={2}
                targetScore={10}
                levelName="খুনি গুপ্ত"
              />
            ) : levelReady && sharedState.currentLevel === 3 ? (
              // Level 3: রাজাকার গুপ্ত
              <SnakeLevel
                key="snake-level-3"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
                levelNumber={3}
                targetScore={15}
                levelName="রাজাকার গুপ্ত"
              />
            ) : levelReady && sharedState.currentLevel === 4 ? (
              // Level 4: রগকাটা-সন্ত্রাসি গুপ্ত
              <MazeLevel
                key="maze-level-4"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onGameReset={resetGame}
                levelNumber={4}
                targetScore={20}
                levelName="রগকাটা-সন্ত্রাসি গুপ্ত"
              />
            ) : levelReady && sharedState.currentLevel === 5 ? (
              // Level 5: চাঁদাবাজ গুপ্ত
              <WhackAMoleLevel
                key="whack-level-5"
                score={sharedState.score}
                onScoreUpdate={handleScoreUpdate}
                onLevelComplete={() => {
                  // Level complete when reaching 25 points
                  // Transition handled by useEffect
                }}
                levelNumber={5}
                targetScore={25}
                levelName="চাঁদাবাজ গুপ্ত"
                nextLevelName="গেম শেষ!"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default GameManager;
