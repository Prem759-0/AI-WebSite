import { NextResponse } from "next/server";
import { MODEL_MAP, detectIntent } from "@/lib/ai-router";
import connectToDatabase from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    // 1. Check for API Key first
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return new Response("Error: OPENROUTER_API_KEY is missing in Vercel Settings", { status: 500 });
    }

    // 2. Try to connect to DB, but don't crash if it fails
    try {
      await connectToDatabase();
    } catch (dbErr) {
      console.error("DB Connection Failed, continuing anyway...");
    }
    
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content;
    const intent = detectIntent(lastMsg);
    
    // 3. Use a VERY stable model for testing
    const model = "mistralai/mistral-7b-instruct:free"; 

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Cortex AI"
      },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`OpenRouter Error: ${errorText}`, { status: response.status });
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
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
          for (const line of lines) {
            if (line.includes("[DONE]")) { controller.close(); return; }
            try {
              const data = JSON.parse(line.slice(6));
              const content = data.choices[0]?.delta?.content || "";
              controller.enqueue(new TextEncoder().encode(content));
            } catch (e) {}
          }
        }
        controller.close();
      },
    });

    return new Response(stream);
  } catch (error: any) {
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}
