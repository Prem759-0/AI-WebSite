import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Chat from "@/models/Chat";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function getUserId() {
  const token = cookies().get("auth-token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch { return null; }
}

export async function GET() {
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const chats = await Chat.find({ userId }).sort({ updatedAt: -1 }).select("-messages");
  return NextResponse.json(chats);
}

export async function POST(req: Request) {
  const userId = getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const { title } = await req.json();
  const chat = await Chat.create({ userId, title: title || "New Chat", messages: [] });
  return NextResponse.json(chat);
}
