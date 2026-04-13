import { NextResponse } from "next/server";

const models = {
  text: "google/gemma-2-9b-it:free",
  code: "openai/gpt-3.5-turbo",
  roleplay: "gryphe/mythomist-7b:free",
  tech: "nvidia/nemotron-3-8b-chat:free",
  translate: "google/gemma-2-9b-it:free"
};

export async function POST(req: Request) {
  try {
    const { messages, modelType = "text" } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: models[modelType as keyof typeof models] || models.text,
        messages: messages,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}
