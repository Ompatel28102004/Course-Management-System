'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, Timer, ArrowRight, Send, Book, CheckCircle, ChevronLeft, RefreshCcw } from 'lucide-react'
import axios from 'axios'
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card"
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group"
import { Label } from "../../ui/label"
import { Progress } from "../../ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import {HOST} from "../../../utils/constants"

export default function QuizApplication() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [quizData, setQuizData] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${HOST}/api/student/courseID/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data && Array.isArray(response.data)) {
        setCourses(response.data)
      } else {
        throw new Error('Invalid response format or empty courses array')
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError(`Failed to fetch courses: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizzes = async (courseId) => {
    try {
      setLoading(true)
      const response = await axios.get(`${HOST}/api/student/courses/${courseId}/quiz?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setQuizzes(Array.isArray(response.data) ? response.data : [response.data])
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setError(`Failed to fetch quizzes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizData = async (quizId) => {
    try {
      setLoading(true)
      console.log(`Fetching quiz data for course ${selectedCourse.courseId} and user ${userId}`)
      const response = await axios.get(`${HOST}/api/student/courses/${selectedCourse.courseId}/quiz?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      console.log('Quiz data:', response.data)
      setQuizData(response.data)
      if (response.data.isPublished && !response.data.alreadyTaken) {
        setTimeLeft(response.data.duration * 60)
        // Transform the Mongoose documents into plain objects
        const plainQuestions = response.data.questions.map(q => ({
          questionId: q._doc.questionId,
          questionText: q._doc.questionText,
          options: q._doc.options,
          marks: q._doc.marks
        }))
        console.log('Processed questions:', plainQuestions)
        setQuestions(plainQuestions)
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error)
      setError(`Failed to fetch quiz data: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    try {
      await document.documentElement.requestFullscreen()
      setQuizStarted(true)
    } catch (error) {
      console.error('Error starting quiz:', error)
      setError(`Failed to start quiz: ${error.message}`)
    }
  }

  const submitQuiz = async () => {
    try {
      const response = await axios.post(
        `${HOST}/api/student/courses/${selectedCourse.courseId}/quiz/submit`,
        {
          userId,
          answers,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setQuizResult(response.data)
      setQuizStarted(false)
      document.exitFullscreen()
      
      await fetchQuizzes(selectedCourse.courseId)
      setSelectedQuiz(null)
      setQuizData(null)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError(`Failed to submit quiz: ${error.message}`)
    }
  }

  useEffect(() => {
    let timer
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [quizStarted, timeLeft])

  const handleVisibilityChange = useCallback(() => {
    if (quizStarted && !document.fullscreenElement) {
      setShowExitConfirmation(true)
    }
  }, [quizStarted])

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleVisibilityChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  const handleExitConfirmation = (continueQuiz) => {
    if (continueQuiz) {
      document.documentElement.requestFullscreen()
    } else {
      submitQuiz()
    }
    setShowExitConfirmation(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const renderQuizContent = () => {
    if (!selectedCourse) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Select a Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Button
                  key={course.courseId}
                  onClick={() => {
                    setSelectedCourse(course)
                    fetchQuizzes(course.courseId)
                  }}
                  className="w-full"
                >
                  <span>{course.courseId}</span>
                  <Book className="w-5 h-5 ml-2" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!selectedQuiz) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => {
                setSelectedCourse(null)
                setQuizzes([])
              }}
              variant="outline"
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Courses
            </Button>
            <Button onClick={() => fetchQuizzes(selectedCourse.courseId)} variant="outline" className="flex items-center">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh Quizzes
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Available Quizzes</CardTitle>
              <CardDescription>Quizzes for {selectedCourse.courseId}</CardDescription>
            </CardHeader>
            <CardContent>
              {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map((quiz) => (
                    <Button
                      key={quiz.examId}
                      onClick={() => {
                        setSelectedQuiz(quiz)
                        fetchQuizData(quiz.examId)
                      }}
                      className={`w-full ${quiz.isPublished ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}`}
                      disabled={!quiz.isPublished}
                    >
                      <span>{quiz.examName}</span>
                      {quiz.isPublished ? (
                        <Timer className="w-5 h-5 ml-2" />
                      ) : (
                        <Book className="w-5 h-5 ml-2" />
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <p>No quizzes available for this course.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    if (!quizStarted) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>{quizData?.examName}</CardTitle>
            <CardDescription>Course: {selectedCourse.courseId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setSelectedQuiz(null)
                setQuizData(null)
              }}
              variant="outline"
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Quizzes
            </Button>
            {quizData?.isPublished ? (
              quizData?.alreadyTaken ? (
                <div>
                  <h3 className="font-semibold mb-2">Quiz Result:</h3>
                  <p>Marks: {quizData.result.marks}</p>
                  <p>Remarks: {quizData.result.remarks}</p>
                </div>
              ) : (
                <>
                  <p className="font-medium">Duration: {quizData?.duration} minutes</p>
                  <p className="font-medium">Total Marks: {quizData?.totalMarks}</p>
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Guidelines:</h3>
                    <div dangerouslySetInnerHTML={{ __html: quizData?.examGuidelines }} />
                  </div>
                </>
              )
            ) : (
              <p className="text-yellow-600 font-medium">
                This quiz is not yet available. It will be published on {new Date(quizData?.date).toLocaleString()}.
              </p>
            )}
          </CardContent>
          <CardFooter>
            {quizData?.isPublished && !quizData?.alreadyTaken && (
              <Button
                onClick={startQuiz}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Quiz
              </Button>
            )}
          </CardFooter>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        <Card>
            <CardHeader>
              <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            </CardHeader>
            <CardContent>
              {questions && questions.length > 0 ? (
                <>
                  <p className="mb-4">{questions[currentQuestion]?.questionText}</p>
                  <RadioGroup
                    value={answers[questions[currentQuestion]?.questionId] || ''}
                    onValueChange={(value) => setAnswers(prev => ({
                      ...prev,
                      [questions[currentQuestion]?.questionId]: value
                    }))}
                  >
                    {questions[currentQuestion]?.options?.map((option, index) => (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem value={option.text} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`}>{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </>
              ) : (
                <p>No questions available for this quiz.</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                variant="outline"
              >
                Previous
              </Button>
              {currentQuestion < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion((prev) => prev + 1)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitQuiz}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {renderQuizContent()}

      <Dialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit Fullscreen Mode</DialogTitle>
            <DialogDescription>
              Do you want to continue the quiz or submit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => handleExitConfirmation(true)} className="bg-blue-600 hover:bg-blue-700">
              Continue Quiz
            </Button>
            <Button onClick={() => handleExitConfirmation(false)} className="bg-red-600 hover:bg-red-700">
              Submit Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}