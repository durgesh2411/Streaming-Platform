import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectDB = async () => {
  try {
    console.log(`MongoDB_URI loaded: ${process.env.MongoDB_URI ? "✅" : "❌"}`);
    console.log(`Database name: ${dbName}`);

    // Use the URI directly since database name is already included
    const connectionString = process.env.MongoDB_URI;
    const connectionInstance = await mongoose.connect(`${connectionString}/${dbName}`);

  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
