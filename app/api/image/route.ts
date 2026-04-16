import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Please provide a prompt for the image." }, { status: 400 });
    }

    // Since OpenRouter charges money for images and returns blank strings on the free tier,
    // we use a 100% free, fast image API that requires no keys.
    const encodedPrompt = encodeURIComponent(prompt);
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    // This generates a high-quality, unique image instantly
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    // Send the valid URL directly back to your chat UI
    return NextResponse.json({ url: imageUrl });

  } catch (error: any) {
    console.error("Image API Crash:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
