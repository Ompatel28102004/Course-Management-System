import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import path from 'path';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

export const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw" // Important for non-image files
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
export const deleteAsset = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (error) {
    console.error('Error deleting asset:', error);
  }
};
