import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloud_api_key: process.env.CLOUDINARY_API_KEY,
  cloud_api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnClouddinary = async (filePathName) =>{
   try{
      if(!filePathName) throw new Error("File path is required for upload");
      const result = await cloudinary.uploader.upload(filePathName, {
         resource_type: "auto", // Automatically detect resource type (image, video, etc.)
         public_id: "my_dog", // Optional: specify a public ID for the uploaded file
      });
         //file uploaded sucussfully, you can use the result object to get details like URL, public ID, etc.
         console.log("File uploaded successfully:", result.url);
         return result; // Return the result object for further processing if needed
   }
   catch{
      fs.unlinkSync(filePathName)   // Delete the file if upload fails from local server
      return {error: "File upload failed", message: error.message};
   }
}
export default uploadOnClouddinary;
