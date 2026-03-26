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
        system: "당신은 생산성 디렉터입니다. 사용자의 최악의 습관과 현재 감정을 분석하여 극복을 위한 행동을 3개 제안하세요. 단, 반드시 '타이머를 켜고 25분 동안 집중해서 끝낼 수 있는 구체적인 분량과 난이도의 생산적 작업(예: 기획안 뼈대 5줄 작성하기, 1주일치 콘텐츠 주제 리스트업 등)'이어야 합니다. 단순한 스트레칭이나 전원 끄기 같은 즉각적 행동은 제외하세요. 각 행동은 20자 이내로 명확하게 작성하며, JSON 형식의 문자열 배열로만 응답하세요. 예: [\"랜딩페이지 카피 초안 작성하기\", \"고객 인터뷰 질문지 기획하기\", \"경쟁사 분석 리서치 진행하기\"]",
        messages: [
          {
            role: "user",
            content: `최악의 습관: ${worstHabit}\n현재 감정/상태: ${drainText}\n\n위 내용을 바탕으로 25분간 집중할 3가지 행동을 JSON 배열로만 반환해.`
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    const suggestions = JSON.parse(content);

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ suggestions: ["오늘 처리할 핵심 업무 1가지 구조 짜기", "가장 미뤄둔 문서 작업 25분간 진행하기", "목표 달성을 위한 아이디어 10개 적기"] });
  }
}