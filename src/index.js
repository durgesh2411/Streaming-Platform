import mongoose from "mongoose";
import { dbName } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js"; // Import the app from app.js

// Connect to MongoDB with modularity:

connectDB() // This is the new way to connect to the database using the exported function.
.then(() =>{
   app.on('error', (err) => {
      console.error("Server error:", err);  // app.on helps to catch errors that occur during the server's operation
      throw err
   })
   app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`)
   })
})    // we used async and awit in db/index.js, the promise returned by mongoose.connect should be handled here
.catch((err) =>{
      console.error("Error connecting to the database:", err);
      process.exit(1); // Exit the process with failure
})




// OLD WAY TO CONNECT TO MONGODB:

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
