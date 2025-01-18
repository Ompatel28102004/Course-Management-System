import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid";

const examSchema = new mongoose.Schema(
    {
        examId: {
            type: String,
            required: true,
            default: uuidv4
        },
        examName: {
            type: String,
            required: true,
        },
        totalMarks: {
            type: Number,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        createdBy: {
            type: String,
            required: true
        },
        examGuidelines: {
            type: String,
            required: true
        },
        questions: [
            {
                questionRefId: { //id -> RefId
                    type: String, // Reference to Question Bank document
                    required: true,
                },
                marks: {
                    type: Number,
                    required: true
                }
            },
        ],
        date: {
            type: Date,
            required: true
        },
        isPublished: {
            type: Boolean,
            required: true,
            default: false
        }
    }, {_id:false ,timestamps: true}
);

const courseExamSchema = new mongoose.Schema(
    {
        courseId:{
            type: String,
            required: true
        },
        exam: [examSchema]
    }
);

const courseExam  = mongoose.model("quizzes", courseExamSchema);

export default courseExam;