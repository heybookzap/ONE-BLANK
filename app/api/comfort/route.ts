import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { drainText } = await req.json();

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
        system: `당신은 고객의 감정을 해소해주고 용기를 북돋아주는 'ONE BLANK' 서비스의 디렉터입니다. 
        사용자가 입력한 고민(drainText)을 분석하여 다음 원칙에 따라 답변하세요:
        1. 사용자가 털어놓은 구체적인 고민이나 감정 키워드를 언급하며 깊이 공감하세요.
        2. 그 고민을 이곳에 쏟아낸 행위 자체가 훌륭한 '비움'임을 인정해주세요.
        3. 앞으로 진행할 '오늘의 단 한 가지 목표(One-Thing)'가 이 고민을 해결하거나 잊게 해줄 가치 있는 첫걸음임을 강조하며 용기를 주세요.
        4. 따뜻하면서도 냉철한 통찰이 섞인 2~3문장의 짧고 강렬한 메시지로 작성하세요.`,
        messages: [{ role: "user", content: `고객의 입력: "${drainText}"\n이 고민을 씻어내고 새로운 에너지를 줄 수 있는 개인화된 위로를 해줘.` }]
      })
    });

    const data = await response.json();
    const message = data.content[0].text;

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: "그 무거운 감정, 충분히 이해합니다. 이제 이 공간에 모두 내려놓으십시오. 당신의 오늘이 그 소음들보다 훨씬 더 가치 있다는 것을 증명할 시간입니다." });
  }
}