"use client";
import { useState, useEffect } from "react";
import GateGuard from "./components/GateGuard"; 
import OnboardingModal from "./components/OnboardingModal"; 
import EmotionDrainSection from "./components/EmotionDrainSection";
import PomodoroSection from "./components/PomodoroSection";
import ROISection from "./components/ROISection";
import { supabase } from "./lib/supabase";

export default function Dashboard() {
  const [phase, setPhase] = useState<"drain" | "onething" | "timer" | "roi" | "final" | "closed">("drain");
  const [oneThing, setOneThing] = useState("");
  const [sessionData, setSessionData] = useState({ sessionValue: 0, totalValue: 0, totalMinutes: 0 });
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [worstHabit, setWorstHabit] = useState(""); 
  const [liveOnes, setLiveOnes] = useState(0);

  useEffect(() => {
    setLiveOnes(Math.floor(Math.random() * 8));
    const onboarded = localStorage.getItem("oneBlank_onboardingComplete");
    if (onboarded) {
      setIsOnboarding(false);
      setWorstHabit(localStorage.getItem("ob_worst_habit") || "");
    }
  }, [isOnboarding]);

  const handleCalculateROI = async (seconds: number) => {
    const hourlyRate = Number(localStorage.getItem("ob_rate") || "0");
    const sessionValue = Math.floor((hourlyRate / 3600) * seconds);
    const sessionMinutes = Math.floor(seconds / 60);
    const prevValue = Number(localStorage.getItem("ob_total_saving") || "0");
    const prevMins = Number(localStorage.getItem("ob_total_time") || "0");
    
    const newTotalValue = prevValue + sessionValue;
    const newTotalMinutes = prevMins + sessionMinutes;

    localStorage.setItem("ob_total_saving", newTotalValue.toString());
    localStorage.setItem("ob_total_time", newTotalMinutes.toString());
    setSessionData({ sessionValue, totalValue: newTotalValue, totalMinutes: newTotalMinutes });
    
    let userId = localStorage.getItem("ob_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("ob_user_id", userId);
    }

    try {
      await supabase.from('sessions').insert([
        { 
          user_id: userId, 
          one_thing: oneThing, 
          focus_minutes: sessionMinutes, 
          earned_value: sessionValue
        }
      ]);
    } catch (err) {
      console.error(err);
    }

    setPhase("roi");
  };

  if (phase === "closed") return <div className="min-h-screen bg-black" />;

  return (
    <GateGuard>
      {isOnboarding && <OnboardingModal onComplete={() => { setIsOnboarding(false); setWorstHabit(localStorage.getItem("ob_worst_habit") || ""); }} />}
      {!isOnboarding && (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-center">
          {phase !== "final" && (
            <div className="absolute top-10 left-10 flex items-center gap-3 px-4 py-2 bg-[#111]/90 border border-[#222] rounded-full z-20 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[8px] text-[#A0A0A0] tracking-widest uppercase font-light"><span className="text-white font-medium mr-1">{liveOnes}</span> Ones Focusing</p>
            </div>
          )}
          {phase === "drain" && <EmotionDrainSection onComplete={() => setPhase("onething")} />}
          {phase === "onething" && (
            <div className="w-full max-w-3xl animate-fade-in flex flex-col items-center">
              <div className="mb-20 space-y-4">
                <p className="text-[9px] text-[#DAA520] tracking-[0.6em] uppercase opacity-70">Target Habit to Erase</p>
                <h2 className="text-xl font-light text-[#DAA520] tracking-tight">[{worstHabit}]</h2>
              </div>
              <h2 className="text-2xl font-light text-white mb-16 tracking-tight">이 습관을 지우기 위한 오늘의 목표는?</h2>
              <form onSubmit={(e) => { e.preventDefault(); if(oneThing) setPhase("timer"); }} className="w-full relative max-w-lg mb-12">
                <input type="text" value={oneThing} onChange={(e) => setOneThing(e.target.value)} className="w-full bg-transparent border-b border-[#333] text-white text-2xl font-extralight py-8 text-center focus:outline-none focus:border-[#DAA520] transition-all" placeholder="단 하나의 본질" autoFocus />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-[#E0E0E0] tracking-[0.3em] hover:text-[#DAA520] uppercase transition-colors pb-1">[ ENTER ]</button>
              </form>
            </div>
          )}
          {phase === "timer" && (
            <div className="w-full animate-fade-in flex flex-col items-center">
              <p className="text-[10px] text-white tracking-[0.5em] uppercase mb-10 font-medium">Current Focus: {oneThing}</p>
              <PomodoroSection onSessionComplete={handleCalculateROI} />
            </div>
          )}
          {phase === "roi" && (
            <div className="w-full max-w-4xl animate-fade-in flex flex-col items-center">
              <p className="text-[12px] text-[#A0A0A0] tracking-[0.5em] uppercase mb-6">Value Secured Today</p>
              <h1 className="text-6xl font-extralight text-[#DAA520] mb-8 tracking-tighter">₩ {sessionData.sessionValue.toLocaleString()}</h1>
              <ROISection totalValue={sessionData.totalValue} totalMinutes={sessionData.totalMinutes} />
              <button onClick={() => setPhase("final")} className="mt-20 text-[10px] text-[#E0E0E0] hover:text-[#DAA520] transition-all uppercase tracking-[0.5em]">[ 자산 확인 완료 ]</button>
            </div>
          )}
          {phase === "final" && (
            <div className="w-full max-w-3xl animate-fade-in flex flex-col items-center space-y-12">
              <p className="text-[10px] tracking-[0.8em] text-[#DAA520] uppercase font-light">Mission Accomplished</p>
              <h1 className="text-3xl md:text-4xl font-light text-white leading-tight">가장 무거운 바위를<br />치워냈습니다.</h1>
              <div className="py-10 border-y border-[#111] w-full max-w-md">
                <p className="text-sm font-extralight leading-[2.2] text-[#E0E0E0] tracking-wide">세상의 소음을 차단하고, 기어코 오늘 하루의<br />주도권을 쥐어낸 당신을 존경합니다.</p>
              </div>
              <button 
                onClick={() => {
                  const overlay = document.createElement('div');
                  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.backgroundColor = 'black'; 
                  overlay.style.zIndex = '9999'; overlay.style.transition = 'opacity 3s ease'; overlay.style.opacity = '0';
                  document.body.appendChild(overlay);
                  setTimeout(() => { overlay.style.opacity = '1'; }, 50);
                  setTimeout(() => { setPhase("closed"); }, 3000);
                }}
                className="px-20 py-7 border border-[#333] text-[10px] tracking-[0.6em] text-[#E0E0E0] hover:text-[#DAA520] hover:border-[#DAA520] transition-all uppercase"
              >
                [ ⬛ 시스템 종료 및 자유 시간 시작 ]
              </button>
            </div>
          )}
        </div>
      )}
    </GateGuard>
  );
}