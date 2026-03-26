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
        max_tokens: 200,
        system: "당신은 고객의 감정을 깊이 이해하고 위로와 용기를 주는 디렉터입니다. 고객이 방금 토해낸 불안이나 부정적 감정을 분석하여, 그들의 감정에 깊이 공감하고 위로를 건네세요. 동시에 그들이 앞으로 나아갈 수 있는 희망을 주고, 그들의 다음 행동과 계획에 긍정적이고 가치 있는 의미를 부여하는 따뜻한 1~2문장의 메시지를 작성하세요. 절대 고객의 감정이나 꿈을 무시하거나 차갑게 대하지 마세요.",
        messages: [{ role: "user", content: `고객의 현재 고민과 감정: ${drainText}\n\n이 감정에 맞춘 진심 어린 위로와 용기의 메시지를 작성해.` }]
      })
    });

    const data = await response.json();
    const message = data.content[0].text;

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ message: "그 무거운 감정, 충분히 이해합니다. 이제 이 공간에 내려놓고 당신의 빛나는 하루를 위해 작은 한 걸음을 내디뎌 봅시다." });
  }
}