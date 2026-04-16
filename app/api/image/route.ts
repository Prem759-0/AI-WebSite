import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing in Vercel settings" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-web-site-sigma.vercel.app",
        "X-Title": "Cortex AI"
      },
      body: JSON.stringify({
        model: "sourceful/riverflow-v2-pro", 
        messages: [{
          role: "user",
          content: `Generate an image of: ${prompt}. Return ONLY the direct URL.`
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `OpenRouter Image Error: ${errText}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const urlMatch = content.match(/https?:\/\/[^\s)\]"]+/);

    if (!urlMatch) {
      return NextResponse.json({ error: `AI didn't return a valid image link. It returned: ${content}` }, { status: 500 });
    }

    return NextResponse.json({ url: urlMatch[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
