import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Chat } from "@/models/schema";
import jwt from "jsonwebtoken";
function getUserId(req: Request) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  try { return (jwt.verify(token, process.env.JWT_SECRET || "sec") as any).userId; } catch { return null; }
}
export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  return NextResponse.json(await Chat.find({ userId }).sort({ updatedAt: -1 }).select("-messages"));
}
export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  const { title } = await req.json();
  return NextResponse.json(await Chat.create({ userId, title: title || "New chat", messages: [] }));
}
