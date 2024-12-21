import { useState, useEffect } from 'react'
import axios from 'axios'
import { HOST } from "../../../utils/constants"

export default function FeedbackForm() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('authToken')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchQuestions(selectedCourse.courseId)
    }
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${HOST}/api/student/enrolled-courses/?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchQuestions = async (courseId) => {
    try {
      const response = await axios.get(`${HOST}/api/student/feedback/questions/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setQuestions(response.data)
    //   console.log("response",response)
    //   console.log("response.data",response.data)
      setResponses({})
    } catch (error) {
      console.error('Error fetching questions:', error)
    }
  }

  const handleCourseChange = (e) => {
    const course = courses.find(c => c.courseId === e.target.value)
    setSelectedCourse(course)
  }

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    const payload = {
      courseId: selectedCourse.courseId,
      studentId:userId,
      responses: [{
        studentID: userId,
        answers: questions.map(question => ({
          questionID: question.questionId,
          response: responses[question.questionId] || ''
        }))
      }]
    }
    console.log('Submitting feedback:', payload)

    try {
      const response = await axios.post(`${HOST}/api/student/feedback/submit`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      setSubmitMessage('Feedback submitted successfully!')
      setResponses({})
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      if (error.response?.data?.message) {
        setSubmitMessage(error.response.data.message)
      } else {
        setSubmitMessage('An error occurred while submitting feedback')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question) => {
    switch (question.responseType) {
      case 'rating':
        return (
          <div className="flex items-center space-x-4" key={question.questionId}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name={`rating-${question.questionId}`}
                  value={rating}
                  checked={responses[question.questionId] === rating}
                  onChange={() => handleResponseChange(question.questionId, rating)}
                  className="mr-2"
                />
                {rating}
              </label>
            ))}
          </div>
        )
      case 'text':
        return (
          <textarea
            key={question.questionId}
            className="w-full p-2 border rounded-md"
            rows="3"
            value={responses[question.questionId] || ''}
            onChange={(e) => handleResponseChange(question.questionId, e.target.value)}
          />
        )
      default:
        return null
    }
  }

  const isFormComplete = selectedCourse && Object.keys(responses).length === questions.length

  return (
    <div className='bg-white h-screen'>
      <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Course Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="course" className="block text-sm font-medium text-gray-700">
            Select Course
          </label>
          <select
            id="course"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={handleCourseChange}
            value={selectedCourse?.courseId || ''}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName} - {course.facultyName}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((question) => (
              <div key={question.questionId} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {question.questionText}
                </label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>
        )}

        {selectedCourse && questions.length > 0 && (
          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting || !isFormComplete ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isSubmitting || !isFormComplete}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}
      </form>

      {submitMessage && (
        <div className={`mt-4 p-2 rounded ${submitMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {submitMessage}
        </div>
      )}
    </div>
    </div>
  )
}