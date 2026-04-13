import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { action, email, password, name } = await req.json();

    let user;
    if (action === "signup") {
      user = await User.create({ email, password, name: name || "User" });
    } else {
      user = await User.findOne({ email });
      if (!user || user.password !== password) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }

    const token = signToken({ userId: user._id });
    
    // Set the cookie for the middleware to see
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ user: { email: user.email, name: user.name } });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 500 });
  }
}
