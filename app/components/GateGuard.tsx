"use client";
import { useState, useEffect } from "react";

export default function GateGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem("oneBlank_auth");
    const savedName = localStorage.getItem("ob_user_name");
    if (authStatus === "true" && savedName) setIsAuthenticated(true);
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "BLANK-131210126" && userName.trim() !== "") {
      localStorage.setItem("oneBlank_auth", "true");
      localStorage.setItem("ob_user_name", userName.trim());
      setIsAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
      setPassword("");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;
  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans relative">
      <div className="w-full max-w-md flex flex-col items-center text-center animate-fade-in relative z-10">
        <p className="text-[9px] tracking-[0.6em] text-[#DAA520] uppercase mb-16 font-light">One Blank</p>
        <p className="text-[10px] text-[#A0A0A0] tracking-[0.5em] uppercase mb-12 font-light">Private Members Only</p>
        <h1 className="text-2xl md:text-3xl font-light tracking-tight leading-relaxed text-white mb-12">치열하게 고민하는<br />당신을 위한 공간입니다.</h1>
        <div className="space-y-3 mb-16">
          <p className="text-xs text-[#E0E0E0] font-extralight tracking-wide">수백 개의 할 일 앞에서 멈춰버린 당신의 뇌를 리셋합니다.</p>
          <p className="text-xs text-[#E0E0E0] font-extralight tracking-wide opacity-80">오직 오늘의 집중 하나만.</p>
        </div>
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center relative z-20">
          <div className="w-full max-w-[280px] relative text-left mb-6">
            <p className="text-[10px] text-[#A0A0A0] tracking-widest mb-4 ml-1">입장 코드</p>
            <input
              type="text" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-transparent border-b ${error ? 'border-red-900' : 'border-[#444]'} text-white text-center py-2 text-sm tracking-[0.3em] focus:outline-none focus:border-[#DAA520] transition-all`}
              autoFocus
            />
          </div>
          <div className="w-full max-w-[280px] relative text-left mb-6">
            <p className="text-[10px] text-[#A0A0A0] tracking-widest mb-4 ml-1">이름</p>
            <input
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className={`w-full bg-transparent border-b ${error ? 'border-red-900' : 'border-[#444]'} text-white text-center py-2 text-sm tracking-[0.3em] focus:outline-none focus:border-[#DAA520] transition-all`}
            />
          </div>
          <button type="submit" className="mt-10 px-16 py-5 border border-[#333] text-[11px] tracking-[0.4em] text-[#E0E0E0] hover:text-[#DAA520] hover:border-[#DAA520] transition-all uppercase">입장하기</button>
        </form>
      </div>
    </div>
  );
}