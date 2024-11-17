import mongoose from 'mongoose';

const studentSubmissionSchema = new mongoose.Schema({
    studentId: {        // Changed to Number to use enrollment
        type: Number, 
        //ref: 'students', 
        required: true 
    }, 
    submissionDate: { 
        type: Date, 
        required: true 
    },
    attachmentUrlStudent: { 
        type: String, 
        required: true 
    },
    isLate: { 
        type: Boolean, 
        required: true 
    },
    score: { 
        type: Number, 
        default: null 
    },
    feedback: { 
        type: String, 
        default: '' 
    },
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
    courseId: { 
        type: String, 
        required: true 
    },
    assignments: [
        {
            title: { 
                type: String, 
                required: true 
            },
            description: { 
                type: String, 
                required: true 
            },
            dueDate: { 
                type: Date, 
                required: true 
            },
            createdAt: { 
                type: Date, 
                default: Date.now 
            },
            updatedAt: { 
                type: Date, 
                default: Date.now 
            },
            facultyId: { 
                type: Number, 
                required: false 
            },
            attachmentUrlFaculty: { 
                type: String, 
                required: true 
            },
            maxScore: { 
                type: Number, 
                required: true 
            },
            submissions: [studentSubmissionSchema]
        }
    ]
}, { timestamps: true });

assignmentSchema.index({ courseId: 1, dueDate: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;