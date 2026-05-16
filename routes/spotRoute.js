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
import {
  addCommunityPhoto,
  getCommunityPhotos,
  updateCommunityPhoto,
  deleteCommunityPhoto,
  rateCommunityPhoto,
  commentCommunityPhoto,
} from "../controllers/communityPhotoController.js";

const route = express.Router();

route.post("/create", authMiddleware, upload.single("image"), create);
route.get("/getall", fetch);
route.get("/get/:id", getSingleSpot);
route.put("/update/:id", upload.single("image"), update);

route.delete("/delete/:id", authMiddleware, deleteSpot);

// Community Gallery Routes
route.get("/:spotId/photos", getCommunityPhotos);
route.post("/:spotId/photos", authMiddleware, upload.single("image"), addCommunityPhoto);
route.patch("/photos/:photoId", authMiddleware, updateCommunityPhoto);
route.delete("/photos/:photoId", authMiddleware, deleteCommunityPhoto);
route.post("/photos/:photoId/rate", authMiddleware, rateCommunityPhoto);
route.post("/photos/:photoId/comment", authMiddleware, commentCommunityPhoto);

export default route;
