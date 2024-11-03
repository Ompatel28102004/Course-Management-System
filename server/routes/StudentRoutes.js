import { Router } from 'express';
import { 
    getStudentData,
    updateStudentData, getAvailableCourses, submitSelectedCourses,
    addDeleteDeadline,
    getAllFees, updateFeeStatus, genReport,
    getStudentResults
} from '../controller/StudentController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';


const StudentRoutes = Router();

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

export default StudentRoutes;
