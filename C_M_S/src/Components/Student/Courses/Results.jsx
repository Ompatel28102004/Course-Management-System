import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HOST } from "../../../utils/constants";
import LoadingAnimation from '../../Loading/loadingAnimation';

export default function StudentResults() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feesData, setFeesData] = useState([]);
  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem('authToken');
      const studentId = localStorage.getItem('userId');
  
      if (!studentId) {
        setError('Student ID not found. Please log in again.');
        setLoading(false);
        return;
      }
  
      try {
        const feesResponse = await axios.get(`${HOST}/api/student/fees?userId=${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setFeesData(feesResponse.data);
        
        // Check if any fee is overdue
        const overdueExists = feesResponse.data.some(fee => fee.status === 'overdue');
  
        if (!overdueExists) {
          const response = await axios.get(`${HOST}/api/student/results?studentId=${studentId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSemesters(response.data || []); // Ensure it sets to an array
        } else {
          setError("You need to pay the fees to view the results.");
          setSemesters([]); // Set to empty array
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching results.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchResults();
  }, []);
  

  if (loading) return <div className="text-center py-8"><LoadingAnimation/></div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  
  return (
    <div className='bg-white h-screen'><div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6 text-center">Your Academic Results</h1>
    {semesters.length > 0 ? (
      semesters.map((semester) => (
        <div key={semester.semester} className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 bg-gray-50">
            <h2 className="text-2xl font-semibold mb-2">Semester {semester.semester}</h2>
            <p className="text-gray-600">Academic Year: {semester.academicYear}</p>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Courses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Course Code</th>
                    <th className="p-2">Course Name</th>
                    <th className="p-2">Credits</th>
                    <th className="p-2">Grade</th>
                    <th className="p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {semester.courses.map((course) => (
                    <tr key={`${semester.semester}-${course.courseCode}`} className="border-b border-gray-200">
                      <td className="p-2">{course.courseCode}</td>
                      <td className="p-2">{course.courseName}</td>
                      <td className="p-2">{course.credits}</td>
                      <td className="p-2">{course.grade}</td>
                      <td className="p-2">{course.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p><strong>SGPA:</strong> {semester.sgpa?.toFixed(2)}</p>
              </div>
              <div>
                <p><strong>CGPA:</strong> {semester.cgpa?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center text-red-500">No results available.</div>
    )}
  </div></div>
  );
}
