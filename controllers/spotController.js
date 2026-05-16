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

    if (
      !name ||
      !location ||
      !description ||
      !category ||
      !latitude ||
      !longitude
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
    });

    const savedSpot = await spotData.save();
    res.status(200).json(savedSpot);
  } catch (error) {
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
    const updatedSpot = await Spot.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json(updatedSpot);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteSpot = async (req, res) => {
  try {
    const id = req.params.id;
    const spotExist = await Spot.findOne({ _id: id });
    if (!spotExist) {
      return res.status(404).json({ message: "Spot not found." });
    }
    await Spot.findByIdAndDelete(id);
    res.status(201).json({ message: "Spot deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error." });
  }
};
