import { NextResponse } from "next/server";

// --- NEW: Live Web Scraper Engine ---
// This allows the AI to read online articles, docs, and websites instantly.
async function fetchWebContext(url: string) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    
    // Clean the HTML to get pure readable text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 20000); // Send up to 20,000 characters to the AI

    return cleanText;
  } catch (e) {
    return "Failed to read the live webpage. It might be blocked or private.";
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return new Response("API Key Missing", { status: 500 });

    const { messages, forceModel, webSearch } = await req.json();

    let activeModel = forceModel || "openrouter/free";
    let hasImage = false;

    // Process all messages: Handle Images and Live URLs
    const finalMessages = await Promise.all(messages.map(async (msg: any) => {
      if (msg.role === "user") {
        let content = msg.content;

        // 1. Detect and Read Online Links (URLs)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = content.match(urlRegex);
        
        if (urls && urls.length > 0) {
          const urlToScrape = urls[0];
          const scrapedText = await fetchWebContext(urlToScrape);
          // Inject the scraped data seamlessly into the prompt
          content = `[LIVE WEBPAGE DATA FROM ${urlToScrape}]:\n${scrapedText}\n\n[USER QUESTION]:\n${content}`;
        }

        // 2. Detect and Format Uploaded Images for Vision Models
        if (content.includes("data:image")) {
          hasImage = true;
          const base64Match = content.match(/(data:image\/[^;]+;base64,[a-zA-Z0-9+/=]+)/);
          const textParts = content.split("[User Request]: ");
          const actualPrompt = textParts.length > 1 ? textParts[1].trim() : content;

          if (base64Match) {
            return {
              role: "user",
              content: [
                { type: "text", text: actualPrompt },
                { type: "image_url", image_url: { url: base64Match[0] } }
              ]
            };
          }
        }
        
        return { ...msg, content };
      }
      return msg;
    }));

    // Auto-Switch to a stable Vision model if an image is detected
    if (hasImage) {
      activeModel = "google/gemini-2.0-flash-exp:free";
    }

    // Apply Web Search prompt if user explicitly toggled it
    if (webSearch && !hasImage) {
      finalMessages.unshift({
        role: "system",
        content: "You are an advanced AI. The user may have provided live data from a website. Analyze it deeply, format your response beautifully with Markdown, and answer factually."
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
