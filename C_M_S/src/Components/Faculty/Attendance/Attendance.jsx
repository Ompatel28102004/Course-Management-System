import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HOST } from "../../../utils/constants";

export const Attendance = () => {
    const [students, setStudents] = useState([]);
    const today = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [attendanceType, setAttendanceType] = useState("Lecture");
    const [allAttendanceData, setAllAttendanceData] = useState([]);
    const { courseId } = useParams();
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchStudentsByDate = async (courseObjId) => {
            try {
                console.log(selectedDate);
                
                const response = await axios.get(
                    `${HOST}/api/faculty/attendance/${courseObjId}/${selectedDate}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log("Using Date : ",response.data);

                setAllAttendanceData(response.data.attendanceStudents.dates);
                // Filter records for the selected attendanceType
                const attendanceForType = response.data.attendanceStudents.dates.find(
                    record => record.attendanceType === attendanceType
                );

                if (!attendanceForType) {
                    return; // Exit if no matching records are found
                }

                // Map through the current students and update attendanceStatus
                const updatedStudents = students.map(student => {
                    const record = attendanceForType.attendanceRecords.find(
                        r => r.studentID === student.studentId
                    );

                    return {
                        ...student,
                        attendanceStatus: record ? record.status : "",
                    };
                });

                setStudents(updatedStudents); // Update the students state
                
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }
        }

        const fetchStudents = async (courseObjId) => {
            try {
                console.log(selectedDate);
                
                const response = await axios.get(
                    `${HOST}/api/faculty/attendance/${courseObjId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                console.log("Reg Students",response.data);

                const studentsWithStatus = response.data.map(student => ({
                    ...student,
                    attendanceStatus: "", // Add the new field
                }));

                setStudents(studentsWithStatus);

                fetchStudentsByDate(courseObjId);
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }
        }

        const fetchData = async () => {
            try {
                
                const response = await axios.get(
                    `${HOST}/api/faculty/courseInfo/${courseId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const courseObjId = (response.data._id);
                console.log(response.data._id);
                
                fetchStudents(courseObjId);
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }
        };
    
        fetchData();
    }, [courseId, selectedDate]);

    const handleAttendanceChange = (id, status) => {
        setStudents((prevStudents) =>
            prevStudents.map((student) =>
                student.studentId === id
                    ? { ...student, attendanceStatus: status }
                    : student
            )
        );
    };

    const handleAttendanceTypeChange = async (changedAttendanceType) => {

        // Filter the attendance records for the selected attendanceType
        const attendanceForType = allAttendanceData.find(
            record => record.attendanceType === changedAttendanceType
        );

        if (!attendanceForType) {
            setStudents(students.map(student => ({ ...student, attendanceStatus: "" })));
            return;
        }

        // Update the students array with the attendanceStatus for the selected type
        const updatedStudents = students.map(student => {
            const record = attendanceForType.attendanceRecords.find(
                r => r.studentID === student.studentId
            );

            return {
                ...student,
                attendanceStatus: record ? record.status : "", // Set status or leave empty
            };
        });

        setStudents(updatedStudents); // Update state with modified students array
    };

    const handleSubmit = async () => {
    
        const postAttendance = async (courseObjId) => {
            const finalStudentArray = students.map(student => ({
                studentID: student.studentId,
                status: student.attendanceStatus
            }));
        
            const outputBody = {
                finalStudentArray, attendanceType
            };
            console.log("Output : ", outputBody);
            try {
                // Make the API call to submit attendance
                await axios.post(`${HOST}/api/faculty/attendance/${courseObjId}`, outputBody, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { userId },
                });

                alert("Attendance submitted successfully!");
            } catch (error) {
                console.error("Error submitting attendance:", error);
                alert("Failed to submit attendance. Please try again.");
                throw error;
            }
        }

        const fetchData = async () => {
            try {
                
                const response = await axios.get(
                    `${HOST}/api/faculty/courseInfo/${courseId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const courseObjId = (response.data._id);
                console.log(response.data._id);
                
                postAttendance(courseObjId);
            } catch (error) {
                console.error("Error fetching data:", error);
                throw error;
            }
        };

        const today = new Date().toISOString().split("T")[0];

        if(today !== selectedDate){
            window.alert("You can only submit today's attendance");
            return;
        }

        if(window.confirm("Do you want submit attendance?")){
            fetchData();
        }
    };

    return (
        <div className="flex flex-col">
            <main className="flex-1 m-10 shadow-lg">
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="mb-6 flex flex-row items-center justify-center">
                        <label
                            htmlFor="date"
                            className="block text-lg pr-2 font-large text-gray-700"
                        >
                            Select Date :
                        </label>
                        <div className="relative text-lg border-2">
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={(e) => {
                                    e.target.value <= today &&
                                        setSelectedDate(e.target.value);
                                }}
                                className="block w-full px-3 py-2 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            />
                        </div>

                        <label
                            htmlFor="attendanceType"
                            className="ml-5 font-md text-lg"
                        >
                            Attendance For :
                        </label>
                        <select
                            id="attendanceType"
                            value={attendanceType}
                            onChange={(e) => {
                                setAttendanceType(e.target.value)
                                handleAttendanceTypeChange(e.target.value);
                            }}
                            className="border rounded-md mx-2 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option
                                key="lecture"
                                value="Lecture"
                                className="text-gray-800"
                            >
                                Lecture
                            </option>
                            <option
                                key="lab"
                                value="Lab"
                                className="text-gray-800"
                            >
                                Lab
                            </option>
                            <option
                                key="tutorial"
                                value="Tutorial"
                                className="text-gray-800"
                            >
                                Tutorial
                            </option>
                        </select>
                    </div>

                    <div className="overflow-hidden bg-white shadow sm:rounded-md">
                        <ul role="list" className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <li key={student.studentId}>
                                    <div className="flex items-center px-4 py-4 sm:px-6">
                                        <div className="min-w-0 flex-1 flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <span className="text-indigo-800 font-semibold text-lg">
                                                        {student.firstName.charAt(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                                        {student.firstName} {student.lastName} ({student.studentId})
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                className={`border rounded-full h-10 w-10 ${
                                                    student.attendanceStatus ==
                                                    "Present"
                                                        ? "bg-green-600 text-white"
                                                        : "bg-gray-300"
                                                }`}
                                                onClick={() =>
                                                    handleAttendanceChange(
                                                        student.studentId,
                                                        "Present"
                                                    )
                                                }
                                            >
                                                P
                                            </button>
                                            <button
                                                className={`border rounded-full h-10 w-10 ${
                                                    student.attendanceStatus ==
                                                    "Leave"
                                                        ? "bg-yellow-400"
                                                        : "bg-gray-300"
                                                }`}
                                                onClick={() =>
                                                    handleAttendanceChange(
                                                        student.studentId,
                                                        "Leave"
                                                    )
                                                }
                                            >
                                                L
                                            </button>
                                            <button
                                                className={`border rounded-full h-10 w-10 ${
                                                    student.attendanceStatus ==
                                                    "Absent"
                                                        ? "bg-red-700 text-white"
                                                        : "bg-gray-300"
                                                }`}
                                                onClick={() =>
                                                    handleAttendanceChange(
                                                        student.studentId,
                                                        "Absent"
                                                    )
                                                }
                                            >
                                                A
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        type="submit"
                        onClick={() => handleSubmit()}
                    >
                        Submit Attendance
                    </button>
                </div>
            </main>
        </div>
    );
};
