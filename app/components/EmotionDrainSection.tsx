"use client";
import { useState } from "react";

export default function EmotionDrainSection({ onComplete }: { onComplete: () => void }) {
  const [drainText, setDrainText] = useState("");
  const [isWashing, setIsWashing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [comfortMessage, setComfortMessage] = useState("");

  const handleDrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drainText.trim()) return;

    localStorage.setItem("ob_drain_text", drainText);
    setIsWashing(true);

    try {
      const res = await fetch("/api/comfort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drainText })
      });
      const data = await res.json();
      setComfortMessage(data.message);
    } catch (error) {
      setComfortMessage(`그 무거운 마음, 이제 이곳에 다 쏟아내셨나요? 당신이 느낀 그 감정들은 결코 헛된 것이 아닙니다. 이제 정돈된 마음으로 오늘 단 하나의 승리에만 집중해 봅시다.`);
    } finally {
      setIsWashing(false);
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 6000);
    }
  };

  if (isComplete) {
    return (
      <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center px-4">
        <h1 className="text-3xl font-light text-white mb-8 tracking-tight">The Wash Complete.</h1>
        <p className="text-lg text-[#E0E0E0] font-light leading-[2.0] tracking-wide whitespace-pre-line">
          {comfortMessage}
        </p>
      </div>
    );
  }

  if (isWashing) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-8 h-8 border-t border-[#DAA520] rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] text-[#A0A0A0] tracking-[0.4em] uppercase">Cleaning your emotional noise...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center px-4">
      <p className="text-[10px] text-[#DAA520] tracking-[0.5em] uppercase mb-10 opacity-70">Emotion Drain</p>
      <h2 className="text-2xl font-light text-white mb-12 tracking-tight leading-relaxed whitespace-pre-line">
        지금 당신의 머릿속을{"\n"}어지럽히는 감정이나 소음은 무엇입니까?
      </h2>
      <form onSubmit={handleDrain} className="w-full relative">
        <input
          type="text"
          value={drainText}
          onChange={(e) => setDrainText(e.target.value)}
          className="w-full bg-transparent border-b border-[#333] text-white text-xl font-extralight py-4 text-center focus:outline-none focus:border-[#DAA520] transition-all"
          placeholder="머릿속의 소음을 모두 뱉어내십시오"
          autoFocus
        />
        <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-[#E0E0E0] tracking-[0.3em] hover:text-[#DAA520] uppercase transition-colors pb-1">[ ENTER ]</button>
      </form>
    </div>
  );
}