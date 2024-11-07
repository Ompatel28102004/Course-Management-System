import { Router } from 'express';
import { 
    getStudentData, getLecturesData, updateStudentData, 
    getCourseData, getAvailableCourses, submitSelectedCourses,
    addDeleteDeadline,
    getAllFees, updateFeeStatus,
    getStudentResults,
    getStudentAttendance,
    getStudentAssignments, submitAssignment,
    downloadFile
} from '../controller/StudentController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
import multer from 'multer';

const StudentRoutes = Router();

const upload = multer({ dest: 'uploads/' });

StudentRoutes.get('/get-data', verifyToken, getStudentData);

StudentRoutes.get('/get-lectures-data', verifyToken, getLecturesData);

StudentRoutes.post('/deadlines', verifyToken, addDeleteDeadline);

StudentRoutes.delete('/deadlines', verifyToken, addDeleteDeadline);

StudentRoutes.put('/update-data', verifyToken, updateStudentData);

StudentRoutes.get('/get-course-data', verifyToken, getCourseData);

StudentRoutes.get('/available-courses', verifyToken, getAvailableCourses);

StudentRoutes.post('/enroll-selected-courses', verifyToken, submitSelectedCourses);

// Fees routes 
StudentRoutes.get('/fees',getAllFees);

StudentRoutes.put('/fees/update/:id', verifyToken, updateFeeStatus);

//Result routes
StudentRoutes.get('/results', verifyToken, getStudentResults);

// Attendance routes
StudentRoutes.get('/get-student-attendance', verifyToken, getStudentAttendance);

// Assignment routes
StudentRoutes.get('/assignment',verifyToken, getStudentAssignments);
StudentRoutes.post('/assignment/submit/:assignmentId', upload.single('file'), submitAssignment); //add verify token
StudentRoutes.get('/api/student/download', downloadFile);


export default StudentRoutes