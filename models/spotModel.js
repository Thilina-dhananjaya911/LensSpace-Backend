import mongoose from "mongoose";

const spotSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  safetyLevel: { type: String, enum: ["Safe", "Caution", "High Risk"], default: "Safe" },
  location: { type: String, required: true },
  description: { type: String, required: true },
  bestTimeToVisit: { type: String },
  imageUrl: { type: String, required: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

export default mongoose.model("spots", spotSchema);
