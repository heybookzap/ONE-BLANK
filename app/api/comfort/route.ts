import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { worstHabit, drainText, concernType } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        system: `당신은 ONE BLANK의 수석 디렉터입니다.
        고객의 고민 유형인 "${concernType}"과 지우고 싶은 습관 "${worstHabit}"을 이해하고 있습니다.
        현재의 감정("${drainText}")을 해소하고 확신을 주는 메시지를 작성하세요.

        [절대 규칙]
        1. 고객의 이름이나 호칭(예: ~님께)을 절대 사용하지 마세요.
        2. 마크다운 기호(**, #, ---)나 불필요한 줄바꿈을 절대 사용하지 마세요.
        3. 전체 분량을 반드시 2~3줄(문장)로 제한하여 짧고 묵직하게 출력하세요.`,
        messages: [{ role: "user", content: "감정을 씻어낼 짧고 강렬한 2~3줄의 문장을 작성해." }]
      })
    });

    const data = await response.json();
    return NextResponse.json({ message: data.content[0].text });
  } catch (error) {
    return NextResponse.json({ message: "비움의 시간이 당신의 가치를 증명할 것입니다. 잠시 멈추고 본질에 집중하십시오." });
  }
}