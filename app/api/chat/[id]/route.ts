import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Chat from "@/models/Chat";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const chat = await Chat.findById(params.id);
    if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    return NextResponse.json(chat);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { messages, title } = await req.json();
    
    const updatedChat = await Chat.findByIdAndUpdate(
      params.id,
      { $set: { messages, title } },
      { new: true }
    );

    return NextResponse.json(updatedChat);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update chat" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    await Chat.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete chat" }, { status: 500 });
  }
}
