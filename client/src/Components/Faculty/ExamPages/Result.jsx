import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {HOST} from "../../../utils/constants"

const ExamResults = () => {
    const [selectedExam, setSelectedExam] = useState(null);
    const [exams, setExams] = useState([]);
    const { courseId } = useParams();
    const token = localStorage.getItem('authToken');

    // Sample data - replace with your actual data
    /* const exams = [
        {
            id: 1,
            name: "Midterm Examination",
            date: "2024-03-15",
            students: [
                { id: 1, name: "John Doe", marks: 85 },
                { id: 2, name: "Jane Smith", marks: 92 },
                { id: 3, name: "Mike Johnson", marks: 78 },
                { id: 4, name: "Emma Brown", marks: 95 },
                { id: 5, name: "Olivia Davis", marks: 88 },
                { id: 6, name: "Liam Wilson", marks: 90 },
            ],
        },
        {
            id: 2,
            name: "Final Examination",
            date: "2024-04-20",
            students: [
                { id: 1, name: "John Doe", marks: 88 },
                { id: 2, name: "Jane Smith", marks: 95 },
                { id: 3, name: "Mike Johnson", marks: 82 },
                { id: 4, name: "Emma Brown", marks: 80 },
                { id: 5, name: "Olivia Davis", marks: 92 },
                { id: 6, name: "Liam Wilson", marks: 94 },
            ],
        },
        {
            id: 3,
            name: "Quiz 1",
            date: "2024-02-10",
            students: [
                { id: 1, name: "John Doe", marks: 90 },
                { id: 2, name: "Jane Smith", marks: 88 },
                { id: 3, name: "Mike Johnson", marks: 85 },
                { id: 4, name: "Emma Brown", marks: 93 },
                { id: 5, name: "Olivia Davis", marks: 91 },
                { id: 6, name: "Liam Wilson", marks: 87 },
            ],
        },
    ]; */

    const fetchExams = async () => {
        try {
            const response = await axios.get(
                `${HOST}/api/faculty/result/${courseId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log(response.data.parinam.parinam);
            return response.data.parinam.parinam;
        } catch (error) {
            console.error("Error fetching course results:", error);
            return [];
        }
    };

    useEffect(() => {
        const fetchAndSetExam = async () => {
            const exam = await fetchExams();
            setExams(exam);
        };

        fetchAndSetExam();
    }, [courseId]);

    return (
        <div className="m-5 rounded-md">
            <Card className="bg-white border-[#5E17EB] pt-4 shadow-lg">
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Exams List */}
                        <Card className="border-2 border-[#D3A4F9]">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-[#5E17EB]">
                                    Available Exams
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {exams.length === 0 ? 
                                    (<div>
                                        No exam result found!
                                    </div>)
                                     : (exams.map((exam) => (
                                        <button
                                            key={exam.examId}
                                            onClick={() =>
                                                setSelectedExam(exam)
                                            }
                                            className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border
                        ${
                            selectedExam?.examId === exam.examId
                                ? "border-[#5E17EB] bg-purple-50 text-[#5E17EB]"
                                : "border-[#D3A4F9] hover:border-[#5E17EB]"
                        }`}
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {exam.examName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Date:{" "}
                                                    {new Date(
                                                        exam.date
                                                    ).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    )))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results Display */}
                        <Card className="border-2 border-[#D3A4F9]">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold text-[#5E17EB]">
                                    {selectedExam
                                        ? selectedExam.examName + " Results"
                                        : "Select an Exam"}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedExam ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-500 mb-4">
                                            Exam Date:{" "}
                                            {new Date(
                                                selectedExam.date
                                            ).toLocaleDateString()}
                                        </div>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-[#D3A4F9]">
                                                    <th className="text-left py-2 text-[#5E17EB]">
                                                        Student ID
                                                    </th>
                                                    <th className="text-right py-2 text-[#5E17EB]">
                                                        Marks
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedExam.results.map(
                                                    (student) => (
                                                        <tr
                                                            key={student.id}
                                                            className="border-b border-[#D3A4F9]"
                                                        >
                                                            <td className="py-2">
                                                                {student.studentId}
                                                            </td>
                                                            <td className="text-right py-2">
                                                                <span
                                                                    className={`px-2 py-1 rounded border ${
                                                                        student.marks >=
                                                                        90
                                                                            ? "border-[#5E17EB] bg-purple-50 text-[#5E17EB]"
                                                                            : student.marks >=
                                                                              80
                                                                            ? "border-[#D3A4F9] bg-purple-50 text-[#5E17EB]"
                                                                            : "border-[#D3A4F9] text-[#5E17EB]"
                                                                    }`}
                                                                >
                                                                    {
                                                                        student.marks
                                                                    }
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="text-sm text-gray-500 mt-4">
                                            Average Score:{" "}
                                            {(
                                                selectedExam.results.reduce(
                                                    (acc, student) =>
                                                        acc + student.marks,
                                                    0
                                                ) / selectedExam.results.length
                                            ).toFixed(1)}
                                        </div>

                                        {/* Top 5 Students Section */}
                                        <div className="mt-4">
                                            <h3 className="text-lg font-bold text-[#5E17EB]">
                                                Top 5 Students
                                            </h3>
                                            <table className="w-full mt-2">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left py-2 text-[#5E17EB] border-b-2 border-[#5E17EB]">
                                                            Student ID
                                                        </th>{" "}
                                                        {/* Added border-b-2 here for the underline */}
                                                        <th className="text-right py-2 text-[#5E17EB]">
                                                            Marks
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedExam.results
                                                        .slice()
                                                        .sort(
                                                            (a, b) =>
                                                                b.marks -
                                                                a.marks
                                                        ) // Sort in descending order
                                                        .slice(0, 5) // Get top 5
                                                        .map((student) => (
                                                            <tr
                                                                key={student.id}
                                                            >
                                                                <td className="py-2">
                                                                    {
                                                                        student.studentId
                                                                    }
                                                                </td>{" "}
                                                                {/* Removed border and underline here */}
                                                                <td className="text-right py-2">
                                                                    <span
                                                                        className={`px-2 py-1 rounded border ${
                                                                            student.marks >=
                                                                            90
                                                                                ? "border-[#5E17EB] bg-purple-50 text-[#5E17EB]"
                                                                                : student.marks >=
                                                                                  80
                                                                                ? "border-[#D3A4F9] bg-purple-50 text-[#5E17EB]"
                                                                                : "border-[#D3A4F9] text-[#5E17EB]"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            student.marks
                                                                        }
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        Please select an exam from the list to
                                        view results
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExamResults;
