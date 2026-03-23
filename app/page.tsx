"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomeGate() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleEntry = () => {
    if (code === "BLANK-131210126") router.push("/dashboard");
    else { alert("허가되지 않은 접근입니다."); setCode(""); }
  };

  return (
    // 폰트를 눈이 편안한 sans-serif 기반으로 변경하고, Pretendard의 정갈함을 추구
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white p-4 font-sans antialiased">
      <div className="animate-fade-in text-center">
        <h1 className="text-2xl mb-16 font-extralight tracking-[0.6em] text-gray-500 leading-relaxed uppercase">
          One Blank : Proof of Focus
        </h1>
        {/* 눈 아프지 않게 정갈한 sans-serif로 교체. Pretendard 감성 구현 */}
        <p className="text-xl mb-14 font-light text-gray-200 tracking-[0.2em] italic">
          "치열하게 고민하는 당신을 위한 공간입니다."
        </p>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ACCESS CODE"
          className="bg-transparent border-b border-gray-800 py-4 px-2 mb-12 focus:outline-none focus:border-[#B8860B] text-center w-80 tracking-[1em] transition-all duration-500 text-lg"
        />
        <button
          onClick={handleEntry}
          className="block mx-auto px-20 py-4 border border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B] hover:text-black transition-all duration-700 text-xs tracking-[0.4em] uppercase"
        >
          Enter the Blank
        </button>
      </div>
    </div>
  );
}