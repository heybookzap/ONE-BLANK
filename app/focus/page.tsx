"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Phase = "idle" | "focus" | "break" | "paused_focus" | "paused_break";

const FOCUS      = 25 * 60;
const BREAK      = 5 * 60;
const CIRC       = 2 * Math.PI * 85;
const MAX_RESETS = 3;
const GOLD       = "#BF9B5E";

function today() { return new Date().toISOString().slice(0, 10); }
function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function playStartSound() {
  try {
    const ctx  = new AudioContext();
    const now  = ctx.currentTime;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-10, now);
    comp.knee.setValueAtTime(6, now);
    comp.ratio.setValueAtTime(5, now);
    comp.attack.setValueAtTime(0.001, now);
    comp.release.setValueAtTime(0.3, now);
    comp.connect(ctx.destination);
    const master = ctx.createGain();
    master.gain.value = 2.2;
    master.connect(comp);
    const layers: [number, OscillatorType, number, number][] = [
      [55,  "sine",     0.85, 3.0],
      [110, "sine",     0.50, 2.2],
      [220, "sine",     0.22, 1.5],
      [440, "triangle", 0.10, 1.0],
    ];
    for (const [freq, type, vol, dur] of layers) {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = type; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(g); g.connect(master);
      osc.start(now); osc.stop(now + dur);
    }
  } catch {}
}

function playBeep(freq: number, dur: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    g.gain.setValueAtTime(0.28, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
  } catch {}
}

