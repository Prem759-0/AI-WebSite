import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { action, email, password, name } = await req.json();

    if (action === "signup") {
      const existingUser = await User.findOne({ email });
      if (existingUser) return NextResponse.json({ error: "User exists" }, { status: 400 });

      const user = await User.create({ email, password, name });
      const token = signToken({ userId: user._id });
      return NextResponse.json({ token, user: { email: user.email, name: user.name } });
    }

    if (action === "login") {
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = signToken({ userId: user._id });
      return NextResponse.json({ token, user: { email: user.email, name: user.name } });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
