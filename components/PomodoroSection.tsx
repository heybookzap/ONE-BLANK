"use client";

import { useState, useEffect, useRef } from "react";

type Phase = "idle" | "focus" | "break" | "paused_focus" | "paused_break";

interface Props {
  onSessionComplete: () => void;
}

const FOCUS = 25 * 60;
const BREAK = 5 * 60;
const CIRC = 2 * Math.PI * 85; // r = 85

export default function PomodoroSection({ onSessionComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(FOCUS);
  const [sessions, setSessions] = useState(0);
  const [totalMin, setTotalMin] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  // 페이즈 전환 시 링 transition을 순간 끊기 위한 플래그
  const [skipTransition, setSkipTransition] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  // 오늘 세션 데이터 로드
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem("oneBlank_pomodoro");
    if (raw) {
      const d = JSON.parse(raw);
      if (d.date === today) {
        setSessions(d.sessions);
        setTotalMin(d.totalMinutes);
      }
    }
  }, []);

  // phase 변경 → 인터벌 관리
  useEffect(() => {
    if (phase !== "focus" && phase !== "break") return;
    const id = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(id); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // timeLeft === 0 → 세션/휴식 완료 처리
  useEffect(() => {
    if (timeLeft !== 0) return;
    const current = phaseRef.current;

    if (current === "focus") {
      // ① 화면 펄스
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 900);

      // ② 효과음
      playBeep(528, 1.2);

      // ③ localStorage 업데이트
      const today = new Date().toISOString().slice(0, 10);
      const raw = localStorage.getItem("oneBlank_pomodoro");
      const prev = raw ? JSON.parse(raw) : { date: "", sessions: 0, totalMinutes: 0 };
      const updated = {
        date: today,
        sessions: (prev.date === today ? prev.sessions : 0) + 1,
        totalMinutes: (prev.date === today ? prev.totalMinutes : 0) + 25,
      };
      localStorage.setItem("oneBlank_pomodoro", JSON.stringify(updated));

      const allRaw = localStorage.getItem("oneBlank_pomodoroAll");
      const all = allRaw ? JSON.parse(allRaw) : { totalSessions: 0, totalMinutes: 0 };
      localStorage.setItem("oneBlank_pomodoroAll", JSON.stringify({
        totalSessions: all.totalSessions + 1,
        totalMinutes: all.totalMinutes + 25,
      }));

      setSessions(updated.sessions);
      setTotalMin(updated.totalMinutes);
      onSessionComplete();

      // ④ 링 리셋 (transition 없이 순간 전환) → 휴식 시작
      setSkipTransition(true);
      setPhase("break");
      setTimeLeft(BREAK);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipTransition(false));
      });

    } else if (current === "break") {
      playBeep(440, 0.6);
      setSkipTransition(true);
      setPhase("idle");
      setTimeLeft(FOCUS);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSkipTransition(false));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  function playBeep(freq: number, dur: number) {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch {}
  }

  function start() {
    setSkipTransition(true);
    setPhase("focus");
    setTimeLeft(FOCUS);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSkipTransition(false));
    });
  }

  function pause() {
    setPhase(phase === "focus" ? "paused_focus" : "paused_break");
  }

  function resume() {
    setPhase(phase === "paused_focus" ? "focus" : "break");
  }

  function reset() {
    setSkipTransition(true);
    setPhase("idle");
    setTimeLeft(FOCUS);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setSkipTransition(false));
    });
  }

  // ── 링 계산: 경과 시간만큼 채워짐 (0 → FULL) ──
  const totalTime = phase === "break" || phase === "paused_break" ? BREAK : FOCUS;
  const elapsed = totalTime - timeLeft;
  const fillProgress = elapsed / totalTime;           // 0 → 1
  const strokeOffset = CIRC * (1 - fillProgress);    // CIRC → 0

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const isRunning = phase === "focus" || phase === "break";
  const isPaused = phase === "paused_focus" || phase === "paused_break";
  const isBreak = phase === "break" || phase === "paused_break";
  const isFocus = phase === "focus" || phase === "paused_focus";
  const showRestartPrompt = phase === "idle" && sessions > 0;

  // 링 색: 집중=화이트, 휴식=dim 그레이
  const ringStroke = isBreak ? "#484848" : "#FFFFFF";

  // 단계 레이블
  const phaseLabel: Record<Phase, string> = {
    idle: sessions > 0 ? "다음 세션 대기" : "준비",
    focus: "집중 중",
    break: "휴식 중",
    paused_focus: "일시 정지",
    paused_break: "일시 정지",
  };

  return (
    <>
      {/* ── 화면 전체 펄스 오버레이 ── */}
      {isPulsing && (
        <div
          className="fixed inset-0 z-50 pointer-events-none bg-white ob-pulse"
          aria-hidden="true"
        />
      )}

      <section className="py-32 px-6 max-w-2xl mx-auto w-full">
        <p className="text-[10px] text-[#555555] tracking-[0.3em] uppercase mb-6">
          뽀모도로
        </p>
        <h2 className="text-2xl font-light text-white tracking-tight mb-20">
          25분. 불 꺼. 시작.
        </h2>

        <div className="flex flex-col items-center gap-12">
          {/* ── SVG 링 타이머 ── */}
          <div className="relative w-56 h-56">
            <svg
              className="w-full h-full -rotate-90"
              viewBox="0 0 200 200"
              aria-hidden="true"
            >
              {/* 배경 트랙 */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke="#191919"
                strokeWidth="1.5"
              />

              {/* 채워지는 진행 링 */}
              <circle
                cx="100" cy="100" r="85"
                fill="none"
                stroke={ringStroke}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={strokeOffset}
                style={{
                  transition: skipTransition
                    ? "none"
                    : "stroke-dashoffset 1s linear, stroke 0.5s ease",
                }}
              />

              {/* 집중 중: 링 끝부분 미세 글로우 포인트 */}
              {isFocus && fillProgress > 0.02 && (
                <circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="1 9999"
                  strokeDashoffset={strokeOffset - 0.5}
                  style={{
                    transition: skipTransition
                      ? "none"
                      : "stroke-dashoffset 1s linear",
                  }}
                />
              )}
            </svg>

            {/* 타이머 숫자 + 상태 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span
                className={`text-4xl font-light tracking-tight tabular-nums transition-colors duration-500
                  ${isBreak ? "text-[#666666]" : "text-white"}`}
              >
                {fmt(timeLeft)}
              </span>
              <span className="text-[9px] text-[#444444] tracking-[0.28em] uppercase">
                {phaseLabel[phase]}
              </span>
            </div>
          </div>

          {/* ── 재시작 유도 메시지 ── */}
          {showRestartPrompt && (
            <div className="ob-fade-in text-center max-w-xs space-y-1">
              <p className="text-xs text-[#404040] leading-[1.9] tracking-wide">
                몰입의 리듬이 깨지기 전입니다.
              </p>
              <p className="text-xs text-[#404040] leading-[1.9] tracking-wide">
                한 번 더 몰입하시겠습니까?
              </p>
              <p className="text-xs text-[#505050] leading-[1.9] tracking-wide">
                타이머는 준비되었습니다.
              </p>
            </div>
          )}

          {/* ── 컨트롤 버튼 ── */}
          <div className="flex items-center gap-10">
            {phase === "idle" && (
              <button
                onClick={start}
                className="text-sm font-medium tracking-[0.18em] uppercase text-white hover:text-[#AAAAAA] transition-colors duration-300"
              >
                {sessions > 0 ? "한 번 더" : "시작"}
              </button>
            )}
            {isPaused && (
              <button
                onClick={resume}
                className="text-sm font-medium tracking-[0.18em] uppercase text-white hover:text-[#AAAAAA] transition-colors duration-300"
              >
                계속하기
              </button>
            )}
            {isRunning && (
              <button
                onClick={pause}
                className="text-sm font-medium tracking-[0.18em] uppercase text-[#AAAAAA] hover:text-white transition-colors duration-300"
              >
                일시정지
              </button>
            )}
            {phase !== "idle" && (
              <button
                onClick={reset}
                className="text-xs tracking-[0.18em] uppercase text-[#2E2E2E] hover:text-[#666666] transition-colors duration-300"
              >
                초기화
              </button>
            )}
          </div>

          {/* ── 오늘 통계 ── */}
          {sessions > 0 && (
            <div className="flex items-center gap-5 text-xs text-[#444444] tracking-wide">
              <span>오늘 {sessions}세션 완료</span>
              <span className="text-[#252525]">·</span>
              <span>{totalMin}분 집중</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