export default function FocusPage() {
  const [oneThing,         setOneThing]         = useState("");
  const [mounted,          setMounted]          = useState(false);
  const [phase,            setPhase]            = useState<Phase>("idle");
  const [timeLeft,         setTimeLeft]         = useState(FOCUS);
  const [sessions,         setSessions]         = useState(0);
  const [resetsLeft,       setResetsLeft]       = useState(MAX_RESETS);
  const [isPulsing,        setIsPulsing]        = useState(false);
  const [showFocusComplete, setShowFocusComplete] = useState(false);
  const [skipTrans,        setSkipTrans]        = useState(false);

  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("oneBlank_today");
    if (!raw) { router.push("/"); return; }
    const { oneThing: ot, date } = JSON.parse(raw);
    if (date !== today()) { router.push("/"); return; }
    setOneThing(ot);
    const rr = localStorage.getItem("oneBlank_resets");
    if (rr) { const { date: d, count } = JSON.parse(rr); if (d === today()) setResetsLeft(count); }
    const pr = localStorage.getItem("oneBlank_pomodoro");
    if (pr) { const d = JSON.parse(pr); if (d.date === today()) setSessions(d.sessions); }
    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (phase !== "focus" && phase !== "break") return;
    const id = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (timeLeft !== 0) return;
    const cur = phaseRef.current;
    if (cur === "focus") {
      setShowFocusComplete(true);
      playBeep(528, 1.2);
      const raw  = localStorage.getItem("oneBlank_pomodoro");
      const prev = raw ? JSON.parse(raw) : { date: "", sessions: 0, totalMinutes: 0 };
      const upd  = {
        date: today(),
        sessions:     (prev.date === today() ? prev.sessions     : 0) + 1,
        totalMinutes: (prev.date === today() ? prev.totalMinutes : 0) + 25,
      };
      localStorage.setItem("oneBlank_pomodoro", JSON.stringify(upd));
      const allRaw = localStorage.getItem("oneBlank_pomodoroAll");
      const all    = allRaw ? JSON.parse(allRaw) : { totalSessions: 0, totalMinutes: 0 };
      localStorage.setItem("oneBlank_pomodoroAll", JSON.stringify({
        totalSessions: all.totalSessions + 1,
        totalMinutes:  all.totalMinutes  + 25,
      }));
      setSessions(upd.sessions);
      setTimeout(() => { setShowFocusComplete(false); snap("break", BREAK); }, 3800);
    } else if (cur === "break") {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 900);
      playBeep(440, 0.6);
      snap("idle", FOCUS);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function snap(nextPhase: Phase, nextTime: number) {
    setSkipTrans(true);
    setPhase(nextPhase);
    setTimeLeft(nextTime);
    requestAnimationFrame(() => requestAnimationFrame(() => setSkipTrans(false)));
  }

  function start()       { playStartSound(); snap("focus", FOCUS); }
  function pause()       { setPhase(phase === "focus" ? "paused_focus" : "paused_break"); }
  function resume()      { setPhase(phase === "paused_focus" ? "focus" : "break"); }
  function handleReset() {
    if (resetsLeft <= 0) return;
    const next = resetsLeft - 1;
    setResetsLeft(next);
    localStorage.setItem("oneBlank_resets", JSON.stringify({ date: today(), count: next }));
    snap("idle", FOCUS);
  }

  const totalTime    = phase === "break" || phase === "paused_break" ? BREAK : FOCUS;
  const fillProgress = (totalTime - timeLeft) / totalTime;
  const strokeOffset = CIRC * (1 - fillProgress);
  const isRunning    = phase === "focus" || phase === "break";
  const isPaused     = phase === "paused_focus" || phase === "paused_break";
  const isBreak      = phase === "break" || phase === "paused_break";
  const ringColor    = isBreak ? "#484848" : "#FFFFFF";

  const phaseLabel: Record<Phase, string> = {
    idle:         sessions > 0 ? "다음 세션" : "준비",
    focus:        "집중 중",
    break:        "휴식 중",
    paused_focus: "일시 정지",
    paused_break: "일시 정지",
  };

  if (!mounted) return null;

  return (
    <>
      {isPulsing && (
        <div className="fixed inset-0 z-50 pointer-events-none bg-white ob-pulse" aria-hidden />
      )}

      {showFocusComplete && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-[#111111]/75 ob-golden-bg" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="ob-golden-core" />
            <div className="ob-golden-ring-1" />
            <div className="ob-golden-ring-2" />
            <div className="ob-golden-ring-3" />
          </div>
          <div className="relative z-10 text-center ob-golden-text pointer-events-none">
            <p className="text-4xl sm:text-5xl font-thin tracking-wide" style={{ color: "#F2C840" }}>
              매듭지었습니다
            </p>
            <p className="text-xs tracking-[0.5em] mt-5 uppercase" style={{ color: "#B8942A" }}>
              완벽한 몰입이었습니다
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#111111] flex flex-col">
        {/* 헤더 */}
        <header className="sticky top-0 z-40 bg-[#111111]/90 backdrop-blur-md border-b border-[#1E1E1E]">
          <div className="max-w-2xl mx-auto px-6 h-12 flex items-center justify-between">
            <span className="text-[9px] font-semibold tracking-[0.38em] text-[#444444] uppercase select-none">
              ONE BLANK
            </span>
            <Link
              href="/dashboard"
              className="text-[10px] text-[#555555] hover:text-[#AAAAAA] transition-colors duration-300 tracking-[0.2em] uppercase"
            >
              ← 대시보드
            </Link>
          </div>
        </header>

        {/* 메인 */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-16">

          {/* 원 띵 */}
          <div className="text-center max-w-xl w-full">
            <p className="text-[10px] text-[#555555] tracking-[0.4em] uppercase mb-4 select-none">
              오늘의 원 띵
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight leading-snug break-keep">
              {oneThing}
            </h1>
          </div>

          {/* 타이머 */}
          <div className="flex flex-col items-center gap-10">
            <div className="relative w-56 h-56">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200" aria-hidden>
                <circle cx="100" cy="100" r="85" fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
                <circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={strokeOffset}
                  style={{ transition: skipTrans ? "none" : "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                />
                {phase === "focus" && fillProgress > 0.02 && (
                  <circle
                    cx="100" cy="100" r="85"
                    fill="none"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1 9999"
                    strokeDashoffset={strokeOffset - 0.5}
                    style={{ transition: skipTrans ? "none" : "stroke-dashoffset 1s linear" }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className={`text-4xl font-light tracking-tight tabular-nums transition-colors duration-500
                  ${isBreak ? "text-[#666666]" : "text-white"}`}>
                  {fmt(timeLeft)}
                </span>
                <span className="text-[10px] text-[#555555] tracking-[0.28em] uppercase">
                  {phaseLabel[phase]}
                </span>
              </div>
            </div>

            {/* 컨트롤 */}
            <div className="flex items-center gap-8 flex-wrap justify-center">
              {phase === "idle" && (
                <button
                  onClick={start}
                  className="text-base font-medium tracking-[0.22em] uppercase text-white hover:text-[#AAAAAA] transition-colors duration-300"
                >
                  {sessions > 0 ? "한 번 더" : "시작"}
                </button>
              )}
              {isPaused && (
                <button onClick={resume}
                  className="text-base font-medium tracking-[0.22em] uppercase text-white hover:text-[#AAAAAA] transition-colors duration-300">
                  계속하기
                </button>
              )}
              {isRunning && (
                <button onClick={pause}
                  className="text-sm font-medium tracking-[0.22em] uppercase text-[#666666] hover:text-white transition-colors duration-300">
                  일시정지
                </button>
              )}

              {phase !== "idle" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    disabled={resetsLeft <= 0}
                    className="text-xs tracking-[0.18em] uppercase text-[#555555] hover:text-[#AAAAAA]
                      disabled:text-[#2A2A2A] disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    초기화
                  </button>
                  <span className={`text-[10px] tracking-wide tabular-nums transition-colors duration-300
                    ${resetsLeft === 0 ? "text-[#2A2A2A] line-through"
                      : resetsLeft === 1 ? "text-[#555555]" : "text-[#444444]"}`}>
                    남은 리셋 {resetsLeft}/{MAX_RESETS}
                  </span>
                </div>
              )}
            </div>

            {sessions > 0 && (
              <p className="text-sm text-[#555555] tracking-wide">
                오늘{" "}
                <span className="font-medium" style={{ color: GOLD }}>{sessions}</span>
                세션 완료
              </p>
            )}
          </div>
        </main>

        <footer className="pb-10 text-center">
          <p className="text-[9px] text-[#333333] tracking-[0.3em] uppercase select-none">
            흔들리지 않게
          </p>
        </footer>
      </div>
    </>
  );
}
