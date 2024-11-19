import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'pending', 'overdue', 'waived'],
    default: 'unpaid',
  },
  remarks: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
  },
  paidAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lateFee: {
    type: Number,
    default: 0,
  },
  transactionId: {
    type: String,
    default: null,
  },
  invoiceId: {
    type: String,
    default: null,
  }
});

const feeSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    required: true,
    unique: true,
  },
  semesters: [semesterSchema],
});

const Fee = mongoose.model('Fee', feeSchema);

export default Fee;