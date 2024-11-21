import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
        courseId: {
            type: String,
            required: true
        },
        parinam: [
            {
                examId: {
                    type: String, // keep it string only
                    required: true
                },
                examName: {
                    type: String,
                    required: true
                },
                date: {
                    type: Date,
                    required: true
                },
                results: [
                    {
                        studentId: {
                            type: Number,
                            required: true
                        },
                        studentName: {
                            type: String,
                        },
                        marks: {
                            type: Number,
                            required: true
                        },
                        remarks: {
                            type: String,
                            default: ''
                        }
                    }
                ]
            }
        ]
    },{timestamps: true}
);

const result = mongoose.model("quizmarks", resultSchema);

export default result;



