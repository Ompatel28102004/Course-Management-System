import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Check, UserPlus, CalendarDaysIcon } from "lucide-react";
import axios from "axios";
import {HOST} from "../../../utils/constants"

const StudentApprovalInbox = () => {
    const [students, setStudents] = useState([]);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('authToken');

    const fetchStudents = async () => {
        try {
            const response = await axios.get(
                `${HOST}/api/faculty/inbox/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log(response.data);
            return response.data.messages;
        } catch (error) {
            console.error("Error fetching student requests:", error);
            throw error;
        }
    };

    useEffect(() => {
        const fetchAndSetStudents = async () => {
            const approvals = await fetchStudents();
            setStudents(approvals);
        };

        fetchAndSetStudents();
    }, []);

    const acceptRequest = async (courseId, studentId, courseObjId) => {
        try {
            const newBody = {student_id : studentId, courseId : courseId, courseRefID : courseObjId};
            console.log(newBody);

            const response = await axios.put(
                `${HOST}/api/faculty/inbox`,
                newBody,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (response.status === 200) {
                window.alert("Student successfully enrolled in the course");
                window.location.reload();
            }
            return response.status;
        } catch (error) {
            window.alert("Fail to enroll student. Please try again!");
            console.error("Error while approval:", error);
            throw error;
            return response.status;
        }
    }

    const fetchData = async (courseId, studentId) => {
        try {
            const response = await axios.get(
                `${HOST}/api/faculty/courseInfo/${courseId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const courseObjId = (response.data._id);
            console.log(response.data._id);
            
            return acceptRequest(courseId, studentId, courseObjId);
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    };

    const handleAccept = async (courseId, studentId) => {
        if (window.confirm("Are you sure to accept this request?")) {
            try {
                //await acceptRequest(courseId, firstName, lastName);

                const status = await fetchData(courseId, studentId);
                if(status && status === 200){
                    setStudents(students.filter((s) => s.student_id !== studentId || s.course_id !== courseId));
                }
            } catch (error) {
                console.error("Failed to accept request", error);
            }
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto">
            <Card className="w-full h-full bg-white shadow-lg rounded-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center">
                                <UserPlus className="mr-3" />
                                Course Enrollment Requests
                            </CardTitle>
                        </div>
                        <div className="bg-white/20 p-2 rounded-full">
                            <span className="text-md font-bold text-white">
                                {students.length}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {students.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <UserPlus className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                            <p>No pending enrollment requests</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {students.map((request) => (
                                <div
                                    key={request._id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            {request.student_first_name} {request.student_last_name} (
                                                {request.student_id})
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <CalendarDaysIcon className="mr-2 h-4 w-4" />
                                            {new Date(request.dateOfRequest).toLocaleDateString("en-GB")}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {request.course_name}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleAccept(request.course_id, request.student_id)}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        <Check className="mr-2 h-4 w-4" />{" "}
                                        Accept
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentApprovalInbox;