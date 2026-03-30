import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const FALLBACK = ['가장 무거운 일 딱 하나만 끝내기', '복잡한 생각 버리고 첫 줄 완성하기', '제일 미루고 싶던 일 25분만 마주하기'];

export async function POST(req: Request) {
  try {
    const { worstHabit, drainText } = await req.json();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: `너는 사용자의 실행력을 극대화하는 차갑고 단호한 AI 디렉터다.
반드시 아래 규칙을 엄격하게 지켜라.

1. 모든 단어는 초등학교 6학년도 즉시 이해할 수 있는 가장 쉽고 직관적인 일상어만 사용해라.
2. 말투는 이모지가 전혀 없는 매우 무겁고 진지한 톤을 유지해라.
3. 사용자의 감정(drainText)과 최악의 습관(worstHabit)을 분석하여, 지금 당장 시작해야 할 단 하나의 목표 3가지를 제안해라.
4. 결과는 반드시 3개의 문자열을 담은 JSON 배열로만 출력해라.

출력 예시: ["가장 두려운 그 일 25분만 하기", "아무 생각 말고 첫 번째 칸 채우기", "핸드폰 끄고 딱 한 줄만 쓰기"]`,
      messages: [{
        role: 'user',
        content: `최악의 습관: ${worstHabit}\n현재 감정 상태: ${drainText}`
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const match = text.match(/\[[\s\S]*\]/);

    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) {
        return NextResponse.json({ suggestions: parsed.slice(0, 3) });
      }
    }

    return NextResponse.json({ suggestions: FALLBACK });
  } catch {
    return NextResponse.json({ suggestions: FALLBACK }, { status: 500 });
  }
}
