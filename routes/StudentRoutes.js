import { Router } from 'express';
import { 
    getStudentData, getLecturesData, getUpcomingEvaluations, getUpcomingQuizzes, updateStudentData, 
    getCourseData, getAvailableCourses, submitSelectedCourses,
    addDeleteDeadline,
    getAllFees, updateFeeStatus,
    getStudentResults,
    getStudentAttendance,
    getStudentAssignments, submitAssignment,
    downloadFile,
    getCourseDataForFeedback,
    getFeedbackQuestions,
    submitFeedback,
    getCourseForQuiz,
    getQuizForCourse,
    submitQuiz
} from '../controller/StudentController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
import multer from 'multer';

const StudentRoutes = Router();

const upload = multer({ dest: 'uploads/' });

StudentRoutes.get('/get-data', verifyToken, getStudentData);

StudentRoutes.get('/get-lectures-data', verifyToken, getLecturesData);

StudentRoutes.get('/get-upcoming-evaluations', verifyToken, getUpcomingEvaluations);

StudentRoutes.get('/get-upcoming-quizzes', verifyToken, getUpcomingQuizzes);

StudentRoutes.post('/deadlines', verifyToken, addDeleteDeadline);

StudentRoutes.delete('/deadlines', verifyToken, addDeleteDeadline);

StudentRoutes.put('/update-data', verifyToken, updateStudentData);

StudentRoutes.get('/get-course-data', verifyToken, getCourseData);

StudentRoutes.get('/available-courses', verifyToken, getAvailableCourses);

StudentRoutes.post('/enroll-selected-courses', verifyToken, submitSelectedCourses);

// Fees routes 
StudentRoutes.get('/fees', getAllFees);
StudentRoutes.put('/fees/update/:id', verifyToken, updateFeeStatus);

StudentRoutes.put('/fees/update/:id', verifyToken, updateFeeStatus);

//Result routes
StudentRoutes.get('/results', verifyToken, getStudentResults);

// Attendance routes
StudentRoutes.get('/get-student-attendance', verifyToken, getStudentAttendance);

// Assignment routes
StudentRoutes.get('/assignment', verifyToken, getStudentAssignments);
StudentRoutes.post('/assignment/submit/:assignmentId', verifyToken, upload.single('file'), submitAssignment);
StudentRoutes.get('/download', verifyToken, downloadFile);

// Quiz routes
StudentRoutes.get("/courseID/:userId", verifyToken, getCourseForQuiz);
StudentRoutes.get('/courses/:courseId/quiz', verifyToken, getQuizForCourse);
StudentRoutes.post('/courses/:courseId/quiz/submit', verifyToken, submitQuiz);

//feedback
StudentRoutes.get('/enrolled-courses', verifyToken, getCourseDataForFeedback);
StudentRoutes.get('/feedback/questions/:courseId', verifyToken, getFeedbackQuestions);
StudentRoutes.post('/feedback/submit', submitFeedback);

export default StudentRoutes;