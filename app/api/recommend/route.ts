import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { worstHabit, drainText } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 150,
        system: "당신은 냉철한 생산성 디렉터입니다. 사용자의 최악의 습관과 현재 감정 상태를 분석하여, 지금 당장 실행할 수 있는 '단 하나의 행동(One-Thing)' 3가지를 추천하세요. 각 행동은 15자 이내로 명확하게 작성하세요. JSON 형식의 문자열 배열로만 응답하세요. 예: [\"스마트폰 끄기\", \"책상 5분 정리\", \"물 한잔 마시기\"]",
        messages: [
          {
            role: "user",
            content: `최악의 습관: ${worstHabit}\n현재 감정/상태: ${drainText}\n\n위 내용을 바탕으로 당장 실행할 3가지 행동을 JSON 배열로만 반환해.`
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    const suggestions = JSON.parse(content);

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: ["스마트폰 전원 끄기", "심호흡 3번 하기", "당장 자리에서 일어나기"] });
  }
}