import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) throw new Error("API Key missing");

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
    
    // Fail-safe URL check
    const url = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.url;
    
    if (!url || !url.startsWith("http")) {
       return NextResponse.json({ error: "Model failed to provide a valid image URL" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Image API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
