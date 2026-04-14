import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key is missing from Vercel/env" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Nexus"
      },
      body: JSON.stringify({
        // Updated to your exact requested model
        model: "sourceful/riverflow-v2-pro", 
        messages: [{
          role: "user",
          content: `Generate an image based on this exact prompt: "${prompt}". Return ONLY a direct, working image URL. No extra text.`
        }],
      }),
    });

    // Check if OpenRouter rejected the request (e.g., out of credits)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter Error:", errorData);
      return NextResponse.json({ 
        error: errorData.error?.message || `OpenRouter API Error: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    let url = data.choices?.[0]?.message?.content?.trim();

    // Validate that the model actually returned a URL
    if (!url || !url.startsWith("http")) {
      console.error("Model did not return a URL. It returned:", url);
      return NextResponse.json({ 
        error: "The model returned text instead of an image URL. Please try a different prompt." 
      }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Image Route Catch Error:", error);
    return NextResponse.json({ error: "Server failed: " + error.message }, { status: 500 });
  }
}
