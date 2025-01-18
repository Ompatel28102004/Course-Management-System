import express from "express";
import multer from "multer";
import { uploadFileController } from "../controller/FilesController.js";
import { uploadImageController } from "../controller/ImageController.js";
import { verifyToken } from '../middlewares/AuthMiddleware.js';


const router = express.Router();

// Configure multer storage
const uploader = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 500000 },
});

router.post('/upload-file',verifyToken, uploader.single("file"), uploadFileController);
router.post('/upload-image',verifyToken, uploader.single("file"), uploadImageController);

export default router;
