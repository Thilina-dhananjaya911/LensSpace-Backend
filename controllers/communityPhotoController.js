import CommunityPhoto from "../models/communityPhotoModel.js";

// @desc    Add a community photo to a spot
// @route   POST /api/spot/:spotId/photos
// @access  Private
export const addCommunityPhoto = async (req, res) => {
  try {
    const { spotId } = req.params;
    const { caption } = req.body;
    const userId = req.user._id;

    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "image is required" });
    }

    const newPhoto = new CommunityPhoto({
      spotId,
      userId,
      imageUrl,
      caption,
    });

    const savedPhoto = await newPhoto.save();

    res.status(201).json(savedPhoto);
  } catch (error) {
    console.error("Error adding community photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all photos for a spot
// @route   GET /api/spot/:spotId/photos
// @access  Public
export const getCommunityPhotos = async (req, res) => {
  try {
    const { spotId } = req.params;
    const photos = await CommunityPhoto.find({ spotId })
      .populate("userId", "name email profilePicture username") // populated fields requested by user
      .populate("comments.userId", "name email profilePicture username")
      .sort({ createdAt: -1 });

    res.status(200).json(photos);
  } catch (error) {
    console.error("Error fetching community photos:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a community photo caption
// @route   PATCH /api/spot/photos/:photoId
// @access  Private
export const updateCommunityPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { caption } = req.body;
    const userId = req.user._id;

    const photo = await CommunityPhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Check ownership
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

// @desc    Delete a community photo
// @route   DELETE /api/spot/photos/:photoId
// @access  Private
export const deleteCommunityPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.user._id;

    const photo = await CommunityPhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Check ownership
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

// @desc    Rate a community photo
// @route   POST /api/spot/photos/:photoId/rate
// @access  Private
export const rateCommunityPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { stars } = req.body;
    const userId = req.user._id;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: "Please provide a star rating between 1 and 5" });
    }

    const photo = await CommunityPhoto.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    const existingRating = photo.ratings.find(r => r.userId.toString() === userId.toString());
    
    if (existingRating) {
      existingRating.stars = stars;
    } else {
      photo.ratings.push({ userId, stars });
    }

    await photo.save();
    res.status(200).json({ message: "Rating saved successfully", ratings: photo.ratings });
  } catch (error) {
    console.error("Error rating photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Comment on a community photo
// @route   POST /api/spot/photos/:photoId/comment
// @access  Private
export const commentCommunityPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Please provide comment text" });
    }

    const photo = await CommunityPhoto.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    photo.comments.push({ userId, text });
    await photo.save();

    // Populate user info for the new comment to return to frontend
    const populatedPhoto = await CommunityPhoto.findById(photoId).populate("comments.userId", "name email profilePicture username");

    res.status(201).json({ message: "Comment added successfully", comments: populatedPhoto.comments });
  } catch (error) {
    console.error("Error commenting on photo:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
