"use client";
import { useState, useEffect } from "react";

export default function GateGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const passed = localStorage.getItem("ob_gate_passed");
    if (passed === "true") {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "BLANK-131210126") {
      localStorage.setItem("ob_gate_passed", "true");
      setIsAuthenticated(true);
    } else {
      setPasscode("");
    }
  };

  if (isChecking) return <div className="min-h-screen bg-black" />;

  if (isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
        <p className="text-[10px] text-[#DAA520] tracking-[0.6em] uppercase mb-12 opacity-70">System Locked</p>
        <form onSubmit={handleUnlock} className="w-full relative">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-transparent border-b border-[#333] text-[#E0E0E0] text-2xl font-extralight py-6 text-center focus:outline-none focus:border-[#DAA520] transition-all tracking-[0.5em]"
            placeholder="ENTRY CODE"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}