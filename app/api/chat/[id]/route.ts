import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/Chat";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const chat = await Chat.findById(params.id);
  if (!chat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(chat);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { messages, title } = await req.json();
  const updateData: any = { updatedAt: Date.now() };
  if (messages) updateData.messages = messages;
  if (title) updateData.title = title;
  
  const chat = await Chat.findByIdAndUpdate(params.id, updateData, { new: true });
  return NextResponse.json(chat);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await Chat.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
