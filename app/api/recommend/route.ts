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
        max_tokens: 500,
        system: `당신은 ${userName}님의 생산성 전략가입니다. "${concernType}" 문제를 해결하기 위해 꽉 찬 투두 리스트에서 즉시 실행 가능한 가장 가치 있는 25분 업무 3가지를 도출하세요. 
        "${worstHabit}"을 완전히 차단하는 행동이어야 합니다. 2026년의 최신 생산성 방법론을 반영하여 JSON 배열 형식으로만 응답하세요.`,
        messages: [{ role: "user", content: "최적의 25분 몰입 업무 3가지를 제안해." }]
      })
    });

    const data = await response.json();
    const suggestions = JSON.parse(data.content[0].text);
    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: ["핵심 업무 1순위 구조화", "미뤄둔 기획안 초안 작성", "방해 요소 차단 및 로직 설계"] });
  }
}