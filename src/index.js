import mongoose from "mongoose";
import { dbName } from "./constants.js";
import connectDB from "./db/index.js";

// Connect to MongoDB with modularity:
connectDB(); // This is the new way to connect to the database using the exported function.

// async function connectDB(){/* connection logic*/}
// connectDB();                        // old way
//use IFFE
// ;(async () => {
//    try{
//       await mongoose.connect(`${process.env.MongoDB_URI}/${dbName}`)
//    }
//    catch (error) {
//        console.error("Error connecting to the database:", error);
//    }
// })()
