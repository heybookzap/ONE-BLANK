"use client";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [phase, setPhase] = useState("drain"); // drain, onething, timer, break, roi, closing, black
  const [drainText, setDrainText] = useState("");
  const [oneThing, setOneThing] = useState("");
  const [oneThingError, setOneThingError] = useState("");
  const [timeLeft, setTimeLeft] = useState(1500); // 25분 (1500)
  const [breakTime, setBreakTime] = useState(300); // 5분 (300)
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [roi, setRoi] = useState(0);

  // ROI 계산 (세션 당 4166원)
  useEffect(() => {
    setRoi(sessions * 4166);
  }, [sessions]);

  // 타이머 로직 (자동 쉬는 시간 전환)
  useEffect(() => {
    let interval: any;
    if (isActive) {
      if (phase === "timer") {
        if (timeLeft > 0) interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        else {
          setSessions((s) => s + 1);
          if (sessions + 1 >= 3) {
            setIsActive(false);
            setPhase("roi"); // 3세션 완료 시 강제 마감(ROI)
          } else {
            setPhase("break");
            setBreakTime(300);
          }
        }
      } else if (phase === "break") {
        if (breakTime > 0) interval = setInterval(() => setBreakTime((t) => t - 1), 1000);
        else {
          setPhase("timer");
          setTimeLeft(1500);
        }
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, breakTime, phase, sessions]);

  // The One Thing 엄격 검증
  const handleOneThingSubmit = () => {
    if (oneThing.trim().length < 5) {
      setOneThingError("오늘 해야할 중요한 일 한 가지를 제대로 입력해주세요.");
    } else {
      setOneThingError("");
      setPhase("timer");
      setIsActive(false);
    }
  };

  // 감정배출 필터링
  const handleDrainSubmit = () => {
    const trashPattern = /^[ㄱ-ㅎㅏ-ㅣa-zA-Z\s]+$/;
    if (drainText.length < 5 || (trashPattern.test(drainText) && drainText.length < 15)) {
      alert("진심을 담아 한 문장만 적어주세요.\n그래야 비워낼 수 있습니다.");
    } else { setPhase("onething"); }
  };

  if (phase === "black") return <div className="min-h-screen bg-black transition-all duration-1000" />;

  const isBreak = phase === "break";
  const currentSeconds = isBreak ? breakTime : timeLeft;
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8 font-sans antialiased overflow-y-auto">
      {phase === "drain" && (
        <div className="w-full max-w-2xl text-center animate-in fade-in">
          <p className="mb-10 text-gray-500 tracking-[0.3em] text-xs uppercase">Step 01. Emotional Drain</p>
          <textarea
            className="w-full bg-transparent border-l border-gray-800 p-8 h-64 focus:outline-none focus:border-[#B8860B] text-xl font-light leading-relaxed placeholder-gray-700 transition-all duration-500"
            placeholder="지금 당신을 어지럽게 만드는 잡념들을 이곳에 쏟아내세요."
            value={drainText}
            onChange={(e) => setDrainText(e.target.value)}
          />
          <button onClick={handleDrainSubmit} className="mt-12 px-14 py-3 border border-[#B8860B] text-[#B8860B] text-xs tracking-[0.5em] uppercase hover:bg-[#B8860B] hover:text-black transition-all">
            Purify
          </button>
        </div>
      )}

      {phase === "onething" && (
        <div className="text-center animate-in fade-in zoom-in duration-700 max-w-2xl">
          <p className="mb-12 text-gray-500 tracking-[0.3em] text-xs uppercase">Step 02. The One Thing</p>
          <h2 className="text-3xl mb-12 font-extralight text-gray-200 tracking-[0.1em] italic leading-relaxed">
            " 오늘 해야할 중요한 일 한가지 "
          </h2>
          <input
            className="bg-transparent border-b border-gray-800 py-4 text-center w-full max-w-lg focus:outline-none focus:border-[#B8860B] text-2xl font-extralight tracking-wider"
            value={oneThing}
            onChange={(e) => setOneThing(e.target.value)}
            autoFocus
          />
          {oneThingError && <p className="mt-6 text-[#007AFF] text-sm tracking-widest font-light">{oneThingError}</p>}
          <button onClick={handleOneThingSubmit} className="block mx-auto mt-16 px-14 py-3 border border-[#B8860B] text-[#B8860B] text-xs tracking-[0.5em] uppercase transition-all">
            Commit
          </button>
        </div>
      )}

      {(phase === "timer" || phase === "break") && (
        <div className="text-center w-full max-w-5xl animate-in fade-in">
          <p className="mb-4 text-gray-700 tracking-[0.4em] text-xs uppercase">SECTION {sessions + 1} / 3</p>
          <p className="mb-16 text-gray-500 tracking-[0.3em] text-xs uppercase italic leading-tight">ONE THING : {oneThing}</p>
          
          <div className="flex items-end justify-center gap-10 mb-20 relative">
            <div className="flex flex-col items-center">
              <span className="text-[18rem] font-extralight leading-none tabular-nums text-white tracking-tight">
                {minutes.toString().padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-600 tracking-[0.6em] mt-6">MIN</span>
            </div>
            <span className="text-[18rem] font-extralight leading-none text-gray-800 pb-20 -translate-y-4">:</span>
            <div className="flex flex-col items-center">
              <span className="text-[18rem] font-extralight leading-none tabular-nums text-white tracking-tight">
                {seconds.toString().padStart(2, "0")}
              </span>
              <span className="text-sm text-gray-600 tracking-[0.6em] mt-6">SEC</span>
            </div>

            {!isActive && phase === "timer" && timeLeft === 1500 && (
              <div onClick={() => setIsActive(true)} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm z-10 cursor-pointer animate-in fade-in">
                <p className="text-[#B8860B] text-xl tracking-[0.5em] uppercase border border-[#B8860B] px-12 py-4 hover:bg-[#B8860B] hover:text-black transition-all">Touch to Start</p>
              </div>
            )}
          </div>
          
          {phase === "break" ? (
            <p className="mt-14 text-[#007AFF] tracking-[0.5em] text-[12px] uppercase animate-pulse">SHORT BREAK (Auto Running)</p>
          ) : (
            <p className="mt-14 text-gray-600 tracking-[0.5em] text-[11px] uppercase">{isActive ? "In Deep Focus" : "Touch to Resume"}</p>
          )}

          {/* 0세션이어도 넘어가게 버튼 상시 배치, 1세션 이상이면 건너뛰기 노출 */}
          <div className="mt-28 flex flex-col items-center gap-6 animate-in fade-in">
            <div className="flex gap-4">
              <button 
                onClick={() => setPhase("roi")}
                className="px-8 py-3 border border-gray-800 text-gray-500 text-xs tracking-widest hover:border-white hover:text-white transition-all uppercase"
              >
                {sessions > 0 ? "ROI Check" : "조기 마감하기"}
              </button>
              {sessions > 0 && sessions < 3 && (
                <button 
                  onClick={() => setPhase("roi")}
                  className="px-8 py-3 border border-gray-800 text-gray-500 text-xs tracking-widest hover:border-[#007AFF] hover:text-[#007AFF] transition-all uppercase"
                >
                  세션 건너뛰고 마감하기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROI 페이지 복원 (스크린샷 2659) */}
      {phase === "roi" && (
        <div className="text-center w-full max-w-4xl animate-in fade-in duration-1000 flex flex-col items-center">
          {sessions > 0 ? (
            <>
              <p className="text-gray-600 text-xs tracking-[0.5em] mb-6">오늘의 성과</p>
              <p className="text-[#B8860B] text-7xl font-extralight mb-6 tracking-tight">₩{roi.toLocaleString()}</p>
              <p className="text-gray-400 text-sm tracking-[0.2em] mb-24">당신은 오늘 이미 본전 그 이상을 해냈습니다.</p>

              <div className="grid grid-cols-2 gap-y-20 gap-x-32 max-w-2xl mx-auto mb-32">
                <div>
                  <p className="text-5xl font-extralight text-white mb-4">{sessions * 25}<span className="text-lg text-gray-600 ml-2 font-light">분</span></p>
                  <p className="text-xs text-gray-600 tracking-widest">오늘 집중</p>
                </div>
                <div>
                  <p className="text-5xl font-extralight text-white mb-4">{sessions * 25}<span className="text-lg text-gray-600 ml-2 font-light">분</span></p>
                  <p className="text-xs text-gray-600 tracking-widest">누적 집중</p>
                </div>
                <div>
                  <p className="text-5xl font-extralight text-[#B8860B] mb-4"><span className="text-2xl mr-2 font-light">₩</span>{roi.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 tracking-widest">오늘 수익</p>
                </div>
                <div>
                  <p className="text-5xl font-extralight text-[#B8860B] mb-4"><span className="text-2xl mr-2 font-light">₩</span>{roi.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 tracking-widest">누적 수익</p>
                </div>
              </div>
            </>
          ) : (
            // 0세션일 경우 아무 성과도 안 뜨게 함
            <div className="mb-32 mt-20">
              <p className="text-gray-600 text-sm tracking-widest leading-relaxed italic">
                완료된 세션이 없습니다.<br />아직 증명된 가치가 없습니다.
              </p>
            </div>
          )}
          
          {/* 하단 마감 확인 버튼 */}
          <button 
            onClick={() => setPhase("closing")}
            className="px-14 py-4 border border-gray-800 text-gray-400 text-xs tracking-[0.5em] hover:text-white hover:border-gray-500 transition-all uppercase"
          >
            오늘의 마감 확인하기
          </button>
        </div>
      )}

      {/* 클로징 페이지 복원 (스크린샷 2656) */}
      {phase === "closing" && (
        <div className="text-center w-full max-w-3xl animate-in fade-in duration-1000 flex flex-col items-center">
          <p className="text-gray-400 text-base font-light leading-[2.5] tracking-[0.2em] mb-12">
            수많은 소음과 핑계를 뒤로하고<br />
            오늘 하루의 주도권을 쥐어낸 당신을 존경합니다.
          </p>

          <p className="text-gray-500 text-sm tracking-widest mb-16">
            오늘 당신이 지켜낸 시간은 <strong className="text-white font-normal mx-1">{sessions * 25}분</strong>의 가치로 증명되었습니다.
          </p>

          <p className="text-gray-400 text-base font-light leading-[2.2] tracking-widest mb-16">
            오늘 밤은 무거운 짐 모두 여기 내려두고<br />
            편안히 눈을 감으세요.
          </p>

          <p className="text-gray-400 text-base font-light leading-[2.2] tracking-widest mb-20">
            내일 아침, 세상이 다시 소란스러워져도<br />
            당신을 위한 포커스 룸은 언제나 기다리고 있을 거예요.
          </p>

          <p className="text-gray-300 text-base tracking-widest mb-12">
            내일도 이 몰입을 이어가시겠어요?
          </p>

          <button 
            onClick={() => setPhase("black")}
            className="px-12 py-5 border border-gray-800 text-gray-400 text-sm tracking-widest hover:bg-white hover:text-black transition-all"
          >
            🛡️ 네, 내일도 타협 없이 몰입하겠습니다
          </button>
        </div>
      )}
    </div>
  );
}