import User from "../models/userModel.js";

export const toggleFavorite = async (req, res) => {
  try {
    const spotId = req.params.spotId;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    const isFavorited = user.favorites.some((id) => id.toString() === spotId);

    if (isFavorited) {
      // Remove from favorites
      user.favorites = user.favorites.filter(
        (id) => id.toString() !== spotId
      );
    } else {
      // Add to favorites
      user.favorites.push(spotId);
    }

    await user.save();

    res.status(200).json({
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favorites || []);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
