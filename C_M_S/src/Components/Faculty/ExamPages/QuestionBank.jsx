import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Pencil, Trash2, Plus, Search, Check } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../ui/dialog";
import { useParams } from "react-router-dom";
import axios from "axios";
import {HOST} from "../../../utils/constants"

const MCQDatabase = () => {
    /* const [questions, setQuestions] = useState([
        {
            id: 1,
            question:
                "Which scheduling algorithm has the shortest waiting time?",
            options: ["FCFS", "SJF", "Round Robin", "Priority"],
            correctAnswer: "SJF",
            marks: 2,
            year: 2023,
            unit: "CPU Scheduling",
        },
        {
            id: 2,
            question:
                "What is the maximum number of page faults possible in LRU with 3 frames and 4 distinct page references?",
            options: ["3", "4", "7", "12"],
            correctAnswer: "4",
            marks: 2,
            year: 2023,
            unit: "Memory Management",
        },
    ]); */

    const { courseId } = useParams();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        const fetchAndSetQuestion = async () => {
            const question = await fetchQuestions();
            setQuestions(question);
        };

        fetchAndSetQuestion();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(
                `${HOST}/api/faculty/examConduction/questionBank/${courseId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log(response.data.questions);
            return response.data.questions;
        } catch (error) {
            console.error("Error fetching courses:", error);
            return [];
        }
    };
    const [searchTerm, setSearchTerm] = useState("");
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        questionText: "",
        options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
        ],
        marks: 2,
        tag: "",
        year: new Date().getFullYear(),
    });

    const deleteQuestion = async (qid) => {
        try {
            const response = await axios.delete(
                `${HOST}/api/faculty/examConduction/questionBank/${courseId}/${qid}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error while deleting question:", error);
            return [];
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                await deleteQuestion(id);
                setQuestions(questions.filter((q) => q.questionId !== id));
                console.log("Question deleted successfully.");
            } catch (error) {
                console.error("Failed to delete question:", error);
            }
        }
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const courseInstructorName = await fetchCourseInstructorName();
        const newQuestion = {
            questionText: formData.questionText,
            options: formData.options,
            marks: formData.marks,
            tag: formData.tag,
            year: formData.year,
            createdBy: courseInstructorName,
        };

        try {
            // Replace this with your API call to save the question
            await axios.post(`${HOST}/api/faculty/examConduction/questionBank/${courseId}`, newQuestion, {
              headers: { Authorization: `Bearer ${token}` },
              params: { userId },
            });
        
            setQuestions([...questions, newQuestion]);
            setIsFormOpen(false);
            setFormData({
                questionText: "",
                options: [
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                    { text: "", isCorrect: false },
                ],
                marks: 2,
                tag: "",
                year: new Date().getFullYear(),
            });
          } catch (error) {
            console.error("Error while adding question:", error);
            throw error;
          }
    };

    const handleCorrectAnswerChange = (index) => {
        const newOptions = formData.options.map((option, idx) => ({
            ...option,
            isCorrect: idx === index,
        }));
        setFormData({ ...formData, options: newOptions });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index].text = value;
        setFormData({ ...formData, options: newOptions });
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">
                        MCQ Question Bank
                    </CardTitle>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsFormOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New MCQ
                    </Button>
                </CardHeader>
                <CardContent>
                    {questions.length > 0 ? 
                        (<div className="space-y-4">
                        {questions.map((question) => (
                            <Card key={question.questionId} className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                                {question.year}
                                            </span>
                                            <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                                {question.marks} Marks
                                            </span>
                                            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                                                {question.tag}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mb-2 font-medium">
                                            {question.questionText}
                                        </p>
                                        <div className="ml-4 space-y-2">
                                            {question.options.map(
                                                (option, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex items-center gap-1 ${
                                                            option.isCorrect
                                                                ? "text-green-600 font-bold"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        <span
                                                            className={`${
                                                                !option.isCorrect &&
                                                                "ml-6"
                                                            }`}
                                                        >
                                                            {String.fromCharCode(
                                                                65 + index
                                                            )}
                                                            . {option.text}
                                                        </span>
                                                        {option.isCorrect && (
                                                            <Check className="h-4 w-4 mr-2 text-green-600" />
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-700"
                                            onClick={() =>
                                                handleDelete(question.questionId)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>)
                    :(
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-lg font-medium">
                                No MCQs found. Start by adding a new question!
                            </p>
                            <Button
                                className="mt-4 bg-blue-600 hover:bg-blue-700"
                                onClick={() => setIsFormOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New MCQ
                            </Button>
                        </div>
                    )}
                    
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New MCQ Question</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Question
                            </label>
                            <textarea
                                className="w-full p-2 border rounded-md"
                                rows="3"
                                value={formData.questionText}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        questionText: e.target.value,
                                    })
                                }
                                placeholder="Enter your question here..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Options
                            </label>
                            <div className="space-y-2">
                                {formData.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <div className="w-8">
                                            <input
                                                type="radio"
                                                name="correctAnswer"
                                                checked={formData.options[index].isCorrect}
                                                onChange={() => handleCorrectAnswerChange(index)}
                                                className="mr-2"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full p-2 border rounded-md"
                                            value={option.text}
                                            onChange={(e) =>
                                                handleOptionChange(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            placeholder={`Option ${String.fromCharCode(
                                                65 + index
                                            )}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Select the radio button next to the correct
                                answer
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Marks
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.marks}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            marks: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Topic Tag
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.tag}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            tag: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., CPU Scheduling"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-md"
                                    value={formData.year}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            year: e.target.value,
                                        })
                                    }
                                    min="2000"
                                    max="2099"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsFormOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={!formData.options.some(option => option.isCorrect)}
                            >
                                Add Question
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MCQDatabase;
