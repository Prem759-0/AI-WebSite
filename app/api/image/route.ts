import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000", // Required by some OpenRouter models
        "X-Title": "AI Nexus"
      },
      body: JSON.stringify({
        // Using Flux or Stable Diffusion for better reliability via OpenRouter
        model: "black-forest-labs/flux-1-schnell", 
        messages: [
          {
            role: "user",
            content: `Generate a high-quality image of: ${prompt}. Return ONLY the direct URL of the image.`
          }
        ],
      }),
    });

    const data = await response.json();
    
    // OpenRouter Image models usually put the URL in the content 
    // or a specific field depending on the provider.
    let url = data.choices?.[0]?.message?.content?.trim();

    // Basic check: If it doesn't look like a URL, it might be an error or text description
    if (!url || !url.startsWith("http")) {
      console.error("Model response was not a URL:", url);
      return NextResponse.json({ 
        error: "Model provided text instead of a URL. Please try a different prompt." 
      }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: "Generation failed: " + error.message }, { status: 500 });
  }
}
