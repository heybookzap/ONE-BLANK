"use client";
import { useState } from "react";

export default function EmotionDrainSection({ onComplete }: { onComplete: () => void }) {
  const [drainText, setDrainText] = useState("");
  const [isWashing, setIsWashing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleDrain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drainText.trim()) return;

    localStorage.setItem("ob_drain_text", drainText);
    setIsWashing(true);

    setTimeout(() => {
      setIsWashing(false);
      setIsComplete(true);
      setTimeout(() => {
        onComplete();
      }, 3500);
    }, 2500);
  };

  if (isComplete) {
    const shortText = drainText.length > 15 ? drainText.substring(0, 15) + "..." : drainText;
    return (
      <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center">
        <h1 className="text-3xl font-light text-white mb-6 tracking-tight">The Wash Complete.</h1>
        <p className="text-sm text-[#E0E0E0] font-light leading-[2.0] tracking-wide">
          당신이 쏟아낸 <span className="text-[#DAA520]">[{shortText}]</span><br/>
          이 감정은 이제 통제선 밖으로 영구 폐기되었습니다.<br/>
          더 이상 당신의 하루를 방해할 수 없습니다.
        </p>
      </div>
    );
  }

  if (isWashing) {
    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-8 h-8 border-t border-[#DAA520] rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] text-[#A0A0A0] tracking-[0.4em] uppercase">Washing your noise...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center text-center">
      <p className="text-[10px] text-[#DAA520] tracking-[0.5em] uppercase mb-10 opacity-70">Emotion Drain</p>
      <h2 className="text-2xl font-light text-white mb-12 tracking-tight">지금 당신의 머릿속을<br/>어지럽히는 감정이나 소음은 무엇입니까?</h2>
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