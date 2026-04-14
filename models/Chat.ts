import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New Chat" },
  messages: [{
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
