"use client";

export default function ROISection({ totalValue, totalMinutes }: { totalValue: number, totalMinutes: number }) {
  const hourlyRate = typeof window !== "undefined" ? Number(localStorage.getItem("ob_rate") || "0") : 0;
  const validRate = isNaN(hourlyRate) || hourlyRate <= 0 ? 0 : hourlyRate;
  const TARGET = validRate * 2; 
  const safeTarget = TARGET > 0 ? TARGET : 1;
  const recoveryPercent = Math.min(Math.round((totalValue / safeTarget) * 100), 100);

  return (
    <div className="w-full flex flex-col items-center space-y-16 py-10 animate-fade-in">
      <div className="text-center">
        <p className="text-[10px] text-[#A0A0A0] tracking-[0.5em] uppercase mb-4 font-light">누적 자산 가치</p>
        <h3 className="text-5xl font-extralight text-[#DAA520] tracking-tight">₩ {(totalValue || 0).toLocaleString()}</h3>
      </div>
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-between text-[10px] text-[#A0A0A0] tracking-widest uppercase">
          <span>자산 회수율: {recoveryPercent}%</span>
          <span>목표 자산: ₩ {safeTarget.toLocaleString()}</span>
        </div>
        <div className="h-[1px] w-full bg-[#222] relative"><div className="absolute top-0 left-0 h-full bg-[#DAA520] transition-all duration-1000" style={{ width: `${recoveryPercent}%` }} /></div>
      </div>
      <div className="flex gap-20">
        <div className="text-center">
          <p className="text-[10px] text-[#A0A0A0] tracking-widest uppercase mb-3 font-light">총 몰입 시간</p>
          <p className="text-2xl font-extralight text-white">{(totalMinutes || 0)} <span className="text-xs text-[#A0A0A0]">min</span></p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-[#A0A0A0] tracking-widest uppercase mb-3 font-light">설정 시급</p>
          <p className="text-2xl font-extralight text-[#A0A0A0]">₩ {validRate.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}