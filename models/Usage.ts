import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUsage extends Document {
  modelName: string;
  intent: string;
  tokens: number;
  timestamp: Date;
}

const UsageSchema = new Schema<IUsage>({
  modelName: { type: String, required: true },
  intent: { type: String, required: true },
  tokens: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
});

const Usage: Model<IUsage> = mongoose.models.Usage || mongoose.model<IUsage>("Usage", UsageSchema);
export default Usage;
