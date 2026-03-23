import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { EMPATHY_MESSAGES, ACTION_MESSAGES, pickRandom } from "@/lib/messages";

export async function POST(req: NextRequest) {
  try {
    const { text, type } = (await req.json()) as {
      text: string;
      type: "empathy" | "suggestion";
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // API 키 없을 때 큐레이션 메시지 랜덤 반환
    if (
      !process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_API_KEY === "your_api_key_here"
    ) {
      const fallback =
        type === "empathy"
          ? pickRandom(EMPATHY_MESSAGES)
          : pickRandom(ACTION_MESSAGES);
      return NextResponse.json({ text: fallback });
    }

    const client = new Anthropic();

    const prompt =
      type === "empathy"
        ? `사용자가 지금 이런 감정을 느끼고 있어요:\n\n"${text}"\n\n판단 없이, 조언 없이, 오직 공감만 담은 따뜻한 한국어 한 문장을 써주세요. 50자 이내로.`
        : `사용자가 이런 감정을 쏟아냈어요:\n\n"${text}"\n\n이 감정을 이겨낼 오늘의 구체적인 행동 하나를 제안해주세요. "오늘 [행동]" 형식으로 20자 이내.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error("Emotion API error:", error);
    return NextResponse.json(
      { text: "잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
