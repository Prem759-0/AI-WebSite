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
        model: "sourceful/riverflow-v2-pro", 
        messages: [{
          role: "user",
          content: `Generate an image based on this exact prompt: "${prompt}". You must reply with ONLY the direct image URL or Base64 data. No extra text.`
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.error?.message || "API Error" }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";

    // Check for standard HTTP URL
    const urlMatch = rawContent.match(/https?:\/\/[^\s)\]"]+/);
    // Check for Base64 Image data
    const base64Match = rawContent.match(/data:image\/[a-zA-Z]*;base64,[^\s)\]"]+/);

    const finalUrl = (urlMatch ? urlMatch[0] : null) || (base64Match ? base64Match[0] : null);

    if (!finalUrl) {
      console.log("Failed to find image in this text:", rawContent);
      return NextResponse.json({ error: "Model returned text instead of an image." }, { status: 500 });
    }

    return NextResponse.json({ url: finalUrl });
  } catch (error: any) {
    return NextResponse.json({ error: "Server failed: " + error.message }, { status: 500 });
  }
}
