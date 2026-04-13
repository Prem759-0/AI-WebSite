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
        model: "openai/dall-e-3", 
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    
    // Fail-safe URL extraction
    const url = data.choices?.[0]?.message?.content || 
                data.choices?.[0]?.message?.url || 
                data.data?.[0]?.url;

    if (!url) {
      console.error("OpenRouter returned no URL:", data);
      return NextResponse.json({ error: "No image URL returned" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: "Image generation failed" }, { status: 500 });
  }
}
