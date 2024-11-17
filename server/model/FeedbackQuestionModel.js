import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionID: { type: String, required: true, unique: true }, // Changed to String
  questionText: { type: String, required: true },
  responseType: { type: String, enum: ['rating', 'text'], required: true },
  isActive: { type: Boolean, default: true },
  createdOn: { type: Date, default: Date.now },
});

const Question = mongoose.model('FeedbackQuestion', questionSchema);

export default Question;