import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../../ui/dialog";
import { Database, TimerIcon, AlertCircle, Check } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {HOST} from "../../../utils/constants"

const CreateNewExam = () => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const { courseId } = useParams();
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    const [allQuestions, setAllQuestions] = useState([]);

    const [formData, setFormData] = useState({
        examName : "",
        totalMarks : "",
        duration : "",
        createdBy : "",
        examGuidelines : "",
        questions : [],
        isPublished: false,
    });

    useEffect(() => {
        const fetchAllQuestions = async () => {
            try {
                const response = await axios.get(`${HOST}/api/faculty/examConduction/questionBank/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Assuming the API returns an array of questions in response.data
                setAllQuestions(response.data.questions);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };

        fetchAllQuestions();
    }, []);

    const addQuestion = (question) => {
        // Check if the question is already added
        if (selectedQuestions.find((que) => que.questionId === question.questionId)) {
            setFeedbackMessage("This question is already added!");
            setTimeout(() => setFeedbackMessage(""), 3000); 
            return;
        }
    
        // Add the question to the selected list
        setSelectedQuestions([...selectedQuestions, question]);
    
        // Show success message
        setFeedbackMessage("Question added successfully!");
        setTimeout(() => setFeedbackMessage(""), 3000);
    };

    const removeQuestion = (questionId) => {
        setSelectedQuestions(
            selectedQuestions.filter((q) => q.questionId !== questionId)
        );
    };

    const fetchCourseInstructorName = async () => {
        try {
            const response = await axios.get(`${HOST}/api/faculty/courseInfo/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data.courseInstructorName;
        } catch (error) {
            console.error("Error fetching course instructor name:", error);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const courseInstructorName = await fetchCourseInstructorName();
        
        const questionsWithRefs = selectedQuestions.map((question) => ({
            questionRefId: question.questionId,
            marks: question.marks,
        }));

        const newExam = {
            examName: formData.examName,
            totalMarks: formData.totalMarks,
            duration: formData.duration,
            createdBy: courseInstructorName,
            examGuidelines: formData.examGuidelines,
            questions: questionsWithRefs,
            isPublished: false,
            date : new Date()
        };

        try {
            await axios.post(`${HOST}/api/faculty/examConduction/createExam/${courseId}`, newExam, {
              headers: { Authorization: `Bearer ${token}` },
              params: { userId },
            });
            
            setFormData({
                examName : "",
                totalMarks : "",
                duration : "",
                createdBy : "",
                examGuidelines : "",
                questions : [],
                isPublished: false
            });
            setSelectedQuestions([]);

            // Notify user of success (optional)
            alert("Exam created successfully!");
          } catch (error) {
            console.error("Error while Saving the exam:", error);
            alert("Failed to create the exam. Please try again.");
            throw error;
          }
    }

    return (
        <div className="space-y-6">
            {/* Basic Exam Details */}
            <Card className="border-[#5E17EB]">
                <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-[#5E17EB] mb-6">
                        Create New Exam
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Exam Name
                            </label>
                            <Input
                                type="text"
                                placeholder="Enter exam name"
                                className="border-[#5E17EB] focus:ring-[#5E17EB]"
                                value={formData.examName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        examName: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Total Marks
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Enter total marks"
                                        className="border-[#5E17EB] focus:ring-[#5E17EB]"
                                        value={formData.totalMarks}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                totalMarks: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Duration (minutes)
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Enter duration"
                                        className="border-[#5E17EB] focus:ring-[#5E17EB]"
                                        value={formData.duration}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                duration: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    <TimerIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Exam Guidelines
                            </label>
                            <Textarea
                                placeholder="Enter exam guidelines and instructions"
                                className="border-[#5E17EB] focus:ring-[#5E17EB] min-h-[100px]"
                                value={formData.examGuidelines}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        examGuidelines: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions Section */}
            <Card className="border-[#5E17EB]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">
                            Exam Questions
                        </h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-[#5E17EB] hover:bg-[#4912c9]">
                                    <Database className="w-4 h-4 mr-2" />
                                    Choose from PYQ Database
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Previous Year Questions
                                    </DialogTitle>
                                    <div>
                                        {feedbackMessage && (
                                            <div
                                                className={`p-2 mt-2 rounded ${
                                                    feedbackMessage.includes("success")
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {feedbackMessage}
                                            </div>
                                        )}
                                    </div>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {allQuestions ? (allQuestions.map((pyq) => (
                                        <Card
                                            key={pyq.questionId}
                                            className="mb-4 hover:border-[#5E17EB] transition-colors"
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">
                                                            {pyq.questionText}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-sm font-medium">
                                                            {pyq.marks} marks
                                                        </span>
                                                        <Button
                                                            onClick={() =>
                                                                addQuestion(pyq)
                                                            }
                                                            className="bg-[#5E17EB] hover:bg-[#4912c9]"
                                                        >
                                                            Add Question
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))) : (
                                        <div>
                                            No Questions Found!
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Selected Questions */}
                    <div className="space-y-4">
                        {selectedQuestions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Database className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>
                                    No questions added yet. Choose questions
                                    from the PYQ database.
                                </p>
                            </div>
                        ) : (
                            selectedQuestions.map((question, index) => (
                                <Card
                                    key={question.questionId}
                                    className="border-gray-200"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center">
                                                    <span className="font-medium mr-2">
                                                        Q{index + 1}.   
                                                    </span>
                                                    <p className="font-medium">
                                                        {question.questionText}
                                                    </p>
                                                </div>

                                                {/* Options */}
                                                <div className="mt-2 space-y-1 pl-6">
                                                    {question.options.map((option, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <span
                                                                className={`${
                                                                    option.isCorrect
                                                                        ? "text-green-600 font-semibold"
                                                                        : "text-gray-600"
                                                                }`}
                                                            >
                                                                {String.fromCharCode(65 + idx)}.
                                                            </span>
                                                            <p>{option.text}</p>

                                                            {option.isCorrect && (
                                                            <Check className="h-4 w-4 mr-2 text-green-600" />
                                                        )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm font-medium">
                                                    {question.marks} marks
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        removeQuestion(
                                                            question.questionId
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {selectedQuestions.length !== 0 && (<div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    className="bg-[#5E17EB] hover:bg-[#4912c9] text-white"
                    onClick = {async (e) => {
                        await handleSubmit(e);
                    }}
                >
                    Save Exam
                </Button>
            </div>)}

            {/* Warning for no questions */}
            {selectedQuestions.length === 0 && (
                <div className="flex items-center text-yellow-600 bg-yellow-50 p-4 rounded-md">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <p>
                        Please add at least one question to save your exam.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreateNewExam;
