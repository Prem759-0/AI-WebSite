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
        stream: true, // Enable streaming
      }),
    });

    // Create a ReadableStream to pipe OpenRouter response to the client
    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            if (line.includes("[DONE]")) {
              controller.close();
              return;
            }
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content || "";
                if (content) {
                  controller.enqueue(new TextEncoder().encode(content));
                }
              } catch (e) {
                console.error("Error parsing stream chunk", e);
              }
            }
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    return NextResponse.json({ error: "Failed to stream AI response" }, { status: 500 });
  }
}
