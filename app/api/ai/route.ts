import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return new Response("API Key Missing", { status: 500 });

    const { messages, forceModel, webSearch } = await req.json();

    let activeModel = forceModel || "openrouter/free";
    let hasImage = false;

    // 1. Format messages for Vision Models if an image is attached
    const finalMessages = messages.map((msg: any) => {
      // Check if the user's message contains our Base64 image data
      if (msg.role === "user" && msg.content.includes("data:image")) {
        hasImage = true;

        // Extract the base64 image string safely
        const base64Match = msg.content.match(/(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
        
        // Extract the user's actual text prompt
        const textParts = msg.content.split("[User Request]: ");
        const actualPrompt = textParts.length > 1 ? textParts[1].trim() : "Analyze this image.";

        if (base64Match) {
          // Return the specific formatting that Vision Models require
          return {
            role: "user",
            content: [
              { type: "text", text: actualPrompt },
              { type: "image_url", image_url: { url: base64Match[0] } }
            ]
          };
        }
      }
      return msg;
    });

    // 2. Auto-Switch to a free Vision model if an image is detected!
    // Standard text models crash if given image objects, so we safely override here.
    if (hasImage) {
      activeModel = "google/gemini-2.0-flash-lite-preview-02-05:free";
    }

    // 3. Inject Web Search System Prompt (if toggled and no image)
    if (webSearch && !hasImage) {
      finalMessages.unshift({
        role: "system",
        content: "You are connected to the web. Provide up-to-date, factual information. Simulate web search results."
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
