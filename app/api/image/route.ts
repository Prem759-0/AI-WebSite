import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "API Key is missing" }, { status: 500 });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Nexus"
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux-1-schnell", // Fast & highly reliable image model
        messages: [{
          role: "user",
          content: `Generate an image based on this exact prompt: "${prompt}". Return ONLY a direct, working image URL. No extra text.`
        }],
      }),
    });

    const data = await response.json();
    let url = data.choices?.[0]?.message?.content?.trim();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ 
        error: "Image generation failed. Please try a different prompt or check API credits." 
      }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: "Generation failed: " + error.message }, { status: 500 });
  }
}
