import React, { useState, useEffect } from "react";
import axios from "axios";
import { HOST } from "../../../utils/constants";
import LoadingAnimation from "../../Loading/loadingAnimation";
import Toast from "../../Toast/Toast";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [flippedCards, setFlippedCards] = useState({});

  const enrollment = localStorage.getItem("userId");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const showToastNotification = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${HOST}/api/student/assignment?enrollment=${enrollment}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAssignments(response.data.data);
      } else {
        setError(response.data.message);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch assignments");
      setLoading(false);
    }
  };

  const handleFileChange = (event, assignmentId) => {
    setSelectedFiles({
      ...selectedFiles,
      [assignmentId]: event.target.files[0],
    });
  };

  const handleSubmit = async (assignmentId) => {
    if (!selectedFiles[assignmentId]) {
      showToastNotification("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFiles[assignmentId]);
    formData.append("assignmentId", assignmentId);
    formData.append("enrollment", enrollment);

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${HOST}/api/student/assignment/submit/${assignmentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        showToastNotification("Assignment submitted successfully!");
        setSelectedFiles({ ...selectedFiles, [assignmentId]: null });
        fetchAssignments();
      } else {
        showToastNotification(response.data.message);
      }
    } catch (err) {
      showToastNotification("Error uploading assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (courseId, fileUrl, isSubmission = false) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        showToastNotification("Network response was not ok");
        return;
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);

      const fileName = isSubmission
        ? `${courseId}_${enrollment}_submission.pdf`
        : `${courseId}_${enrollment}_assignment.pdf`;

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      showToastNotification("Download Failed");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // Format: dd/mm/yyyy
  };

  const toggleCardFlip = (assignmentId) => {
    setFlippedCards(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  if (loading)
    return (
      <div className="text-center mt-8">
        <LoadingAnimation />
      </div>
    );
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
        {isSubmitting && (
          <div className="text-center">
            <LoadingAnimation />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
              style={{ height: '400px' }}
            >
              <div className="relative w-full h-full transition-transform duration-700 transform-style-3d" 
                   style={{ transformStyle: 'preserve-3d', transform: flippedCards[assignment._id] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                {/* Front of the card */}
                <div className="absolute w-full h-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{assignment.title}</h2>
                      <p className="mb-2 text-red-500">{assignment.description}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Due: {formatDate(assignment.dueDate)}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Course: {assignment.courseId}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Max Score: {assignment.maxScore}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <button
                        onClick={() => handleDownload(assignment.courseId, assignment.attachmentUrl)}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Download Assignment
                      </button>
                      {assignment.submissions && assignment.submissions.length > 0 ? (
                        <button
                          onClick={() => toggleCardFlip(assignment._id)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        >
                          Show Result
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(e, assignment._id)}
                            className="w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-purple-50 file:text-purple-700
                              hover:file:bg-purple-100"
                          />
                          <button
                            onClick={() => handleSubmit(assignment._id)}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                          >
                            Submit Assignment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Back of the card */}
                <div className="absolute w-full h-full backface-hidden transform rotate-y-180" 
                     style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">{assignment.title} - Result</h2>
                      {assignment.submissions && assignment.submissions.length > 0 && (
                        <div className="space-y-2">
                          <p>Submission Date: {formatDate(assignment.submissions[0].submissionDate)}</p>
                          <p>Status: {assignment.submissions[0].isLate ? "Late" : "On time"}</p>
                          {assignment.submissions[0].score !== null && (
                            <p>Score: {assignment.submissions[0].score} / {assignment.maxScore}</p>
                          )}
                          {assignment.submissions[0].feedback && (
                            <p>Feedback: {assignment.submissions[0].feedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <button
                        onClick={() => handleDownload(assignment.courseId, assignment.submissions[0].attachmentUrl, true)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Download Your Submission
                      </button>
                      <button
                        onClick={() => toggleCardFlip(assignment._id)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      >
                        Hide Result
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {toastMessage && <Toast message={toastMessage} />}
      </div>
    </div>
  );
}