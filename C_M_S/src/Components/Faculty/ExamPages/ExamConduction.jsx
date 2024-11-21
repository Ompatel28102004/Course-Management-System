import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import {
    FileText,
    Database,
    ListTodo,
    Clock,
    NotebookText,
    CalendarDays,
} from "lucide-react";
import MCQDatabase from "./QuestionBank";
import CreateNewExam from "./CreateNewExam";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HOST } from "../../../utils/constants";

const CreatedExamsList = ({ setActiveView }) => {
    const [exams, setExams] = useState([]);
    const { courseId } = useParams();
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    /* const exams = [
        {
            id: 1,
            title: "Mathematics Final",
            duration: "2 hours",
            participants: 45,
            date: "2024-11-01",
            status: "active",
        },
        {
            id: 2,
            title: "Physics Mid-term",
            duration: "1.5 hours",
            participants: 32,
            date: "2024-11-15",
            status: "upcoming",
        },
        {
            id: 3,
            title: "Chemistry Quiz",
            duration: "45 minutes",
            participants: 28,
            date: "2024-10-30",
            status: "completed",
        },
    ]; */

    useEffect(() => {
        const fetchAllExams = async () => {
            try {
                const response = await axios.get(
                    `${HOST}/api/faculty/examConduction/createExam/${courseId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setExams(response.data.pariksha.exams);
                console.log(response.data.pariksha.exams);
            } catch (error) {
                console.error("Error fetching questions:", error);
            }
        };

        fetchAllExams();
    }, []);

    const startExam = async (examId) => {
        try {
            const examToUpdate = exams.find((exam) => exam.examId === examId);
            if (!examToUpdate) {
                console.error("Exam not found");
                return;
            }
            console.log(examToUpdate);
            const newExam = { ...examToUpdate, isPublished: true };

            const response = await axios.put(
                `${HOST}/api/faculty/examConduction/createExam/${courseId}/${examId}`,
                newExam,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId },
                }
            );

            if (response.status === 200) {
                window.alert("Exam started successfully");
                window.location.reload();
            }
        } catch (error) {
            window.alert("Fail to start exam. Please try again!");
            console.error("Error while updating exam:", error);
            throw error;
        }
    };

    const handleStartExam = async (id) => {
        if (window.confirm("Are you sure you want to start this exam?")) {
            try {
                await startExam(id);
            } catch (error) {
                console.error("Failed to delete question:", error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#5E17EB]">
                    Created Exams List
                </h2>
                <Button
                    className="bg-[#5E17EB] hover:bg-[#4912c9]"
                    onClick={() => setActiveView("createNewExam")}
                >
                    Create New Exam
                </Button>
            </div>

            <div className="grid gap-4">
                {exams &&
                    exams.map((exam) => (
                        <Card
                            key={exam.examId}
                            className="hover:border-[#5E17EB] transition-colors"
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">
                                            {exam.examName}
                                        </h3>
                                        <div className="flex space-x-4 text-gray-600">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {exam.duration} Minutes
                                            </div>
                                            <div className="flex items-center">
                                                <NotebookText className="w-4 h-4 mr-1" />
                                                {exam.totalMarks} Marks
                                            </div>
                                            <div className="flex items-center">
                                                <CalendarDays className="w-4 h-4 mr-1" />
                                                {new Date(
                                                    exam.date
                                                ).toLocaleDateString("en-GB")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!exam.isPublished && (
                                            <Button
                                                variant="outline"
                                                className="border-[#5E17EB] text-white hover:bg-green-800 hover:text-white bg-green-700"
                                                onClick={() => {
                                                    handleStartExam(
                                                        exam.examId
                                                    );
                                                }}
                                            >
                                                Start Exam
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        </div>
    );
};

const ExamConduction = () => {
    const [activeView, setActiveView] = useState("");

    return (
        <div className="m-5 rounded-md">
            <div className="bg-white pt-5 shadow-lg">
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card
                            className={`cursor-pointer hover:border-[#5E17EB] hover:bg-[#dcd4ed] transition-colors ${
                                activeView === "createNewExam"
                                    ? "border-[#5E17EB] bg-[#dcd4ed]"
                                    : ""
                            }`}
                            onClick={() => setActiveView("createNewExam")}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <FileText className="w-12 h-12 text-[#5E17EB] mb-2" />
                                <h3 className="font-semibold text-lg">
                                    Create New Exam
                                </h3>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer hover:border-[#5E17EB] transition-colors ${
                                activeView === "pyq" ? "bg-[#dcd4ed]" : ""
                            } hover:bg-[#dcd4ed]`}
                            onClick={() => setActiveView("pyq")}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <Database className="w-12 h-12 text-[#5E17EB] mb-2" />
                                <h3 className="font-semibold text-lg">
                                    PYQ Database
                                </h3>
                            </CardContent>
                        </Card>

                        <Card
                            className={`cursor-pointer transition-colors ${
                                activeView === "createdExams"
                                    ? "bg-[#dcd4ed]"
                                    : ""
                            } hover:bg-[#dcd4ed]`}
                            onClick={() => setActiveView("createdExams")}
                        >
                            <CardContent className="flex flex-col items-center justify-center p-6">
                                <ListTodo className="w-12 h-12 text-[#5E17EB] mb-2" />
                                <h3 className="font-semibold text-lg">
                                    Created Exams
                                </h3>
                            </CardContent>
                        </Card>
                    </div>

                    {activeView === "createNewExam" && <CreateNewExam />}

                    {activeView === "pyq" && <MCQDatabase />}

                    {activeView === "createdExams" && (
                        <CreatedExamsList setActiveView={setActiveView} />
                    )}
                </CardContent>
            </div>
        </div>
    );
};

export default ExamConduction;
