import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import Profile from "../Faculty/Profile";
import Setting from "../Faculty/Setting";
import { Attendance } from "../Faculty/Attendance/Attendance";
import CourseInfo from "../Faculty/CourseInfo/CourseInfo";
import ExamConduction from "../Faculty/ExamPages/ExamConduction";
import ExamResults from "../Faculty/ExamPages/Result";
import axios from "axios";
import { HOST } from "../../utils/constants";
import StudentApprovalInbox from "../Faculty/StudentApproval/studentApproval";
import ChatRoom from '../Community/ChatRoom.jsx';

const Faculty = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        const fetchAndSetCourses = async () => {
            const allCourses = await fetchCourses(); // Wait for the fetch to complete
            setCourses(allCourses); // Update the state with the resolved data
        };

        fetchAndSetCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await axios.get(
                `${HOST}/api/faculty/coursesAssigned/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            return response.data;

        } catch (error) {
            console.error("Error fetching courses:", error);
            return [];
        }
    };

    const handleCourseChange = (e) => {
        const newCourseId = e.target.value;
        localStorage.setItem("currentCourse", newCourseId);

        let currentPage = localStorage.getItem("currentPage");
        if (currentPage === "Course Info") currentPage = "course-info";
        if (currentPage === "Attendance") currentPage = "attendance";
        if (currentPage === "Exam Conduction") currentPage = "exam-conduction";
        if (currentPage === "Results") currentPage = "results";
        if (currentPage === "Inbox") currentPage = "inbox";

        navigate(`courses/${currentPage}/${newCourseId}`);
    };

    return (
        <div>
            {localStorage.getItem('currentPage') !== 'Inbox' && <div className="flex items-center mb-4">
                <label
                    htmlFor="course"
                    className="mr-4 font-bold text-2xl text-purple-600"
                >
                    Select Course:
                </label>
                <select
                    id="course"
                    value={localStorage.getItem("currentCourse") || ""}
                    onChange={handleCourseChange}
                    className="border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    {courses.map((course) => (
                        <option
                            key={course.courseID}
                            value={course.courseID}
                            className="text-gray-800"
                        >
                            {course.courseName} ({course.courseID})
                        </option>
                    ))}
                </select>
            </div>}

            <Routes>
                <Route
                    path="/courses/course-info/:courseId"
                    element={<CourseInfo />}
                />
                <Route
                    path="/courses/attendance/:courseId"
                    element={<Attendance />}
                />
                <Route
                    path="/courses/exam-conduction/:courseId"
                    element={<ExamConduction />}
                />
                <Route
                    path="/courses/results/:courseId"
                    element={<ExamResults />}
                />
                <Route
                    path="/courses/inbox/:courseId"
                    element={<StudentApprovalInbox />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
                <Route
                    path="/settings"
                    element={<Setting />}
                />
          <Route path="/Community" element={<ChatRoom />} />

            </Routes>
        </div>
    );
};

export default Faculty;
