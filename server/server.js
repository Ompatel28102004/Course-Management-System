import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import FilesUploadRoutes from "./routes/FilesUploadRoutes.js";
import StudentRoutes from "./routes/StudentRoutes.js";
import MasterAdminRoutes from "./routes/MasterAdminRoutes.js";
import AcademicAdminRoutes from "./routes/AcademicAdminRoutes.js";
import FinanceAdminRoutes from "./routes/FinanceAdminRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import setupSocket from './socket.js';
import FacultyRoutes from "./routes/facultyRoutes.js";
import cron from 'node-cron';
import Feedback from './model/feedbackModel.js';
import TAModel from './model/TaModel.js';
import Student from './model/StudentModel.js';
import Exam from './model/ExamDetailsModel.js';

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
app.use('/api/master-admin', MasterAdminRoutes);
app.use('/api/academic-admin', AcademicAdminRoutes);
app.use('/api/finance-admin', FinanceAdminRoutes);
app.use('/api/faculty', FacultyRoutes);
app.use('/api/message', MessageRoutes);
app.use('/api/file', FilesUploadRoutes);


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Setup WebSocket
setupSocket(server);
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
// Scheduled cron task setup
cron.schedule('0 0 * * *', async () => {
    try {
        // Set `now` to only include the date, ignoring the time
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time to 00:00:00

        const studentsToUpdate = await TAModel.find({ endDate: { $lte: now } });

        if (studentsToUpdate.length > 0) {
            const studentIDs = studentsToUpdate.map(student => student.enrollment);
            await Student.updateMany(
                { enrollment: { $in: studentIDs } },
                { 'Academic_info.isTA': false }
            );
            console.log(`Updated student records to inactive status: ${studentIDs.join(', ')}`);
        } else {
            console.log("No student records to update.");
        }
    } catch (error) {
        console.error('Error updating student records:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});
// Scheduled cron task setup
cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const examsToDelete = await Exam.find({ examDateTime: { $lt: now } });

        if (examsToDelete.length > 0) {
            const examIDs = examsToDelete.map(exam => exam.examID);
            await Exam.deleteMany({ examID: { $in: examIDs } });
            console.log(`Deleted past exams from the database: ${examIDs.join(', ')}`);
        } else {
            console.log("No past exams to delete.");
        }
    } catch (error) {
        console.error('Error deleting past exams:', error);
    }
}, {
    timezone: "Asia/Kolkata"
});

