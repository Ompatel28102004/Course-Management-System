import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  credits: Number,
  grade: String,
  score: Number
}, { _id: false });

const semesterSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  courses: [courseSchema],
  sgpa: Number,
  cgpa: Number
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true,
    unique: true // Ensure one unique entry per studentId
  },
  semesters: [semesterSchema] // Array of semester details
}, { timestamps: true });

const Result = mongoose.model('Result', resultSchema);

export default Result;
