import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  courseRefID: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Course document
    required: true,
    ref: 'courses',
  },
  totalLectures: {
    type: Number,
    default: 0,
  },
  lecturesTaken: {
    type: Number,
    default: 0,
  },
  enrolledStudents: [
    {
      studentID: {
        type: Number,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      enroll_req_accepted: {
        type: Boolean,
        default: false,
      },
      lecturesAttended: {
        type: Number,
        default: 0,
      },
      lastLecAttended: {
        type: Date,
        default: null,
      },
    },
  ],
  dates: [
    {
      date: {
        type: Date,
        required: true,
      },
      attendanceType: { 
        type: String, 
        enum: ['lecture', 'lab', 'tutorial'], 
        required: true, 
      },
      attendanceRecords: [
        {
          studentID: {
            type: Number,
            required: true,
          },
          status: {
            type: String,
            enum: ['present', 'absent', 'leave'],
            required: true,
          },
        },
      ],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Adjusted indexes for optimizing faculty and student queries
AttendanceSchema.index({ courseID: 1 });  // Optimizes queries by course
AttendanceSchema.index({ 'enrolledStudents.studentID': 1 }); // Individual student lookup
AttendanceSchema.index({ 'dates.date': 1, 'dates.attendanceRecords.studentID': 1 }); // Date-based attendance for each student

const Attendance = new mongoose.model("attendances", AttendanceSchema);

export default Attendance;
