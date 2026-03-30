import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { worstHabit, drainText } = await req.json();

    const systemPrompt = `
너는 사용자의 실행력을 극대화하는 차갑고 단호한 AI 디렉터다.
반드시 아래의 3가지 규칙을 엄격하게 지켜서 답변해라.

1. 모든 단어는 초등학교 6학년도 즉시 이해할 수 있는 가장 쉽고 직관적인 일상어만 사용해라. 전문 용어나 어려운 한자어는 절대 금지한다.
2. 단어는 쉽지만, 말투는 장난기나 이모지가 전혀 없는 매우 무겁고 진지한 톤을 유지해라. 행동하지 않으면 큰일 날 것 같은 압박감을 주어라.
3. 사용자가 방금 쏟아낸 복잡한 감정(drainText)과 최악의 습관(worstHabit)을 분석하여, 지금 당장 시작해야 할 단 하나의 목표(One Thing) 3가지를 제안해라.
4. 결과는 오직 JSON 배열 형태로만 텍스트만 출력해라.

출력 예시:
["가장 두려운 그 일 25분만 하기", "아무 생각 말고 첫 번째 칸 채우기", "핸드폰 끄고 딱 한 줄만 쓰기"]
`;

    const userPrompt = `
최악의 습관: ${worstHabit}
현재 감정 상태: ${drainText}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    let suggestions = ["가장 무거운 일 딱 하나만 끝내기", "복잡한 생각 버리고 첫 줄 완성하기", "제일 미루고 싶던 일 25분만 마주하기"];

    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          suggestions = parsed.suggestions;
        } else if (Array.isArray(parsed)) {
          suggestions = parsed;
        } else {
          const keys = Object.keys(parsed);
          if (keys.length > 0 && Array.isArray(parsed[keys[0]])) {
            suggestions = parsed[keys[0]];
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 3) });
  } catch (error) {
    return NextResponse.json(
      { suggestions: ["가장 무거운 일 딱 하나만 끝내기", "복잡한 생각 버리고 첫 줄 완성하기", "제일 미루고 싶던 일 25분만 마주하기"] },
      { status: 500 }
    );
  }
}