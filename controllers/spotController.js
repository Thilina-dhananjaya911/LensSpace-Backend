import Spot from "../models/spotModel.js";

export const create = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      category,
      bestTime,
      tips,
      safetyLevel,
      ecoFriendlyNotes,
      accessibility,
      liveStatus,
      localBusinessHint,
      ecoScore,
      latitude,
      longitude,
    } = req.body;

    const image = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (
      !name ||
      !location ||
      !description ||
      !category ||
      !latitude ||
      !longitude ||
      !image
    ) {
      return res.status(400).json({
        message:
          "Enter the required data and map location (Latitude/Longitude)!",
      });
    }

    const spotData = new Spot({
      name,
      location,
      description,
      category,
      bestTime,
      tips,
      safetyLevel,
      ecoFriendlyNotes,
      accessibility,
      liveStatus,
      localBusinessHint,
      ecoScore,
      latitude,
      longitude,
      image,
      createdBy: req.user._id,
    });

    const savedSpot = await spotData.save();
    res.status(201).json(savedSpot);
  } catch (error) {
    console.error("Error in create:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetch = async (req, res) => {
  try {
    const spots = await Spot.find();
    if (spots.length === 0) {
      return res.status(404).json({ message: "No spots found" });
    }
    res.status(200).json(spots);
  } catch (error) {
    console.error("Error in fetch:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const spotExist = await Spot.findOne({ _id: id });
    if (!spotExist) {
      return res.status(404).json({ message: "Spot not found." });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const updatedSpot = await Spot.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    res.status(201).json(updatedSpot);
  } catch (error) {
    console.error("Error in update:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteSpot = async (req, res) => {
  try {
    const id = req.params.id;
    const spot = await Spot.findById(id);
    if (!spot) {
      return res.status(404).json({ message: "Spot not found." });
    }

    if (spot.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this spot." });
    }

    await Spot.findByIdAndDelete(id);
    res.status(201).json({ message: "Spot deleted successfully." });
  } catch (error) {
    console.error("Error in deleteSpot:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const getSingleSpot = async (req, res) => {
  try {
    const id = req.params.id;
    const spot = await Spot.findById(id);
    if (!spot) {
      return res.status(404).json({ message: "Spot not found." });
    }
    res.status(200).json(spot);
  } catch (error) {
    console.error("Error in getSingleSpot:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
};
