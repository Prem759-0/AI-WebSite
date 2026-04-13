import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { title, messages } = await req.json();

    const newChat = await Chat.create({
      title: title || "New Chat",
      messages: messages || [],
    });

    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create chat" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const chats = await Chat.find({}).sort({ updatedAt: -1 });
    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}
