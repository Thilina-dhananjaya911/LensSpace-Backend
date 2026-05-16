import mongoose from 'mongoose';
import User from './models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URL);
  const user = await User.findOne();
  if (!user) {
    console.log("No user found.");
    process.exit(0);
  }
  console.log("User:", user.email, "Favorites:", user.favorites);

  if (!user.favorites) {
    user.favorites = [];
  }
  
  // add a fake favorite
  const fakeId = new mongoose.Types.ObjectId();
  user.favorites.push(fakeId);
  await user.save();
  
  console.log("Saved. Favorites:", user.favorites);
  process.exit(0);
}

test().catch(console.error);
