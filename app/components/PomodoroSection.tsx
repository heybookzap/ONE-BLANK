"use client";
import { useState, useEffect } from "react";

export default function PomodoroSection({ onSessionComplete }: { onSessionComplete: (seconds: number) => void }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    else if (timeLeft === 0) handleComplete();
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
      onSessionComplete(25 * 60);
    }, 1500);
  };

  const toggleTimer = () => {
    if (isRunning) {
      if (pauseCount >= 3) return alert("일시정지 한도를 모두 소진했습니다.");
      setPauseCount(prev => prev + 1);
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="flex flex-col items-center">
      {showFlash && <div className="fixed inset-0 z-[100] bg-[#DAA520]/30 animate-pulse pointer-events-none" />}
      {isRunning && <div className="fixed inset-0 bg-black/60 z-[-1] transition-opacity duration-1000 pointer-events-none" />}
      <div className={`relative flex flex-col items-center justify-center w-80 h-80 rounded-full border border-[#222] bg-[#050505] transition-all duration-1000 shadow-[0_0_80px_rgba(218,165,32,0.02)] ${isRunning ? 'border-[#DAA520]/50 scale-105' : ''}`}>
        <span className="text-7xl font-extralight tracking-tighter text-white font-mono z-10">{String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}</span>
      </div>
      <div className="mt-20 flex flex-col items-center gap-7 z-20 w-full relative">
        <button onClick={toggleTimer} className={`px-16 py-5 border text-[11px] tracking-[0.4em] uppercase transition-all ${isRunning ? "border-[#DAA520] text-[#DAA520]" : "border-[#444] text-[#A0A0A0] hover:text-white"}`}>{isRunning ? "[ Pause ]" : "[ Engage ]"}</button>
        <p className="text-[10px] tracking-[0.3em] text-[#A0A0A0] font-light uppercase">남은 일시정지: <span className="text-[#DAA520] font-medium">{3 - pauseCount}</span> / 3</p>
        <button onClick={() => onSessionComplete((25 * 60) - timeLeft)} className="mt-12 text-[10px] text-[#A0A0A0] hover:text-white tracking-[0.5em] transition-colors uppercase border-b border-[#222] hover:border-white pb-1">[ Stop & Claim Value ]</button>
      </div>
    </div>
  );
}