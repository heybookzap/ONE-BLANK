"use client";

import { useState, useEffect, useRef } from "react";

function useCountUp(target: number, duration = 1200) {
  const [v, setV] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    if (from === target) return;
    prev.current = target;
    const t0 = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      setV(Math.round(from + (target - from) * (1 - (1 - t) ** 3)));
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [target, duration]);
  return v;
}

export default function EarningsWidget({ refreshKey }: { refreshKey: number }) {
  const [earnings, setEarnings] = useState(0);
  const [hasRate, setHasRate] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const rate: number = JSON.parse(localStorage.getItem("oneBlank_roi") ?? "{}").hourlyRate ?? 0;
    const raw = localStorage.getItem("oneBlank_pomodoro");
    const min = raw ? (() => { const d = JSON.parse(raw); return d.date === today ? d.totalMinutes : 0; })() : 0;
    setEarnings(Math.round((min / 60) * rate));
    setHasRate(rate > 0);
  }, [refreshKey]);

  const displayed = useCountUp(earnings);

  if (!hasRate || earnings === 0) return null;

  return (
    <div className="py-20 px-6 max-w-2xl mx-auto w-full text-center ob-fade-in">
      <p className="text-6xl font-thin text-white tabular-nums tracking-tight mb-5">
        ₩{displayed.toLocaleString("ko-KR")}
      </p>
      <p className="text-xs text-[#333333] tracking-[0.22em]">
        당신은 오늘 이미 본전 그 이상을 해냈습니다.
      </p>
    </div>
  );
}
