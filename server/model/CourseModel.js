import mongoose from 'mongoose';

const courseRosterSchema = new mongoose.Schema(
  {
      day: {
          type: String,
          enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
      time: {
        type: String,
      },
      location: {
        type: String,
      }
  },
  {
    _id: false,
  }
);

// To avoid Scheduling Conflict
// courseRosterSchema.index({ day: 1, time: 1, location: 1 }, { unique: true });

const coursesSchema = new mongoose.Schema({
  courseID: { type: String, required: true },
  courseName: { type: String, required: true },
  department: { type: String, required: true },
  branch: { type: String, required: true },
  courseStartDate: { type: Date, required: true },
  lastModified: { 
    type: Date, 
    default: Date.now, // Automatically set to the current dates
  },
  semester: { type: Number, required: true },
  courseInstructorID: { type: Number, required: true },
  courseInstructorName: { type: String, required: true },
  courseCredit: { type: String, required: true },
  pdfUrl: {type: String},
  courseGuidelines: [
    {
        type: String,
        required: false,
    }
  ],
  courseRoster: [courseRosterSchema],
});

// Pre-save hook to update the lastModified field
coursesSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Create and export the Mongoose model
const Course = mongoose.model('Course', coursesSchema);

export default Course;