import mongoose from 'mongoose';
import Requisition from '../models/requisition/requisition.model.js';
export const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
  await Requisition.syncIndexes();
  console.log("Indexes synced");
};