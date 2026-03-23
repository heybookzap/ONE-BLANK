"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  refreshKey: number;
}

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const from = prevRef.current;
    if (from === target) return;
    prevRef.current = target;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

interface Stat {
  label: string;
  num: number;
  prefix?: string;
  suffix?: string;
  active: boolean;
}

export default function ROISection({ refreshKey }: Props) {
  const [hourlyRate, setHourlyRate] = useState(0);
  const [rateInput, setRateInput] = useState("");
  const [todayMin, setTodayMin] = useState(0);
  const [totalMin, setTotalMin] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem("oneBlank_roi");
    if (raw) {
      const { hourlyRate: r } = JSON.parse(raw);
      setHourlyRate(r);
      setRateInput(r.toLocaleString("ko-KR"));
    }
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRaw = localStorage.getItem("oneBlank_pomodoro");
    if (todayRaw) {
      const d = JSON.parse(todayRaw);
      setTodayMin(d.date === today ? d.totalMinutes : 0);
    }
    const allRaw = localStorage.getItem("oneBlank_pomodoroAll");
    if (allRaw) setTotalMin(JSON.parse(allRaw).totalMinutes);
  }, [refreshKey]);

  function saveRate() {
    const n = parseInt(rateInput.replace(/,/g, ""), 10);
    if (!isNaN(n) && n > 0) {
      setHourlyRate(n);
      setRateInput(n.toLocaleString("ko-KR"));
      localStorage.setItem("oneBlank_roi", JSON.stringify({ hourlyRate: n }));
    }
  }

  const todayEarnings = Math.round((todayMin / 60) * hourlyRate);
  const totalEarnings = Math.round((totalMin / 60) * hourlyRate);

  const animTodayMin      = useCountUp(todayMin);
  const animTotalMin      = useCountUp(totalMin);
  const animTodayEarnings = useCountUp(todayEarnings);
  const animTotalEarnings = useCountUp(totalEarnings);

  const fmt = (n: number) => n.toLocaleString("ko-KR");

  const stats: Stat[] = [
    { label: "오늘 집중",  num: animTodayMin,      suffix: "분", active: true },
    { label: "오늘 수익",  num: animTodayEarnings,  prefix: "₩", active: !!hourlyRate },
    { label: "누적 집중",  num: animTotalMin,       suffix: "분", active: true },
    { label: "누적 수익",  num: animTotalEarnings,  prefix: "₩", active: !!hourlyRate },
  ];

  return (
    <section className="py-32 px-6 max-w-2xl mx-auto w-full">
      {/* 섹션 헤더 */}
      <p className="text-[10px] text-[#333333] tracking-[0.3em] uppercase mb-6">
        ROI
      </p>
      <h2 className="text-2xl font-light text-white tracking-tight mb-3">
        내 시간의 가치
      </h2>
      {/* 서브타이틀: 극도로 흐리게 — 읽힐 필요 없음, 공간 역할만 */}
      <p className="text-xs text-[#252525] mb-16 tracking-wide">
        집중한 시간을 수익으로 환산합니다.
      </p>

      {/* ── 시간당 단가 입력 ── */}
      <div className="mb-20">
        {/* 레이블: 거의 안 보이게 */}
        <p className="text-[9px] text-[#252525] tracking-[0.38em] uppercase mb-6">
          시간당 단가
        </p>
        <div className="flex items-end gap-2">
          {/* ₩ 기호: muted */}
          <span className="text-base text-[#2E2E2E] font-light pb-2 select-none">
            ₩
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={rateInput}
            onChange={(e) => setRateInput(e.target.value)}
            onBlur={saveRate}
            onKeyDown={(e) => e.key === "Enter" && saveRate()}
            placeholder="50,000"
            className="
              bg-transparent border-b border-[#222222]
              text-white text-3xl font-thin tabular-nums tracking-tight
              pb-2 w-40
              placeholder:text-[#1E1E1E]
              focus:outline-none focus:border-[#444444]
              transition-colors duration-300
            "
          />
          {/* 단위: muted */}
          <span className="text-[10px] text-[#252525] tracking-[0.25em] uppercase pb-3 select-none">
            / 시간
          </span>
        </div>
      </div>

      {/* ── 통계 그리드 ── */}
      {/* gap-px + bg로 1px 격자선 생성 */}
      <div className="grid grid-cols-2 gap-px bg-[#181818]">
        {stats.map(({ label, num, prefix, suffix, active }) => (
          <div key={label} className="bg-[#111111] pt-10 pb-12 px-2 first:px-0">

            {/* 숫자 — 화면의 주인공 */}
            <div className="flex items-end gap-1.5 mb-4">
              {/* 통화 기호: 작고 흐리게 */}
              {prefix && active && (
                <span className="text-base text-[#383838] font-light pb-1.5 select-none">
                  {prefix}
                </span>
              )}

              <span
                className={`text-5xl font-thin tabular-nums tracking-tight leading-none transition-colors duration-500
                  ${active ? "text-white" : "text-[#252525]"}`}
              >
                {active ? fmt(num) : "—"}
              </span>

              {/* 단위: 작고 흐리게 */}
              {suffix && active && (
                <span className="text-sm text-[#383838] font-light pb-1.5 select-none">
                  {suffix}
                </span>
              )}
            </div>

            {/* 레이블 — 숫자 아래, 극도로 흐리게 */}
            <p className="text-[9px] text-[#272727] tracking-[0.38em] uppercase">
              {label}
            </p>

            {/* 단가 미설정 시 안내: 역시 muted */}
            {!active && (
              <p className="text-[9px] text-[#1E1E1E] tracking-wide mt-1.5">
                단가 설정 후 표시
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
