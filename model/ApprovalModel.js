import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
    facultyId: Number,
    student_first_name: String,
    student_last_name: String,
    student_id: Number,
    dateOfRequest: { type: Date, default: Date.now },
    course_name: String,
    course_id: String,
});
  
const Approval = mongoose.model('Approval', approvalSchema);

export default Approval;