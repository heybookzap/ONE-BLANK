"use client";
import { useState } from "react";

export default function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [habit, setHabit] = useState("");
  const [rate, setRate] = useState("");
  const [area, setArea] = useState("");

  const nextStep = () => {
    if (step === 2 && (isNaN(Number(rate)) || Number(rate) <= 0)) return;
    if (step < 3) setStep(step + 1);
    else {
      localStorage.setItem("ob_worst_habit", habit);
      localStorage.setItem("ob_rate", rate);
      localStorage.setItem("ob_focus_area", area);
      localStorage.setItem("oneBlank_onboardingComplete", "true");
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black text-center font-sans">
      <div className="w-full max-w-2xl">
        <p className="text-[10px] tracking-[0.4em] text-[#A0A0A0] uppercase mb-12 font-light">Initial Setup : {step} / 3</p>
        {step === 1 && (
          <div className="animate-fade-in space-y-16">
            <h1 className="text-3xl font-light text-white tracking-tight leading-relaxed">가장 버리고 싶은<br /><span className="text-[#DAA520]">최악의 습관</span>은 무엇입니까?</h1>
            <input type="text" value={habit} onChange={(e) => setHabit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && nextStep()} className="w-full bg-transparent border-b border-[#333] text-white text-2xl font-extralight py-6 text-center focus:outline-none focus:border-[#DAA520]" placeholder="습관 입력" autoFocus />
          </div>
        )}
        {step === 2 && (
          <div className="animate-fade-in space-y-12">
            <h1 className="text-3xl font-light text-white tracking-tight leading-relaxed">당신의 가치를<br /><span className="text-[#DAA520]">시급</span>으로 환산한다면 얼마입니까?</h1>
            <div className="space-y-4">
              <p className="text-[11px] text-[#DAA520] font-light italic">예: 30000 (3만 원), 100000 (10만 원)</p>
              <p className="text-[10px] text-[#E0E0E0] opacity-60 tracking-widest font-extralight uppercase">단위나 한글 없이 '숫자만' 입력하십시오.</p>
            </div>
            <div className="relative max-w-sm mx-auto mt-10">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xl text-[#DAA520] font-light">₩</span>
              <input type="number" inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && nextStep()} className="w-full bg-transparent border-b border-[#333] text-white text-5xl font-extralight py-6 text-center focus:outline-none focus:border-[#DAA520]" autoFocus />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="animate-fade-in space-y-16">
            <h1 className="text-3xl font-light text-white tracking-tight">주력 분야를 선택하십시오.</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["자기계발 / 학습", "비즈니스 / 업무", "사이드 프로젝트"].map((item) => (
                <button key={item} onClick={() => { setArea(item); setTimeout(nextStep, 100); }} className={`p-6 border transition-all text-sm tracking-wider font-light ${area === item ? 'border-[#DAA520] text-[#DAA520] bg-[#DAA520]/5' : 'border-[#333] text-white hover:border-white'}`}>{item}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}