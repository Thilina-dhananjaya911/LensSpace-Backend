import express from "express";

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

route.delete("/delete/:id", deleteSpot);

export default route;
