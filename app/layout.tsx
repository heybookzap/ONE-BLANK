import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ONE BLANK",
  description: "하루 하나. 흔들리지 않는 실행.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#111111] text-white antialiased">
        {/* 아래 한 줄이 핵심입니다! */}
        {children}
      </body>
    </html>
  );
}