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
        system: `당신은 생산성 디렉터입니다. 사용자가 지우고 싶어하는 습관(worstHabit)과 현재의 감정 상태(drainText)를 분석하세요.
        이 습관을 지우기 위해 '25분 동안 즉시 몰입할 수 있는 구체적인 행동' 3가지를 추천하세요. 
        각 추천은 반드시 그 습관을 원천 차단하거나 반대되는 생산적 업무여야 합니다. 
        매일 새로운 관점을 제공할 수 있도록 유동적으로 생각하세요. JSON 배열로만 응답하세요.`,
        messages: [{ role: "user", content: `지워야 할 습관: ${worstHabit}\n현재 상태: ${drainText}\n\n이 습관을 깨부술 25분 몰입 업무 3가지를 JSON 배열로 반환해.` }]
      })
    });

    const data = await response.json();
    const suggestions = JSON.parse(data.content[0].text);

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: ["오늘의 핵심 과업 1순위 문서화하기", "미뤄둔 기획안 뼈대 25분간 잡기", "방해 요소 차단하고 핵심 로직 설계하기"] });
  }
}