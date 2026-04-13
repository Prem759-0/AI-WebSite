import { NextResponse } from "next/server";
import { MODEL_MAP, detectIntent } from "@/lib/ai-router";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;
    
    const intent = detectIntent(lastMessage);
    const model = MODEL_MAP[intent];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
      }),
    });

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return controller.close();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            if (line.includes("[DONE]")) { controller.close(); return; }
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || "";
              controller.enqueue(new TextEncoder().encode(content));
            } catch {}
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error) {
    return NextResponse.json({ error: "Router failed" }, { status: 500 });
  }
}
