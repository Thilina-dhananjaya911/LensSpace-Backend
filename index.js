import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import route from "./routes/spotRoute.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";

dotenv.config(); // ← must be FIRST so PORT & MONGO_URL are available

const app = express();
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;
console.log("MongoDB URL loaded:", MONGOURL ? "✅" : "❌ MISSING");

mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => console.log(error));

app.use("/api/spot", route);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
