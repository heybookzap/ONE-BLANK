import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { drainText, worstHabit } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: `당신은 ONE BLANK의 디렉터입니다. 사용자가 털어놓은 감정(drainText)과 그들이 평소 지우고 싶어하는 습관(worstHabit)을 분석하여 다음 원칙에 따라 답변하세요:
        1. 사용자가 털어놓은 구체적인 감정 키워드를 직접 문장에 인용하여 깊이 공감하세요.
        2. 그 감정의 원인이 사용자의 '최악의 습관'과 어떻게 연결되어 있는지 날카롭게 짚어주세요.
        3. 오늘 설정할 '단 하나의 목표'가 이 습관의 사슬을 끊고 당신을 자유롭게 할 유일한 탈출구임을 강조하며 용기를 주십시오.
        4. 문장은 따뜻하지만 어조는 단호하고 묵직하게 2~3문장으로 작성하세요.`,
        messages: [{ role: "user", content: `고객의 습관: ${worstHabit}\n고객의 현재 감정: ${drainText}\n\n이 데이터에 기반해 이 고객만을 위한 진심 어린 위로를 작성해.` }]
      })
    });

    const data = await response.json();
    const message = data.content[0].text;

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: "그 무거운 마음, 이제 이곳에 다 쏟아내셨나요? 오늘 당신이 선택할 단 하나의 본질이 그 모든 소음을 잠재울 것입니다. 당신을 믿고 시작하십시오." });
  }
}