import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { action, email, password, name } = await req.json();
    let user;
    if (action === "signup") {
      const existing = await User.findOne({ email });
      if (existing) return NextResponse.json({ error: "Email in use" }, { status: 400 });
      user = await User.create({ email, password: await bcrypt.hash(password, 10), name: name || "User" });
    } else {
      user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "sec", { expiresIn: "7d" });
    return NextResponse.json({ token, user: { name: user.name, email: user.email } });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
