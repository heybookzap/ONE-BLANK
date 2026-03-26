import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userName, worstHabit, drainText, concernType } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: `당신은 ONE BLANK의 수석 디렉터이자 ${userName}님의 전담 AI 비서입니다. 
        고객의 고민 유형인 "${concernType}"과 지우고 싶은 습관 "${worstHabit}"을 완벽히 이해하고 있습니다. 
        현재의 감정("${drainText}")을 해소하고 커리어적 확신을 주는 메시지를 작성하세요.
        문장은 지능적이고 우아해야 하며, 단순한 위로를 넘어 고객의 가치를 일깨우는 날카로운 통찰이 포함되어야 합니다.`,
        messages: [{ role: "user", content: `${userName}님에게 필요한 고도화된 개인화 위로를 작성해.` }]
      })
    });

    const data = await response.json();
    return NextResponse.json({ message: data.content[0].text });
  } catch (error) {
    return NextResponse.json({ message: "비움의 시간이 당신의 가치를 증명할 것입니다. 잠시 멈추고 본질에 집중하십시오." });
  }
}