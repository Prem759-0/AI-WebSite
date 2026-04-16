import { NextResponse } from "next/server";
import { MODEL_MAP, detectIntent } from "@/lib/ai-router";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return new Response("API Key Missing", { status: 500 });

    const { messages, forceModel, webSearch } = await req.json();
    
    // 1. Model Selection Logic
    let activeModel = "openrouter/free";
    
    if (forceModel && forceModel !== "auto") {
      // User manually selected a specific persona
      activeModel = forceModel;
    } else {
      // Auto-detect based on intent
      const lastMsg = messages[messages.length - 1]?.content || "";
      const intent = detectIntent(lastMsg);
      activeModel = MODEL_MAP[intent] || "openrouter/free";
    }

    // 2. Inject Web Search System Prompt (if toggled)
    let finalMessages = [...messages];
    if (webSearch) {
      finalMessages.unshift({
        role: "system",
        content: "You are connected to the web. The user expects up-to-date, factual information. Simulate web search results in your response."
      });
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
        model: activeModel, 
        messages: finalMessages, 
        stream: true 
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(`OpenRouter Error: ${err}`, { status: response.status });
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
            if (line.includes("[DONE]")) { 
              controller.close(); 
              return; 
            }
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.choices[0]?.delta?.content || "";
              controller.enqueue(new TextEncoder().encode(text));
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
