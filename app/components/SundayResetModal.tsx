"use client";
import { useState, useEffect } from "react";

export default function SundayResetModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState({ value: 0, time: 0 });

  useEffect(() => {
    setData({
      value: Number(localStorage.getItem("ob_total_saving") || "0"),
      time: Number(localStorage.getItem("ob_total_time") || "0")
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full aspect-[9/16] bg-[#0d0d0d] border border-[#222] p-12 flex flex-col items-center justify-between shadow-[0_0_100px_rgba(184,134,11,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8860B]/5 blur-3xl rounded-full" />
          <div className="z-10 text-center">
            <p className="text-[10px] tracking-[0.8em] text-[#B8860B] uppercase mb-4">One Blank</p>
            <p className="text-[8px] tracking-widest text-[#555] uppercase">Weekly Focus Proved</p>
          </div>
          <div className="z-10 w-full space-y-16">
            <div className="text-center">
              <p className="text-[9px] text-[#444] tracking-widest uppercase mb-6 border-b border-[#1a1a1a] pb-2">Value Secured</p>
              <p className="text-4xl font-light text-[#B8860B] tracking-tight">₩ {data.value.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] text-[#444] tracking-widest uppercase mb-6 border-b border-[#1a1a1a] pb-2">Time Immersed</p>
              <p className="text-4xl font-extralight text-white tracking-tighter">{Math.floor(data.time/60)}h {data.time%60}m</p>
            </div>
          </div>
          <div className="z-10 text-center border-t border-[#1a1a1a] pt-10 w-full">
            <p className="text-[11px] font-extralight text-[#888] leading-relaxed tracking-wide">성취를 증명한 당신은<br /><span className="text-white">Ghost Tribe</span> 입니다.</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-6 w-full">
          <p className="text-[9px] text-[#555] tracking-widest animate-pulse">캡처하여 당신의 성취를 기록하십시오.</p>
          <button onClick={onClose} className="w-full py-5 bg-[#111] border border-[#222] text-[10px] tracking-[0.5em] text-[#555] hover:text-[#B8860B] uppercase transition-all">[ Reset for New Week ]</button>
        </div>
      </div>
    </div>
  );
}