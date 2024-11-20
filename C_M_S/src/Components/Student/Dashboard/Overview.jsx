import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'; 
import { HOST } from "../../../utils/constants";
import axios from "axios";
import { X, Calendar, CheckCircle, Clock, Users } from "lucide-react";
import LoadingAnimation from "../../Loading/LoadingAnimation";

const Card = ({ children, className }) => (
  <div className={`p-6 rounded-lg shadow ${className}`}>{children}</div>
);

export default function Overview() {
  const [data, setData] = useState(null);
  const [upcomingEvaluations, setUpcomingEvaluations] = useState(null);
  const [upcomingQuizzes, setUpcomingQuizzes] = useState(0);
  const [lectureData, setLectureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    heading: "",
    description: "",
    date: "",
  });
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchStudentData();
    fetchLecturesData();
  }, [token, userId]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`${HOST}/api/student/get-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          userId: userId,
        },
      });
      setData(response.data);
      localStorage.setItem(
        "firstName",
        response.data.FirstName + " " + response.data.LastName
      );
      localStorage.setItem("imageUrl", response.data.image_url);
      localStorage.setItem("isTA", response.data.Academic_info.isTA);
      fetchUpcomingEvaluations(response.data.Academic_info.Semester);
      fetchUpcomingQuizzes(response.data.Academic_info.Semester);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturesData = async () => {
    try {
      const response = await axios.get(
        `${HOST}/api/student/get-lectures-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            userId: userId,
          },
        }
      );
      setLectureData(response.data);
    } catch (error) {
      console.error("Lectures Data Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingEvaluations = async (semester) => {
    try {
      const response = await axios.get(`${HOST}/api/student/get-upcoming-evaluations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          semester: semester,
        },
      });
      setUpcomingEvaluations(response.data.upcomingEvaluations);
    } catch (error) {
      console.error("Error fetching upcoming evaluations:", error);
    }
  };

  const fetchUpcomingQuizzes = async (semester) => {
    try {
      const response = await axios.get(`${HOST}/api/student/get-upcoming-quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          semester: semester,
        },
      });
      setUpcomingQuizzes(response.data.totalUpcomingQuizzes);
    } catch (error) {
      console.error('Error fetching upcoming quizzes:', error);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewDeadline({ ...newDeadline, [name]: value });
  };

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleDeadlineOperation = async (operation, deadline) => {
    try {
      const response = await axios({
        url: `${HOST}/api/student/deadlines`,
        method: operation === "add" ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
          operation: operation, // Custom header to specify add/delete
          Authorization: `Bearer ${token}`, // Send JWT token
        },
        data: {
          ...deadline,
          userId, // Include userId in the request body
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log(
          `Deadline ${operation === "add" ? "added" : "deleted"} successfully!`
        );
        fetchStudentData();
      } else {
        console.error(
          `Error ${operation === "add" ? "adding" : "deleting"} deadline`
        );
      }
    } catch (error) {
      console.error(
        `Failed to connect to backend while ${
          operation === "add" ? "adding" : "deleting"
        } deadline`,
        error
      );
    }
  };

  // Function to add a new deadline
  const addNewDeadline = async () => {
    await handleDeadlineOperation("add", newDeadline);
    togglePopup(); // Close the popup if needed
  };

  // Function to delete a deadline
  const deleteDeadline = async (index) => {
    const deadline = { id: index }; // Assuming you only need the id for deletion
    await handleDeadlineOperation("delete", deadline);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingAnimation />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen">
        Error loading dashboard data
      </div>
    );
  }

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", options).replace(/\//g, "-");
  };

  // Calculate totalLectures and attendedLectures
  let totalLectures = 0;
  let attendedLectures = 0;

  // Iterate over each course in the Courses object
  for (const courseId in data.Courses) {
    if (data.Courses.hasOwnProperty(courseId)) {
      const course = data.Courses[courseId];

      // Accumulate total lectures and attended lectures
      totalLectures += course.lectures || 0; // Add the number of lectures
      attendedLectures += course.lectures_attended || 0; // Add the number of attended lectures
    }
  }

  // Calculate semesterProgress
  const semesterProgress =
    lectureData?.totalLectures > 0
      ? (lectureData?.lecturesTaken / lectureData?.totalLectures) * 100
      : 0;

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold mb-6">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-custom-blue">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Semester
              </span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {data.Academic_info?.Semester}
            </div>
            <p className="text-xs text-gray-500">{new Date().getFullYear()}</p>
          </Card>
          <Card className="bg-custom-pink">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Completed Courses
              </span>
              <CheckCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {data.CourseCompleted
                ? Object.keys(data.CourseCompleted).length
                : 0}
            </div>
            <p className="text-xs text-gray-500">
              {data.Academic_info?.Total_Courses -
                Object.keys(data.CourseCompleted).length || 0}{" "}
              Remaining
            </p>
          </Card>
          <Card className="bg-custom-purple">
            <Link to="/student/courses/quiz" className="block">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Upcoming Quiz
                </span>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold">{upcomingQuizzes}</div>
              <p className="text-xs text-gray-500">Click here to know more</p>
            </Link>
          </Card>
          <Card className="bg-custom-yellow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Classes Attended
              </span>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {lectureData?.lecturesAttended}
            </div>
            <p className="text-xs text-gray-500">This semester</p>
          </Card>
        </div>

        <h2 className="text-2xl font-semibold mb-6">
          {data.Academic_info?.Branch}, {userId}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-custom-darkPink">
            <h3 className="text-lg font-semibold mb-4">Semester Progress</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-[#cbd5e1] stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                  ></circle>
                  <circle
                    className="text-blue-500 progress-ring stroke-current"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 40 * (1 - semesterProgress / 100)
                    }`}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {Math.round(semesterProgress)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-lg font-semibold">
                {lectureData?.lecturesTaken}/{lectureData?.totalLectures}
              </p>
              <p className="text-sm text-gray-500">Lectures</p>
            </div>
          </Card>
          <Card className="bg-custom-darkPink">
            <h3 className="text-lg font-semibold mb-4">Upcoming Evaluations</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left font-semibold">Type</th>
                  <th className="text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvaluations && upcomingEvaluations.length > 0 ? (
                  upcomingEvaluations.map((evalItem, index) => (
                    <tr key={index}>
                      <td>{evalItem.ExamName}</td>
                      <td>{formatDate(evalItem.ExamStartDate) + " to " + formatDate(evalItem.ExamEndDate)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No upcoming evaluations</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
        <div>
          <Card className="mb-8 bg-custom-red">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
              <button
                onClick={togglePopup}
                className="mb-4 p-2 bg-custom-selectedPurple text-white rounded"
              >
                Add
              </button>
            </div>
            {data.UpcomingDeadlines && data.UpcomingDeadlines.length > 0 ? (
              data.UpcomingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-4 last:mb-0"
                >
                  <div>
                    <h4 className="font-semibold">{deadline.heading}</h4>
                    <p className="text-sm text-gray-500">
                      {deadline.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(deadline.date)}
                    </p>
                  </div>
                  <X
                    className="h-5 w-5 mr-3 text-gray-500 cursor-pointer"
                    onClick={() => deleteDeadline(deadline._id)}
                  />
                </div>
              ))
            ) : (
              <p>No Added Deadlines</p>
            )}
          </Card>
          {/* Popup for adding new deadline */}
          {isPopupOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New Deadline</h3>
                <form onSubmit={addNewDeadline}>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="heading"
                    >
                      Heading
                    </label>
                    <input
                      type="text"
                      name="heading"
                      id="heading"
                      className="w-full p-2 border rounded"
                      value={newDeadline.heading}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="description"
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      className="w-full p-2 border rounded"
                      value={newDeadline.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="date"
                    >
                      Deadline Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      className="w-full p-2 border rounded"
                      value={newDeadline.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-gray-300 p-2 rounded mr-2"
                      onClick={togglePopup}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 text-white p-2 rounded"
                    >
                      Add Deadline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
