import React, { useState, useEffect } from "react";
import axios from "axios";
import {HOST} from "../../../utils/constants"

import {
    Info,
    Users,
    FileText,
    MessageSquare,
    NotebookPen,
} from "lucide-react";
import { CollapsibleButton } from "../CollapsibleButton/Collapsible.jsx";
import { useParams } from "react-router-dom";
/* import { Attendance } from "../Attendance/Attendance.jsx";
import ExamResults from "@/Components/Result.jsx";
import ExamConduction from "@/Components/Test.jsx"; */

// Define course data (you could potentially move this outside the component or fetch it from an API)
/* const courses = [
    {
        id: "CS243001",
        courseName: "Introduction to CS",
        studentsEnrolled: 120,
        lecturesTaken: 15,
        quizzesTaken: 3,
        courseRoster: [
            "Monday : 10:00 AM - 11:30 AM",
            "Wednesday : 2:00 PM - 3:30 PM",
            "Friday : 1:00 PM - 2:30 PM",
        ],
        courseGuidelines: [
            "Attendance is mandatory for all lectures.",
            "Assignments must be submitted on time.",
            "Participation in class discussions is encouraged.",
            "Use of electronic devices during exams is prohibited.",
        ],
    },
    {
        id: "CS22302",
        courseName: "Data Structures and Algorithms",
        studentsEnrolled: 56,
        lecturesTaken: 9,
        quizzesTaken: 6,
        courseRoster: [
            "Monday : 10:00 AM - 11:30 AM",
            "Wednesday : 2:00 PM - 3:30 PM",
            "Friday : 1:00 PM - 2:30 PM",
        ],
        courseGuidelines: [
            "Attendance is mandatory for all lectures.",
            "Assignments must be submitted on time.",
            "Participation in class discussions is encouraged.",
            "Use of electronic devices during exams is prohibited.",
        ],
    },
    {
        id: "CS22303",
        courseName: "Web Dev Fundamentals",
        studentsEnrolled: 80,
        lecturesTaken: 19,
        quizzesTaken: 2,
        courseRoster: [
            "Monday : 10:00 AM - 11:30 AM",
            "Wednesday : 2:00 PM - 3:30 PM",
            "Friday : 1:00 PM - 2:30 PM",
        ],
        courseGuidelines: [
            "Attendance is mandatory for all lectures.",
            "Assignments must be submitted on time.",
            "Participation in class discussions is encouraged.",
            "Use of electronic devices during exams is prohibited.",
        ],
    },
    {
        id: "CS22304",
        courseName: "Database Management System",
        studentsEnrolled: 57,
        lecturesTaken: 7,
        quizzesTaken: 1,
        courseRoster: [
            "Monday : 10:00 AM - 11:30 AM",
            "Wednesday : 2:00 PM - 3:30 PM",
            "Friday : 1:00 PM - 2:30 PM",
        ],
        courseGuidelines: [
            "Attendance is mandatory for all lectures.",
            "Assignments must be submitted on time.",
            "Participation in class discussions is encouraged.",
            "Use of electronic devices during exams is prohibited.",
        ],
    },
    {
        id: "CS22305",
        courseName: "Software Engineering",
        studentsEnrolled: 101,
        lecturesTaken: 25,
        quizzesTaken: 5,
        courseRoster: [
            "Monday : 10:00 AM - 11:30 AM",
            "Wednesday : 2:00 PM - 3:30 PM",
            "Friday : 1:00 PM - 2:30 PM",
        ],
        courseGuidelines: [
            "Attendance is mandatory for all lectures.",
            "Assignments must be submitted on time.",
            "Participation in class discussions is encouraged.",
            "Use of electronic devices during exams is prohibited.",
        ],
    },
    {
        id: "CS22306",
        courseName: "Machine learning",
        studentsEnrolled: 40,
        lecturesTaken: 10,
        quizzesTaken: 0,
        courseRoster: [
            "Monday : 10:00 AM - 11:30 AM",
            "Wednesday : 2:00 PM - 3:30 PM",
            "Friday : 1:00 PM - 2:30 PM",
        ],
        courseGuidelines: [
            "Attendance is mandatory for all lectures.",
            "Assignments must be submitted on time.",
            "Participation in class discussions is encouraged.",
            "Use of electronic devices during exams is prohibited.",
        ],
    },
    // Add more courses here
]; */

export default function CourseInfo() {
    const { courseId } = useParams(); // Use useParams to extract the course id from the URL
    const token = localStorage.getItem('authToken');

    const [allCourses, setAllCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Track loading state

    useEffect(() => {
        const fetchAndSetCourses = async () => {
            const courses = await fetchCourses();
            setAllCourses(courses);
            localStorage.setItem('firstName', courses[0].courseInstructorName);
            setIsLoading(false); // Set loading to false after fetching data
        };

        fetchAndSetCourses();
    }, [courseId]);

    const fetchCourses = async () => {
        try {
            const response = await axios.get(
                `${HOST}/api/faculty/coursesAssigned/${localStorage.getItem("userId")}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching courses:", error);
            return [];
        }
    };

    if (isLoading) {
        return <div>Loading course information...</div>;
    }

    console.log(allCourses);
    const courseInfo = allCourses.find((crs) => crs.courseID == courseId);

    // If the course isn't found, you could handle the error, for now, let's render a fallback
    if (!courseInfo || courseInfo.length === 0) {
        return <div>Course not found!</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F7FF] text-gray-800">
            
            <div className="flex">

                <main className="flex-1 h-full justify-center items-center">
                    <div>
                        <div className="bg-white p-4">
                            <div>
                                <h1 className="text-2xl font-bold underline text-purple-500 mb-3">
                                    Course Info
                                </h1>
                            </div>

                            <div>
                                <div className="grid gap-4">
                                    <p>
                                        <strong>Students Enrolled:</strong>{" "}
                                        52
                                    </p>
                                    <p>
                                        <strong>Lectures Taken:</strong>{" "}
                                        12
                                    </p>
                                    <p>
                                        <strong>Quizzes Taken:</strong>{" "}
                                        2
                                    </p>

                                    <CollapsibleButton
                                        title={"Course Roster"}
                                        content={courseInfo.courseRoster}
                                    />

                                    <CollapsibleButton
                                        title={"Course Guidelines"}
                                        content={
                                            courseInfo.courseGuidelines
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
