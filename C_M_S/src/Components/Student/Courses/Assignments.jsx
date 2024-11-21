import React, { useState, useEffect } from "react"
import axios from "axios"
import { HOST } from "../../../utils/constants"
import LoadingAnimation from "../../Loading/loadingAnimation"
import Toast from "../../Toast/Toast"
import { Button } from "../../../Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../Components/ui/card"
import { Input } from "../../../Components/ui/input"

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [flippedCards, setFlippedCards] = useState({})

  const enrollment = localStorage.getItem("userId")
  const token = localStorage.getItem("authToken")

  useEffect(() => {
    fetchAssignments()
  }, [])

  const showToastNotification = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(""), 3000)
  }

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${HOST}/api/student/assignment`,
        {
          params: { enrollment },
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (response.data.success) {
        setAssignments(response.data.data)
      } else {
        setError(response.data.message || "Failed to fetch assignments")
      }
      setLoading(false)
    } catch (err) {
      setError("Failed to fetch assignments: " + (err.response?.data?.message || err.message))
      setLoading(false)
    }
  }

  const handleFileChange = (event, assignmentId) => {
    setSelectedFiles({
      ...selectedFiles,
      [assignmentId]: event.target.files[0],
    })
  }

  const handleSubmit = async (assignmentId, courseId) => {
    if (!selectedFiles[assignmentId]) {
      showToastNotification("Please select a file to upload")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFiles[assignmentId])
      formData.append("enrollment", enrollment)
      formData.append("courseId", courseId)

      const response = await axios.post(
        `${HOST}/api/student/assignment/submit/${assignmentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.success) {
        showToastNotification("Assignment submitted successfully!")
        setSelectedFiles({ ...selectedFiles, [assignmentId]: null })
        await fetchAssignments() // Refresh assignments after submission
      } else {
        showToastNotification(response.data.message || "Failed to submit assignment")
      }
    } catch (err) {
      showToastNotification("Error uploading assignment: " + (err.response?.data?.message || err.message))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = async (courseId, fileUrl, isSubmission = false) => {
    try {
      const response = await fetch(fileUrl); // Fetch the file
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const blob = await response.blob(); // Convert the response to a Blob
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob); // Create a URL for the Blob
      const fileName = isSubmission
        ? `${courseId}_${enrollment}_submission.pdf`
        : `${courseId}_${enrollment}_assignment.pdf`
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href)
    } catch (error) {
      showToastNotification("Download Failed: " + (error.response?.data?.message || error.message))
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB")
  }

  const toggleCardFlip = (assignmentId) => {
    setFlippedCards(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }))
  }

  if (loading) return (
    <div className="text-center mt-8">
      <LoadingAnimation />
    </div>
  )
  
  if (error) return (
    <div className="text-center mt-8 text-red-500">{error}</div>
  )

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Assignments</h1>
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <LoadingAnimation />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((courseAssignment) =>
            courseAssignment.assignments.map((assignment) => (
              <Card
                key={assignment._id}
                className={`relative overflow-hidden transition-all duration-500 ${
                  flippedCards[assignment._id] ? 'rotate-y-180' : ''
                }`}
                style={{ 
                  height: '400px',
                  perspective: '1000px'
                }}
              >
                {/* Front of card */}
                <div className={`absolute w-full h-full transition-all duration-500 ${
                  flippedCards[assignment._id] ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold mb-2">
                        {assignment.title}
                      </CardTitle>
                      <p className="mb-2 text-gray-700">{assignment.description}</p>
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(assignment.dueDate)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Course: {courseAssignment.courseId}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Max Score: {assignment.maxScore}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => handleDownload(courseAssignment.courseId, assignment.attachmentUrlFaculty)}
                        className="w-full"
                        variant="outline"
                      >
                        Download Assignment
                      </Button>
                      
                      {assignment.submissions?.length > 0 ? (
                        <Button
                          onClick={() => toggleCardFlip(assignment._id)}
                          className="w-full"
                          variant="default"
                        >
                          View Submission
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(e, assignment._id)}
                            className="w-full"
                            accept=".pdf,.doc,.docx"
                          />
                          <Button
                            onClick={() => handleSubmit(assignment._id, courseAssignment.courseId)}
                            className="w-full"
                            variant="default"
                            disabled={!selectedFiles[assignment._id]}
                          >
                            Submit
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Back of card */}
                <div className={`absolute w-full h-full transition-all duration-500 ${
                  flippedCards[assignment._id] ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}>
                  <CardContent className="p-6 h-full flex flex-col justify-between bg-gray-50">
                    <div>
                      <CardTitle className="text-xl font-semibold mb-4">
                        Submission Details
                      </CardTitle>
                      {assignment.submissions?.[0] && (
                        <div className="space-y-2">
                          <p><span className="font-medium">Submitted:</span> {formatDate(assignment.submissions[0].submissionDate)}</p>
                          <p><span className="font-medium">Status:</span> {assignment.submissions[0].isLate ? "Late" : "On Time"}</p>
                          {assignment.submissions[0].score !== null && (
                            <p><span className="font-medium">Score:</span> {assignment.submissions[0].score}/{assignment.maxScore}</p>
                          )}
                          {assignment.submissions[0].feedback && (
                            <div className="mt-4">
                              <p className="font-medium">Feedback:</p>
                              <p className="text-gray-700 mt-1">{assignment.submissions[0].feedback}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={() => handleDownload(
                          courseAssignment.courseId,
                          assignment.submissions[0].attachmentUrlStudent,
                          true
                        )}
                        className="w-full"
                        variant="outline"
                      >
                        Download Submission
                      </Button>
                      <Button
                        onClick={() => toggleCardFlip(assignment._id)}
                        className="w-full"
                        variant="default"
                      >
                        Back to Assignment
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
        {toastMessage && <Toast message={toastMessage} />}
      </div>
    </div>
  )
}