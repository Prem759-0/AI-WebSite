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
        model: "openai/dall-e-3", // Ensure your OpenRouter account has access/credits
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Generate an image based on: ${prompt}` }
            ]
          }
        ],
      }),
    });

    const data = await response.json();
    // OpenRouter usually returns the image URL in the content or as a specific field
    const imageUrl = data.choices[0]?.message?.content || data.choices[0]?.message?.url;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
