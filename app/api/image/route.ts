import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/dall-e-3", // Or any image model supported by your OpenRouter config
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    // Note: Adjust based on OpenRouter's specific image output format
    return NextResponse.json({ url: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
