import mongoose from "mongoose";
export const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "Jackson" }
}));
export const Chat = mongoose.models.Chat || mongoose.model("Chat", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New chat" },
  messages: [{ role: { type: String, enum: ["user", "assistant"], required: true }, content: { type: String, required: true } }],
  updatedAt: { type: Date, default: Date.now }
}));
