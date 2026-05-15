import express from "express";
// මෙතන අන්තිමට deleteSpot කියලා තියෙනවාද බලන්න
import {
  create,
  fetch,
  update,
  deleteSpot,
} from "../controllers/spotController.js";

const route = express.Router();

route.post("/create", create);
route.get("/getall", fetch);
route.put("/update/:id", update);
// මෙතනත් deleteSpot කියලා නම ලියන්න
route.delete("/delete/:id", deleteSpot);

export default route;
