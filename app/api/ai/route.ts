import { NextResponse } from "next/server";

// Updated 2026 model mapping
const models = {
  text: "google/gemma-4-26b-a4b-it:free",
  code: "openai/gpt-oss-120b:free",
  roleplay: "z-ai/glm-4.5-air:free",
  tech: "nvidia/nemotron-3-super-120b-a12b:free",
  translate: "minimax/minimax-m2.5:free"
};

export async function POST(req: Request) {
  try {
    const { messages, modelType = "text" } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("CRITICAL: OPENROUTER_API_KEY is missing in .env.local");
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: models[modelType as keyof typeof models] || models.text,
        messages: messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter Error:", response.status, errorData);
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return controller.close();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(line => line.trim() !== "");

          for (const line of lines) {
            if (line === "data: [DONE]") {
              controller.close();
              return;
            }
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || "";
                controller.enqueue(new TextEncoder().encode(content));
              } catch (e) {
                // Ignore parsing errors for empty chunks
              }
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Stream failed" }, { status: 500 });
  }
}
