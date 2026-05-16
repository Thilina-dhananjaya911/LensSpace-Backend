import mongoose from "mongoose";

const communityPhotoSchema = new mongoose.Schema(
  {
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "spots",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        stars: { type: Number, required: true, min: 1, max: 5 },
      }
    ],
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true } // This automatically adds createdAt and updatedAt fields
);

export default mongoose.model("community_photos", communityPhotoSchema);
