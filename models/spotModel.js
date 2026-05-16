import mongoose from "mongoose";

const spotSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  bestTime: { type: String },
  tips: { type: String },

  safetyLevel: {
    type: String,
    enum: ["Safe", "Caution", "High Risk"],
    default: "Safe",
  },
  ecoFriendlyNotes: { type: String },
  accessibility: { type: String },

  liveStatus: {
    type: String,
    enum: ["Crowded", "Quiet", "Rainy", "Clear Sky"],
    default: "Quiet",
  },
  localBusinessHint: { type: String },
  ecoScore: { type: Number, min: 1, max: 10, default: 5 },

  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  image: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

export default mongoose.model("spots", spotSchema);
