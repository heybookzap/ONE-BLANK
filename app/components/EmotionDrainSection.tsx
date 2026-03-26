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
      setComfortMessage("그 무거운 감정, 충분히 이해합니다. 이제 이 공간에 내려놓고 당신의 빛나는 하루를 위해 작은 한 걸음을 내디뎌 봅시다.");
    } finally {
      setIsWashing(false);
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 5500); // 문장을 충분히 읽을 수 있도록 대기 시간 5.5초로 연장
    }
  };

  if (isComplete) {
    return (
      <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center px-4">
        <h1 className="text-3xl font-light text-white mb-8 tracking-tight">The Wash Complete.</h1>
        <p className="text-lg text-[#E0E0E0] font-light leading-[1.8] tracking-wide whitespace-pre-line">
          {comfortMessage}
        </p>
      </div>
    );
  }

  if (isWashing) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-8 h-8 border-t border-[#DAA520] rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] text-[#A0A0A0] tracking-[0.4em] uppercase">AI Director is listening...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center">
      <p className="text-[10px] text-[#DAA520] tracking-[0.5em] uppercase mb-10 opacity-70">Emotion Drain</p>
      <h2 className="text-2xl font-light text-white mb-12 tracking-tight whitespace-pre-line">지금 당신의 머릿속을\n어지럽히는 감정이나 소음은 무엇입니까?</h2>
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