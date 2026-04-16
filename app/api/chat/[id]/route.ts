import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Chat } from "@/models/schema";
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  return NextResponse.json(await Chat.findById(params.id));
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const { messages, title } = await req.json();
  const updateData: any = { updatedAt: Date.now() };
  if (messages) updateData.messages = messages;
  if (title) updateData.title = title;
  return NextResponse.json(await Chat.findByIdAndUpdate(params.id, updateData, { new: true }));
}
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  await Chat.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
