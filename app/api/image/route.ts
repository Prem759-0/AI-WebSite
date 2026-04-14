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
        model: "sourceful/riverflow-v2-pro", 
        messages: [{
          role: "user",
          content: `Generate an image based on: "${prompt}". Reply with ONLY the raw image URL. No markdown.`
        }],
      }),
    });

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";
    const urlMatch = rawContent.match(/https?:\/\/[^\s)\]"]+/);
    
    if (!urlMatch) throw new Error("Model returned text instead of a URL.");
    return NextResponse.json({ url: urlMatch[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
