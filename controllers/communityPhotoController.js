import CommunityPhoto from "../models/communityPhotoModel.js";

export const addCommunityPhoto = async (req, res) => {
  try {
    const { spotId } = req.params;
    const { caption } = req.body;
    const userId = req.user._id;

    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "image is required" });
    }

    const newPhoto = new CommunityPhoto({ spotId, userId, imageUrl, caption });
    const savedPhoto = await newPhoto.save();
    res.status(201).json(savedPhoto);
  } catch (error) {
    console.error("Error adding community photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCommunityPhotos = async (req, res) => {
  try {
    const { spotId } = req.params;
    const photos = await CommunityPhoto.find({ spotId })
      .populate("userId", "name email username")
      .sort({ createdAt: -1 });
    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching community photos:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateCommunityPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { caption } = req.body;
    const userId = req.user._id;

    const photo = await CommunityPhoto.findById(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this photo" });
    }

    photo.caption = caption;
    const updatedPhoto = await photo.save();
    res.status(200).json(updatedPhoto);
  } catch (error) {
    console.error("Error updating community photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCommunityPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;

    const photo = await CommunityPhoto.findById(photoId);
    if (!photo) return res.status(404).json({ message: "Photo not found" });

    if (photo.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this photo" });
    }

    await photo.deleteOne();
    res.status(200).json({ message: "Photo removed successfully" });
  } catch (error) {
    console.error("Error deleting community photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
