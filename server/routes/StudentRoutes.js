import { Router } from 'express';
import { 
    getStudentData,
    updateStudentData, getAvailableCourses, submitSelectedCourses,
    addDeleteDeadline,
    getAllFees, updateFeeStatus, genReport,
    getStudentResults,
    getStudentAssignments,
    submitAssignment,
    downloadFile
} from '../controller/StudentController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';
import multer from 'multer';


const StudentRoutes = Router();


const upload = multer({ dest: 'uploads/' });

StudentRoutes.get('/get-data', verifyToken, getStudentData);

StudentRoutes.post('/deadlines', verifyToken, addDeleteDeadline);

StudentRoutes.delete('/deadlines', verifyToken, addDeleteDeadline);

StudentRoutes.put('/update-data', verifyToken, updateStudentData);

StudentRoutes.get('/available-courses', verifyToken, getAvailableCourses);

StudentRoutes.post('/enroll-selected-courses', verifyToken, submitSelectedCourses);

// Fees routes 
StudentRoutes.get('/fees',getAllFees);

StudentRoutes.put('/fees/update/:id',verifyToken,updateFeeStatus)

StudentRoutes.get('/fees/reciept/fees/:id',verifyToken,genReport)


//Result routes
StudentRoutes.get('/results',verifyToken,getStudentResults)




StudentRoutes.get('/assignment',verifyToken, getStudentAssignments);
StudentRoutes.post('/assignment/submit/:assignmentId', upload.single('file'),submitAssignment);
StudentRoutes.get('/api/student/download', downloadFile);


export default StudentRoutes