import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("경고: ANTHROPIC_API_KEY가 설정되지 않았습니다.");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(request: Request) {
  try {
    const { text, type, worstHabit, focusArea } = await request.json();

    let systemPrompt = "";
    let userMessage = text || "목표를 추천해주세요.";

    if (type === "empathy") {
      systemPrompt = `당신은 상위 1% 2030 여성 창업가/프리랜서를 위한 하이엔드 몰입 라운지 'ONE BLANK'의 디렉터입니다. 30자 이내의 단호하고 차가운 공감의 한 문장을 작성하세요. 정중한 존댓말(~습니다)을 사용하세요.`;
    } else if (type === "suggestion") {
      systemPrompt = `당신은 'ONE BLANK'의 디렉터입니다. 과거는 지워졌으니 당장 집중하라고 강제하는 서늘하고 묵직한 한 문장(30자 이내)을 작성하세요. 단호한 명령조(~하십시오)를 사용하세요.`;
    } else if (type === "label") {
      systemPrompt = `당신은 'ONE BLANK'의 데이터 분석가입니다. 사용자가 쏟아낸 감정 텍스트를 분석하여, 현재 상태를 요약하는 서늘하고 통찰력 있는 한 줄 라벨을 작성하세요. 사용자의 감정을 무시하거나 짓밟지 않되, 객관적으로 직시하게 만드세요. 반드시 "오늘의 상태 : [형용사 혹은 서술어] [명사] 형태의 날" 포맷으로 25자 이내로 답하세요. (예: "오늘의 상태 : 피곤하지만 책임감 강한 날", "오늘의 상태 : 불안을 딛고 일어선 날")`;
    } else if (type === "recommend") {
      // 🎯 목표 추천 프롬프트 추가
      systemPrompt = `당신은 'ONE BLANK'의 냉철한 마인드 코치입니다. 사용자의 최악의 습관('${worstHabit}')을 끊어내고, 주력 분야('${focusArea}')에서 즉각적인 성과를 낼 수 있는 '오늘 당장 25분 안에 끝낼 수 있는 아주 구체적인 단 하나의 행동' 3가지를 추천해야 합니다. 
      절대 구구절절 설명하지 마시고, 오직 행동 지침만 각 항목당 25자 이내로 짧고 강렬하게 작성하세요. 
      결과는 반드시 3개의 문자열을 담은 JSON 배열 형식으로만 응답하세요. 예시: ["경쟁사 랜딩페이지 3곳 분석 및 요약", "미뤄둔 핵심 클라이언트에게 제안 메일 발송", "오늘 할 일 중 가장 피하고 싶은 1가지 완료"]`;
      userMessage = "나를 위한 3가지 목표를 추천해줘.";
    }

    if (!userMessage && type !== "recommend") {
      return NextResponse.json({ message: "텍스트가 없습니다." }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 200, // 추천 결과를 받기 위해 토큰 수 여유 확보
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const content = message.content[0];
    const responseText = content.type === "text" ? content.text : "";

    // 추천 타입일 경우 JSON 파싱을 시도하고, 아니면 그냥 문자열 반환
    if (type === "recommend") {
      try {
        // AI가 혹시 앞뒤에 불필요한 말을 붙였을 경우를 대비해 괄호 부분만 추출
        const jsonMatch = responseText.match(/\[(.*)\]/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ recommendations: parsed });
        }
        throw new Error("JSON 형식이 아닙니다.");
      } catch (e) {
        console.error("JSON 파싱 실패:", responseText);
        // 파싱 실패 시 기본 옵션 제공
        return NextResponse.json({ 
          recommendations: [
            "가장 피하고 싶었던 핵심 업무 1가지 시작하기",
            "방해 금지 모드 켜고 25분간 기획안 초안 작성",
            "어제 끝내지 못한 주요 업무 1가지 즉시 완료"
          ] 
        });
      }
    }

    return NextResponse.json({ message: responseText.replace(/["']/g, "") });
    
  } catch (error: any) {
    console.error("❌ Claude API 상세 에러:", error);
    return NextResponse.json(
      { message: `연결 중 묵음 발생: ${error.message || '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}