import Spot from "../models/spotModel.js";

export const create = async (req, res) => {
  try {
    const { title, category, safetyLevel, location, description, bestTimeToVisit, latitude, longitude } = req.body;
    const imageUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

    if (!title || !location || !description || !category || !imageUrl) {
      return res.status(400).json({
        message: "Please provide title, location, description, category, and an image.",
      });
    }

    const spotData = new Spot({
      title,
      category,
      safetyLevel,
      location,
      description,
      bestTimeToVisit,
      imageUrl,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
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
      updateData.imageUrl = req.file.path.replace(/\\/g, "/");
    }
    if (updateData.latitude) updateData.latitude = parseFloat(updateData.latitude);
    if (updateData.longitude) updateData.longitude = parseFloat(updateData.longitude);

    const updatedSpot = await Spot.findByIdAndUpdate(id, updateData, { returnDocument: 'after' });
    res.status(200).json(updatedSpot);
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
      return res.status(403).json({ message: "You are not authorized to delete this spot." });
    }

    await Spot.findByIdAndDelete(id);
    res.status(200).json({ message: "Spot deleted successfully." });
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
