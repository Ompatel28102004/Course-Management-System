import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  semesterId: {
    type: String,
    required: true,
    unique: true
  },
  semester: {
    type: Number,
    required: true,
  },
  branch: {
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
    required: true,
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
  }
}, {
  _id: false // This will prevent Mongoose from creating an _id for subdocuments
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