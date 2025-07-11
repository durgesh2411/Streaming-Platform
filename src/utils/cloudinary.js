import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnClouddinary = async (filePathName) => {
  try {
    if (!filePathName) {
      console.log("No file path provided");
      return null;
    }

   //  console.log("Attempting to upload file:", filePathName);
   //  console.log("Cloudinary config check:", {
   //    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   //    api_key: process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
   //    api_secret: process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing",
   //  });

    // Check if file exists
    if (!fs.existsSync(filePathName)) {
      console.error("File does not exist:", filePathName);
      return null;
    }

    // Upload file to cloudinary
    const result = await cloudinary.uploader.upload(filePathName, {
      resource_type: "auto", // Automatically detect resource type (image, video, etc.)
    });

    // File uploaded successfully
    console.log("File uploaded successfully:", result.url);

    // Delete the local file after successful upload
    fs.unlinkSync(filePathName);

    return result; // Return the result object
  } catch (error) {
    console.error("Cloudinary upload error details:", {
      message: error.message,
      http_code: error.http_code,
      error: error,
    });

    // Delete the local file if upload fails
    if (fs.existsSync(filePathName)) {
      fs.unlinkSync(filePathName);
      console.log("Local file deleted after failed upload");
    }
    return null;
  }
};
export { uploadOnClouddinary };
