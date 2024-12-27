import React, { useState, useEffect, useCallback, useRef } from 'react'
import { AlertTriangle, Timer, ArrowRight, Send, Book, CheckCircle, ChevronLeft, RefreshCcw, Eye } from 'lucide-react'
import axios from 'axios'
import { Button } from "../../ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../ui/card"
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group"
import { Label } from "../../ui/label"
import { Progress } from "../../ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert"
import { HOST } from "../../../utils/constants"
import LoadingAnimation from '../../Loading/LoadingAnimation'

export default function QuizApplication() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quizResult, setQuizResult] = useState(null)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [allResults, setAllResults] = useState([])
  const [warningCount, setWarningCount] = useState(0)
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('authToken')

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
      setQuizzes(response.data)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      setError(`Failed to fetch quizzes: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async () => {
    try {
      setQuizStarted(true)
      setTimeLeft(selectedQuiz.duration * 60)
      if (selectedQuiz && selectedQuiz.questions) {
        setQuestions(selectedQuiz.questions)
        setCurrentQuestion(0)
        setAnswers({})
        
        // Request fullscreen on the quiz container
        const quizElement = document.getElementById('quiz-container')
        if (quizElement?.requestFullscreen) {
          await quizElement.requestFullscreen()
        } else if (quizElement?.webkitRequestFullscreen) {
          await quizElement.webkitRequestFullscreen()
        } else if (quizElement?.msRequestFullscreen) {
          await quizElement.msRequestFullscreen()
        }

        // Prevent opening inspect tools
        document.addEventListener('keydown', preventInspect)
        document.addEventListener('contextmenu', preventContextMenu)
      } else {
        throw new Error('No questions available for this quiz')
      }
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
          examId: selectedQuiz.examId,
          answers,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setQuizResult(response.data.currentQuiz)
      setAllResults(response.data.allResults)
      setQuizStarted(false)
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (document.webkitFullscreenElement) {
        await document.webkitExitFullscreen()
      } else if (document.msFullscreenElement) {
        await document.msExitFullscreen()
      }
      
      // Remove event listeners
      document.removeEventListener('keydown', preventInspect)
      document.removeEventListener('contextmenu', preventContextMenu)

      await fetchQuizzes(selectedCourse.courseId)
      setSelectedQuiz(null)
      setShowResultDialog(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
      setError(`Failed to submit quiz: ${error.message}`)
    }
  }

  useEffect(() => {
    let timer
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            submitQuiz()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [quizStarted, timeLeft])

  const handleVisibilityChange = useCallback(() => {
    if (quizStarted && !document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) {
      setWarningCount((prevCount) => {
        const newCount = prevCount + 1
        if (newCount >= 3) {
          submitQuiz()
        } else {
          setShowWarningDialog(true)
        }
        return newCount
      })
    }
  }, [quizStarted])

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleVisibilityChange)
    document.addEventListener('webkitfullscreenchange', handleVisibilityChange)
    document.addEventListener('msfullscreenchange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('fullscreenchange', handleVisibilityChange)
      document.removeEventListener('webkitfullscreenchange', handleVisibilityChange)
      document.removeEventListener('msfullscreenchange', handleVisibilityChange)
    }
  }, [handleVisibilityChange])

  const handleExitConfirmation = async (continueQuiz) => {
    if (continueQuiz) {
      const quizElement = document.getElementById('quiz-container')
      if (quizElement?.requestFullscreen) {
        await quizElement.requestFullscreen()
      } else if (quizElement?.webkitRequestFullscreen) {
        await quizElement.webkitRequestFullscreen()
      } else if (quizElement?.msRequestFullscreen) {
        await quizElement.msRequestFullscreen()
      }
    } else {
      submitQuiz()
    }
    setShowExitConfirmation(false)
  }

  const preventInspect = (e) => {
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
      (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
      (e.ctrlKey && e.keyCode === 85) // Ctrl+U
    ) {
      e.preventDefault()
    }
  }

  const preventContextMenu = (e) => {
    e.preventDefault()
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><LoadingAnimation/></div>
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
                  <span>{course.courseName} ({course.courseId})</span>
                  <Book className="w-5 h-5 ml-2" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!selectedQuiz) {
      const availableQuizzes = quizzes.filter(quiz => quiz.isPublished && !quiz.alreadyTaken)
      const completedQuizzes = quizzes.filter(quiz => quiz.alreadyTaken)

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
              <CardDescription>Quizzes for {selectedCourse.courseName} ({selectedCourse.courseId})</CardDescription>
            </CardHeader>
            <CardContent>
              {availableQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableQuizzes.map((quiz) => (
                    <Button
                      key={quiz.examId}
                      onClick={() => {
                        setSelectedQuiz(quiz)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <span>{quiz.examName}</span>
                      <Timer className="w-5 h-5 ml-2" />
                    </Button>
                  ))}
                </div>
              ) : (
                <p>No available quizzes for this course.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Completed Quizzes</CardTitle>
              <CardDescription>Quizzes you have already taken</CardDescription>
            </CardHeader>
            <CardContent>
              {completedQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedQuizzes.map((quiz) => (
                    <Button
                      key={quiz.examId}
                      onClick={() => {
                        setSelectedQuiz(quiz)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <span>{quiz.examName}</span>
                      <CheckCircle className="w-5 h-5 ml-2" />
                    </Button>
                  ))}
                </div>
              ) : (
                <p>No completed quizzes for this course.</p>
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
            <CardTitle>{selectedQuiz.examName}</CardTitle>
            <CardDescription>Course: {selectedCourse.courseName} ({selectedCourse.courseId})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setSelectedQuiz(null)
              }}
              variant="outline"
              className="flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Quizzes
            </Button>
            {selectedQuiz.isPublished && !selectedQuiz.alreadyTaken && (
              <>
                <p className="font-medium">Duration: {selectedQuiz.duration} minutes</p>
                <p className="font-medium">Total Marks: {selectedQuiz.totalMarks}</p>
                <div className="bg-yellow-50 p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Guidelines:</h3>
                  <div dangerouslySetInnerHTML={{ __html: selectedQuiz.examGuidelines }} />
                </div>
              </>
            )}
            {selectedQuiz.alreadyTaken && (
              <div>
                <h3 className="font-semibold mb-2">Quiz Completed</h3>
                <p>Marks: {selectedQuiz.result.marks}</p>
                <p>Remarks: {selectedQuiz.result.remarks}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {selectedQuiz.isPublished && !selectedQuiz.alreadyTaken && (
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
      <div className="bg-white space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <CardDescription>Time Remaining: {formatTime(timeLeft)}</CardDescription>
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
              variant="outline">
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
    <div id="quiz-container" className="min-h-screen bg-gray-50 p-4">
      {renderQuizContent()}

      <Dialog open={showExitConfirmation} onOpenChange={() => {}} hideClose>
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

      <Dialog open={showWarningDialog} onOpenChange={() =>{}}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Warning</DialogTitle>
      <DialogDescription>
        You have exited fullscreen mode. This is warning {warningCount} of 3. 
        Please return to fullscreen mode to continue the quiz.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button
        onClick={() => {
          setShowWarningDialog(false);
          handleExitConfirmation(true);
        }}
        className="bg-blue-600 hover:bg-blue-700"
      >
        Return to Fullscreen
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Current Quiz Result:</h3>
              <p>Exam: {quizResult?.examName}</p>
              <p>Marks: {quizResult?.score} / {quizResult?.totalMarks}</p>
              <p>Remarks: {quizResult?.remarks}</p>
            </div>
            <div>
              <h3 className="font-semibold">All Quiz Results:</h3>
              {allResults.map((result, index) => (
                <div key={index} className="mt-2">
                  <p>Exam: {result.examName}</p>
                  <p>Marks: {result.marks} / {result.totalMarks}</p>
                  <p>Remarks: {result.remarks}</p>
                  <p>Date: {new Date(result.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowResultDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

