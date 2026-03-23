"use client";

import { useState, useEffect, useRef } from "react";

const GATE_PASSWORD = "BLANK131210126";
const STORAGE_KEY   = "oneBlank_auth";

export default function GateGuard({ children }: { children: React.ReactNode }) {
  const [status,  setStatus]  = useState<"checking" | "locked" | "unlocked">("checking");
  const [input,   setInput]   = useState("");
  const [error,   setError]   = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setStatus("unlocked");
    } else {
      setStatus("locked");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim().toUpperCase() === GATE_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "true");
      setStatus("unlocked");
    } else {
      setError(true);
      setShaking(true);
      setInput("");
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => { setError(false); inputRef.current?.focus(); }, 2800);
    }
  }

  if (status === "checking") return null;
  if (status === "unlocked") return <>{children}</>;

  return (
    <main className="h-screen bg-[#111111] flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* 워드마크 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <span className="text-[9px] font-semibold tracking-[0.45em] text-[#444444] uppercase select-none">
          ONE BLANK
        </span>
      </div>

      {/* 콘텐츠 */}
      <div className="w-full max-w-sm flex flex-col items-center gap-16 ob-fade-in text-center">

        {/* 웰컴 카피 */}
        <div className="space-y-6">
          <p className="text-[10px] text-[#555555] tracking-[0.45em] uppercase select-none">
            Private Members Only
          </p>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-[1.6]">
            치열하게 고민하는<br />당신을 위한 공간입니다.
          </h1>
          <p className="text-sm text-[#666666] leading-[2.0] tracking-wide max-w-xs mx-auto">
            피곤한 인증도, 가식적인 응원도 없어요.<br />
            오직 오늘의 집중 하나만.
          </p>
        </div>

        {/* 게이트 폼 */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-8">
          <div
            className="w-full max-w-xs"
            style={{ animation: shaking ? "shake 0.4s ease-in-out" : undefined }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => { setInput(e.target.value); setError(false); }}
              placeholder="입장 코드"
              autoComplete="off"
              className="
                w-full bg-transparent text-center
                border-0 border-b border-[#2A2A2A]
                text-white text-xl font-light tracking-[0.5em]
                py-4
                placeholder:text-[#3A3A3A] placeholder:tracking-[0.2em] placeholder:text-base
                focus:outline-none focus:border-[#B8860B]
                transition-colors duration-300
                caret-white
              "
            />
          </div>

          {/* 오류 */}
          <p
            className={`text-[11px] tracking-[0.35em] uppercase transition-opacity duration-400
              ${error ? "opacity-100" : "opacity-0"}`}
            style={{ color: "#B8860B" }}
          >
            허가되지 않은 코드입니다
          </p>

          <button
            type="submit"
            disabled={!input.trim()}
            className="
              text-sm font-light tracking-[0.28em] uppercase
              border px-9 py-3.5
              disabled:border-[#252525] disabled:text-[#383838] disabled:cursor-not-allowed
              transition-all duration-300
            "
            style={input.trim() ? { borderColor: "#B8860B55", color: "#B8860B" } : {}}
            onMouseEnter={e => {
              if (input.trim())
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#B8860B";
            }}
            onMouseLeave={e => {
              if (input.trim())
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#B8860B55";
            }}
          >
            입장하기 →
          </button>
        </form>
      </div>

      {/* 하단 */}
      <div className="absolute bottom-8">
        <p className="text-[9px] text-[#2A2A2A] tracking-[0.42em] uppercase select-none">
          고요한 연대의 공간
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-7px); }
          40%       { transform: translateX(7px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
      `}</style>
    </main>
  );
}
