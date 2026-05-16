import express from "express";
import { toggleFavorite, getFavorites } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const route = express.Router();

route.post("/favorite/:spotId", authMiddleware, toggleFavorite);
route.get("/favorites", authMiddleware, getFavorites);

export default route;
