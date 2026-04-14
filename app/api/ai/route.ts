import { NextResponse } from "next/server";
import { MODEL_MAP, detectIntent } from "@/lib/ai-router";
import connectToDatabase from "@/lib/mongodb";
import Usage from "@/models/Usage";

export async function POST(req: Request) {
  try {
    // 1. Connect to DB for usage tracking
    await connectToDatabase();
    
    // 2. Extract messages
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content;
    
    // 3. Detect intent and map to model
    const intent = detectIntent(lastMsg);
    const model = MODEL_MAP[intent] || MODEL_MAP.text;

    // 4. Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.status}`);
    }

    // 5. Async usage tracking (doesn't block the response)
    Usage.create({ modelName: model, intent }).catch(console.error);

    // 6. Stream the response
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
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
