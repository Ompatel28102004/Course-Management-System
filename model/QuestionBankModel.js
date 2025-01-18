import mongoose from "mongoose";
import {v4 as uuidv4} from "uuid";

const questionBankSchema = new mongoose.Schema(
    {
        courseId: {
            type: String,
            required: true,
        },
        Bank: [
            {
                questionId: {
                    type: String,
                    required: true,
                    default: uuidv4
                },
                questionText: {
                    type: String,
                    required: true
                },
                options: [
                    {
                        text: {
                            type: String,
                            required: true
                        },
                        isCorrect: {            //Using this to facilitate the multiple correct answer
                            type: Boolean,
                            required: true
                        }
                    }
                ],
                marks: {
                    type: Number,
                    required: true
                },
                tag: {
                    type: String,
                    required: true
                },
                year: {
                    type: Number,
                    required: true
                },
                createdBy: {
                    type: String,
                    required: true
                }   
            },
        ] 
    }, {timestamps: true}
);

const questionBank = mongoose.model("questionbanks", questionBankSchema);

export default questionBank;