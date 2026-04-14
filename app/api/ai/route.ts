import { NextResponse } from "next/server";
// Changed detectIntent back to detectType so it matches your saved file exactly!
import { MODEL_MAP, detectType } from "@/lib/ai-router"; 
import connectToDatabase from "@/lib/mongodb";
import Usage from "@/models/Usage";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content;
    
    // Using detectType here to fix the import error
    const intent = detectType(lastMsg);
    const model = MODEL_MAP[intent] || MODEL_MAP.text;

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

    Usage.create({ modelName: model, intent }).catch(console.error);

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
