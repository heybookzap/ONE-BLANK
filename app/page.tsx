"use client";
import { useState, useEffect } from "react";
import GateGuard from "./components/GateGuard"; 
import OnboardingModal from "./components/OnboardingModal"; 
import EmotionDrainSection from "./components/EmotionDrainSection";
import PomodoroSection from "./components/PomodoroSection";
import ROISection from "./components/ROISection";
import SundayResetModal from "./components/SundayResetModal";
import { supabase } from "./lib/supabase";

const ENDING_MESSAGES = [
  "오늘 하루의 주도권은\n이제 당신의 것입니다.",
  "완벽한 통제.\n오늘 첫 승리를 쟁취하셨습니다.",
  "세상의 소음이\n당신을 건드릴 수 없는 상태입니다.",
  "가장 무거운 바위를\n기어코 치워냈습니다."
];

export default function Dashboard() {
  const [phase, setPhase] = useState<"drain" | "onething" | "timer" | "roi" | "final" | "closed">("drain");
  const [oneThing, setOneThing] = useState("");
  const [sessionData, setSessionData] = useState({ sessionValue: 0, totalValue: 0, totalMinutes: 0 });
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [worstHabit, setWorstHabit] = useState(""); 
  const [liveOnes, setLiveOnes] = useState(0);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [finalMessage, setFinalMessage] = useState("");
  const [showSundayModal, setShowSundayModal] = useState(false);

  useEffect(() => {
    const activePool = [0, 0, 0, 0, 1, 1, 1, 1, 2, 3, 4, 5, 6, 7];
    setLiveOnes(activePool[Math.floor(Math.random() * activePool.length)]);
    
    const onboarded = localStorage.getItem("oneBlank_onboardingComplete");
    
    if (onboarded) {
      setIsOnboarding(false);
      setWorstHabit(localStorage.getItem("ob_worst_habit") || "");

      const today = new Date().getDay();
      const lastReportDate = localStorage.getItem("ob_last_sunday_report");
      const currentDateStr = new Date().toDateString();

      if (today === 0 && lastReportDate !== currentDateStr) {
        setShowSundayModal(true);
      }
    }
  }, [isOnboarding]);

  const handleCloseSundayModal = () => {
    localStorage.setItem("ob_last_sunday_report", new Date().toDateString());
    setShowSundayModal(false);
  };

  const playSound = (type: "start" | "end") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "start") {
        osc.type = "square";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 1.0);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.0);
      }
    } catch (e) {}
  };

  const handleStartTimer = (e: React.FormEvent) => {
    e.preventDefault();
    if (oneThing) {
      playSound("start");
      setPhase("timer");
    }
  };

  const handleAIRecommend = async () => {
    setIsAILoading(true);
    setShowSuggestions(false);
    const drainText = localStorage.getItem("ob_drain_text") || "기록 없음";
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ worstHabit, drainText })
      });
      const data = await response.json();
      setCurrentSuggestions(data.suggestions);
    } catch (error) {
      setCurrentSuggestions([
        "제일 무거운 일 하나만 끝내기", 
        "복잡한 생각 버리고 첫 줄 쓰기", 
        "미루고 싶던 일 25분만 하기"
      ]);
    } finally {
      setIsAILoading(false);
      setShowSuggestions(true);
    }
  };

  const handleCalculateROI = async (seconds: number) => {
    playSound("end");
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

    // --- [익명 ID 생성 로직 추가] ---
    let anonymousId = localStorage.getItem("ob_anonymous_id");
    if (!anonymousId) {
      anonymousId = crypto.randomUUID(); // 겹치지 않는 고유 번호 생성
      localStorage.setItem("ob_anonymous_id", anonymousId);
    }
    // ----------------------------

    const userName = localStorage.getItem("ob_user_name") || "익명온스";
    const drainText = localStorage.getItem("ob_drain_text") || "기록 없음";
    
    const { error: insertError } = await supabase.from('daily_logs').insert([{
      user_id: anonymousId,
      user_name: userName,
      drain_text: drainText,
      one_thing: oneThing
    }]);
    if (insertError) {
      console.error("데이터 저장 실패:", insertError.message);
    }
    
    setPhase("roi");
  };

  return (
    <GateGuard>
      {isOnboarding && <OnboardingModal onComplete={() => { setIsOnboarding(false); setWorstHabit(localStorage.getItem("ob_worst_habit") || ""); }} />}
      {!isOnboarding && (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-center">
          
          {showSundayModal && <SundayResetModal onClose={handleCloseSundayModal} />}

          {phase !== "final" && phase !== "closed" && (
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
              <h2 className="text-2xl font-light text-white mb-10 tracking-tight">이 습관을 지우기 위한 오늘의 목표는?</h2>
              <form onSubmit={handleStartTimer} className="w-full relative max-w-lg mb-8">
                <input type="text" value={oneThing} onChange={(e) => setOneThing(e.target.value)} className="w-full bg-transparent border-b border-[#333] text-white text-2xl font-extralight py-6 text-center focus:outline-none focus:border-[#DAA520] transition-all" placeholder="단 하나의 본질" autoFocus />
                <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-[#E0E0E0] tracking-[0.3em] hover:text-[#DAA520] uppercase transition-colors pb-1">[ ENTER ]</button>
              </form>
              <div className="w-full max-w-lg flex flex-col items-center min-h-[100px]">
                {!showSuggestions && !isAILoading && (
                  <button onClick={handleAIRecommend} className="text-[10px] text-[#A0A0A0] tracking-[0.3em] border border-[#333] px-6 py-2 rounded-full hover:bg-[#111] transition-all">[ AI 디렉터의 행동 제안 받기 ]</button>
                )}
                {isAILoading && <p className="text-[10px] text-[#DAA520] tracking-[0.4em] animate-pulse uppercase">AI Analyzing Context...</p>}
                {showSuggestions && (
                  <div className="w-full flex flex-col gap-2 animate-fade-in">
                    {currentSuggestions.map((suggestion, idx) => (
                      <button key={idx} onClick={() => setOneThing(suggestion)} className="w-full text-left text-sm text-[#E0E0E0] font-light bg-[#111] border border-[#222] p-4 hover:border-[#DAA520] transition-all">{suggestion}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {phase === "timer" && (
            <div className="w-full animate-fade-in flex flex-col items-center">
              <div className="mb-16 flex flex-col items-center">
                <p className="text-[9px] text-[#A0A0A0] tracking-[0.6em] uppercase mb-4 opacity-80">Current Focus</p>
                <div className="px-6 py-2 border-x border-[#222] relative">
                  <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#DAA520]" />
                  <div className="absolute bottom-0 right-0 w-2 h-[1px] bg-[#DAA520]" />
                  <h3 className="text-xl md:text-2xl font-light text-[#DAA520] tracking-tight">{oneThing}</h3>
                </div>
              </div>
              <PomodoroSection onSessionComplete={handleCalculateROI} />
            </div>
          )}
          {phase === "roi" && (
            <div className="w-full max-w-4xl animate-fade-in flex flex-col items-center">
              <p className="text-[12px] text-[#A0A0A0] tracking-[0.5em] uppercase mb-6">Value Secured Today</p>
              <h1 className="text-6xl font-extralight text-[#DAA520] mb-8 tracking-tighter">₩ {sessionData.sessionValue.toLocaleString()}</h1>
              <ROISection totalValue={sessionData.totalValue} totalMinutes={sessionData.totalMinutes} />
              <button onClick={() => { setFinalMessage(ENDING_MESSAGES[Math.floor(Math.random() * ENDING_MESSAGES.length)]); setPhase("final"); }} className="mt-20 text-[10px] text-[#E0E0E0] hover:text-[#DAA520] transition-all uppercase tracking-[0.5em]">[ 자산 확인 완료 ]</button>
            </div>
          )}
          {phase === "final" && (
            <div className="w-full max-w-3xl animate-fade-in flex flex-col items-center space-y-12">
              <p className="text-[10px] tracking-[0.8em] text-[#DAA520] uppercase font-light">Mission Accomplished</p>
              <h1 className="text-3xl md:text-4xl font-light text-white leading-tight whitespace-pre-line">{finalMessage}</h1>
              <div className="py-10 border-y border-[#111] w-full max-w-md">
                <p className="text-sm font-extralight leading-[2.2] text-[#E0E0E0] tracking-wide">세상의 소음을 차단하고, 기어코 오늘 하루의<br />주도권을 쥐어낸 당신을 응원합니다.</p>
              </div>
              <button onClick={() => { const overlay = document.createElement('div'); overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.backgroundColor = 'black'; overlay.style.zIndex = '9999'; overlay.style.transition = 'opacity 3s ease'; overlay.style.opacity = '0'; document.body.appendChild(overlay); setTimeout(() => { overlay.style.opacity = '1'; }, 50); setTimeout(() => { setPhase("closed"); }, 3000); }} className="px-20 py-7 border border-[#333] text-[10px] tracking-[0.6em] text-[#E0E0E0] hover:text-[#DAA520] hover:border-[#DAA520] transition-all uppercase">[ ⬛ 시스템 종료 및 자유 시간 시작 ]</button>
            </div>
          )}
          {phase === "closed" && <div className="min-h-screen bg-black" />}
        </div>
      )}
    </GateGuard>
  );
}