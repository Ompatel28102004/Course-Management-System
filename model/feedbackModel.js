import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  feedbackID: { type: String, required: true },
  feedbackName: { type: String, required: true },
  courseID: { type: String, required: true },
  courseName: { type: String, required: true },
  departmentID: { type: String, required: true },
  branch: { type: String, required: true },
  facultyID: { type: String, required: true },
  facultyName: { type: String, required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  questions: [{
    questionID: { type: String, required: true }, // Changed to String
  }],
  responses: [{
    studentID: { type: String, required: true },
    answers: [{
      questionID: { type: String, required: true }, // Changed to String
      response: { type: mongoose.Schema.Types.Mixed, required: true }
    }]
  }],
  submittedOn: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
});

// Pre-save hook remains unchanged

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;