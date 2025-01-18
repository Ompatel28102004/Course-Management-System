import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  ExamName: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: Number, required: true },
  ExamStartDate: { type: Date, required: true },
  ExamEndDate: { type: Date, required: true },
});

// Create and export the Mongoose model
const Exam = mongoose.model('examdetails', ExamSchema);

export default Exam;