import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Nexus"
      },
      body: JSON.stringify({
        model: "sourceful/riverflow-v2-pro", // Or bytedance-seed/seedream-4.5
        messages: [{
          role: "user",
          content: `Generate an image based on this exact prompt: "${prompt}". You must reply with ONLY the raw image URL starting with http. No formatting, no markdown.`
        }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ 
        error: errorData.error?.message || `OpenRouter API Error: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";

    // ULTRA-ROBUST URL EXTRACTOR: Finds the http link even if it's buried in text/markdown
    const urlMatch = rawContent.match(/https?:\/\/[^\s)\]"]+/);
    const extractedUrl = urlMatch ? urlMatch[0] : null;

    if (!extractedUrl) {
      console.error("Model did not return a URL. It returned:", rawContent);
      return NextResponse.json({ 
        error: "Model returned text instead of an image. Try a different prompt." 
      }, { status: 500 });
    }

    return NextResponse.json({ url: extractedUrl });
  } catch (error: any) {
    return NextResponse.json({ error: "Server failed: " + error.message }, { status: 500 });
  }
}
