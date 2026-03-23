"use client";

import { useState, useRef, useEffect } from "react";

type DrainState = "idle" | "loading" | "countdown" | "done";

export default function EmotionDrainSection() {
  const [text, setText] = useState("");
  const [drainState, setDrainState] = useState<DrainState>("idle");
  const [empathyText, setEmpathyText] = useState("");
  const [suggestionText, setSuggestionText] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [textOpacity, setTextOpacity] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  async function handleDrain() {
    if (!text.trim() || drainState !== "idle") return;
    setDrainState("loading");

    try {
      const drainText = text;

      const [empathyRes, suggestionRes] = await Promise.all([
        fetch("/api/emotion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: drainText, type: "empathy" }),
        }),
        fetch("/api/emotion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: drainText, type: "suggestion" }),
        }),
      ]);

      const empathy = await empathyRes.json();
      const suggestion = await suggestionRes.json();

      setEmpathyText(empathy.text);
      setSuggestionText(suggestion.text);
      setDrainState("countdown");
      setTextOpacity(0); // 5초 CSS 페이드아웃 트리거
      setCountdown(5);

      let count = 5;
      intervalRef.current = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count <= 0) {
          clearInterval(intervalRef.current!);
          setText("");
          setTextOpacity(1);
          setDrainState("done");
        }
      }, 1000);
    } catch {
      setDrainState("idle");
    }
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setText("");
    setEmpathyText("");
    setSuggestionText("");
    setCountdown(5);
    setTextOpacity(1);
    setDrainState("idle");
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  const isIdle = drainState === "idle";
  const canSubmit = isIdle && text.trim().length > 0;

  return (
    <section className="py-32 px-6 max-w-2xl mx-auto w-full">
      {/* 섹션 헤더 */}
      <p className="text-[10px] text-[#555555] tracking-[0.3em] uppercase mb-6">
        감정 배출
      </p>
      <h2 className="text-2xl font-light text-white tracking-tight mb-3">
        쏟아내세요.
      </h2>
      <p className="text-sm leading-relaxed mb-14">
        <span className="text-[#555555]">판단 없는 공간. 5초 후 사라집니다. </span>
        <span className="text-[#2E2E2E]">어디에도 저장되지 않아요.</span>
      </p>

      {/* 텍스트 에어리어 */}
      <div className="relative mb-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            if (isIdle) setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleDrain();
          }}
          placeholder="지금 느끼는 것들을 여기에 모두 쏟아내세요..."
          rows={6}
          disabled={!isIdle}
          style={{
            opacity: textOpacity,
            transition:
              drainState === "countdown"
                ? "opacity 5s ease-out"
                : "opacity 0.15s ease",
          }}
          className="
            w-full bg-[#161616] border-t border-b border-[#252525]
            text-[#DDDDDD] text-base font-light leading-[1.9]
            px-0 py-5 resize-none
            placeholder:text-[#2E2E2E] placeholder:font-light placeholder:tracking-wide
            focus:outline-none
            disabled:cursor-default
            caret-[#AAAAAA]
          "
        />
        {/* 글자 수 */}
        {isIdle && text.length > 0 && (
          <span className="absolute bottom-5 right-0 text-[10px] text-[#2E2E2E] tabular-nums select-none">
            {text.length}
          </span>
        )}
      </div>

      {/* ⌘+Enter 힌트 */}
      {isIdle && (
        <p className="text-[10px] text-[#2A2A2A] mb-10 tracking-wide">
          ⌘ + Enter 또는 아래 버튼으로 배출
        </p>
      )}

      {/* ── Idle: 쏟아내기 버튼 ── */}
      {isIdle && (
        <button
          onClick={handleDrain}
          disabled={!canSubmit}
          className="
            group flex items-center gap-3
            text-xs font-medium tracking-[0.18em] uppercase
            disabled:text-[#282828] disabled:cursor-not-allowed
            enabled:text-[#555555] enabled:hover:text-white
            transition-colors duration-300
          "
        >
          <span>쏟아내기</span>
          <span
            className="text-base leading-none transition-transform duration-300 group-enabled:group-hover:translate-y-0.5"
          >
            ↓
          </span>
        </button>
      )}

      {/* ── Loading: 점 애니메이션 ── */}
      {drainState === "loading" && (
        <div className="flex items-center gap-2 h-8 mt-2">
          {[0, 200, 400].map((delay) => (
            <span
              key={delay}
              className="block w-1 h-1 rounded-full bg-[#444444] animate-pulse"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}

      {/* ── Countdown: 공감 멘트 + 진행 바 ── */}
      {drainState === "countdown" && (
        <div className="space-y-10 ob-fade-in">
          {/* 공감 멘트 */}
          {empathyText && (
            <blockquote className="border-l border-[#2A2A2A] pl-5">
              <p className="text-sm text-[#888888] italic font-light leading-relaxed tracking-wide">
                {empathyText}
              </p>
            </blockquote>
          )}

          {/* 카운트다운 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#383838] tracking-[0.3em] uppercase">
                삭제까지
              </span>
              <span className="text-xs text-[#383838] tabular-nums font-light">
                {countdown}
              </span>
            </div>
            {/* 진행 바: 왼쪽→오른쪽으로 줄어듦 */}
            <div className="h-px bg-[#1A1A1A] w-full relative overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-[#383838]"
                style={{
                  width: `${(countdown / 5) * 100}%`,
                  transition: "width 1s linear",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Done: AI 실행 유도 메시지 ── */}
      {drainState === "done" && (
        <div className="ob-fade-in">
          {/* 구분선 */}
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-[#1E1E1E]" />
            <span className="text-[9px] text-[#2E2E2E] tracking-[0.35em] uppercase select-none">
              비워짐
            </span>
            <div className="h-px flex-1 bg-[#1E1E1E]" />
          </div>

          {/* 실행 유도 메시지 */}
          {suggestionText && (
            <div className="mb-12 space-y-2">
              <p className="text-[9px] text-[#444444] tracking-[0.3em] uppercase mb-5">
                지금 이 순간
              </p>
              <p className="text-xl font-light text-white leading-relaxed tracking-tight">
                {suggestionText}
              </p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="
              text-[10px] text-[#383838] hover:text-[#777777]
              transition-colors duration-300 tracking-[0.25em] uppercase
            "
          >
            다시 쓰기
          </button>
        </div>
      )}
    </section>
  );
}
