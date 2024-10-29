import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import FilesUploadRoutes from "./routes/FilesUploadRoutes.js";
import StudentRoutes from "./routes/StudentRoutes.js";
import AcademicAdminRoutes from "./routes/AcademicAdminRoutes.js";
import cron from 'node-cron';
import Feedback from './model/feedbackModel.js';
dotenv.config();

const app = express();

app.use(cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use('/api/auth', AuthRoutes);
app.use('/api/student', StudentRoutes);
app.use('/api/academic-admin', AcademicAdminRoutes);
app.use('/api/file', FilesUploadRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

mongoose.connect(MONGO_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => {
        console.error("Database connection error:", err.message);
    });

// Scheduled cron task setup
cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const feedbacksToUpdate = await Feedback.find({ endDateTime: { $lt: now }, isActive: true });

        if (feedbacksToUpdate.length > 0) {
            const feedbackIDs = feedbacksToUpdate.map(feedback => feedback.feedbackID);
            await Feedback.updateMany(
                { feedbackID: { $in: feedbackIDs } },
                { isActive: false }
            );
            console.log(`Updated feedback forms to inactive status: ${feedbackIDs.join(', ')}`);
        } else {
            console.log("No feedback forms to update.");
        }
    } catch (error) {
        console.error('Error updating feedback forms:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});
