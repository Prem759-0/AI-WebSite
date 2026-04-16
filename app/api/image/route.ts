import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "sourceful/riverflow-v2-pro", messages: [{ role: "user", content: `Generate image URL only: ${prompt}` }] }),
    });
    const data = await response.json();
    const urlMatch = (data.choices?.[0]?.message?.content || "").match(/https?:\/\/[^\s)\]"]+/);
    if (!urlMatch) throw new Error("Image failed");
    return NextResponse.json({ url: urlMatch[0] });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
