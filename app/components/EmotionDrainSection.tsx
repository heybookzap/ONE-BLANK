"use client";
import { useState } from "react";

export default function EmotionDrainSection({ onComplete }: { onComplete: () => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWash = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setTimeout(() => {
      let personalizedMsg = "";
      if (text.length < 10) personalizedMsg = `당신의 고요한 결단을 읽었습니다. 이제 그 의지로 본질에 도달하십시오.`;
      else if (text.includes("불안") || text.includes("걱정")) personalizedMsg = `당신을 찌르던 날카로운 불안은 소멸되었습니다. 이제 당신의 날카로움은 목표만을 향해야 합니다.`;
      else personalizedMsg = `쏟아낸 감정은 여백에 묻었습니다. 이제 비워진 만큼, 당신의 몰입은 더 거대할 것입니다.`;
      setResult(personalizedMsg);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center justify-center animate-fade-in min-h-[50vh]">
      {!result ? (
        <>
          <p className="text-[10px] tracking-[0.5em] text-[#A0A0A0] uppercase mb-16 font-light">Step 01. Emotion Reset</p>
          <h2 className="text-2xl font-light text-white text-center mb-16 tracking-tight">"낭비된 시간이 당신을 더 날카롭게 만듭니다."</h2>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-transparent border border-[#222] p-8 text-white font-extralight focus:outline-none focus:border-[#DAA520]/40 h-40 resize-none text-center text-lg" placeholder="어제의 미련이나 지금의 불안을 모두 쏟아내십시오." />
          <button onClick={handleWash} className="mt-16 px-12 py-4 border border-[#333] text-[10px] tracking-[0.4em] text-[#A0A0A0] hover:text-[#DAA520] uppercase transition-all">{loading ? "Washing..." : "[ Wash the Mind ]"}</button>
        </>
      ) : (
        <div className="text-center space-y-20 animate-fade-in">
          <p className="text-[9px] text-[#DAA520] tracking-widest uppercase font-medium">The Wash Complete</p>
          <h1 className="text-2xl md:text-3xl text-white font-bold leading-relaxed tracking-tight px-6 italic">"{result}"</h1>
          <button onClick={onComplete} className="px-10 py-4 border border-[#333] text-[10px] tracking-[0.4em] text-[#A0A0A0] hover:text-white uppercase transition-all">ONE-THING 설정하기 →</button>
        </div>
      )}
    </div>
  );
}