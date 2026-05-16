import express from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

import {
  create,
  fetch,
  update,
  deleteSpot,
  getSingleSpot,
} from "../controllers/spotController.js";

const route = express.Router();

route.post("/create", authMiddleware, upload.single("image"), create);
route.get("/getall", fetch);
route.get("/get/:id", getSingleSpot);
route.put("/update/:id", upload.single("image"), update);

route.delete("/delete/:id", authMiddleware, deleteSpot);

export default route;
