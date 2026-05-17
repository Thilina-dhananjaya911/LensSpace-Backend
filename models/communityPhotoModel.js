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
  },
  { timestamps: true }
);

export default mongoose.model("community_photos", communityPhotoSchema);
