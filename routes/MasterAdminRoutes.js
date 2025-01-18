import { Router } from "express";
import { 
    getProfile,
    getAllAdminActivities, submitActivityResponse, submitReviewedActivityReply, settleActivity, deleteAllSettledActivity,
    addAdmin, getAdmins, deleteAdmin,
    getTemporaryAccess,
    getTotalUsers,
    generateFeesReport, generateAttendanceReport, generateFeedbackReport
} from "../controller/MasterAdminController.js";
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const MasterAdminRoutes = Router();

MasterAdminRoutes.get('/get-profile', verifyToken, getProfile);

MasterAdminRoutes.get('/get-admins', verifyToken, getAdmins);
MasterAdminRoutes.get('/get-all-admin-activities', verifyToken, getAllAdminActivities);
MasterAdminRoutes.put('/submit-activity-response', verifyToken, submitActivityResponse);
MasterAdminRoutes.put('/submit-reviewed-activity-reply', verifyToken, submitReviewedActivityReply);
MasterAdminRoutes.put('/settle-activity', verifyToken, settleActivity);
MasterAdminRoutes.delete('/delete-all-settled-activity', verifyToken, deleteAllSettledActivity);
MasterAdminRoutes.post('/add-admin', verifyToken, addAdmin);
MasterAdminRoutes.delete('/delete-admin', verifyToken, deleteAdmin);
MasterAdminRoutes.post('/get-temp-admin-access', verifyToken, getTemporaryAccess);
MasterAdminRoutes.get('/get-total-users', verifyToken, getTotalUsers);
MasterAdminRoutes.get('/generate-fees-report', verifyToken, generateFeesReport);
MasterAdminRoutes.get('/generate-attendance-report', verifyToken, generateAttendanceReport);
MasterAdminRoutes.get('/generate-feedback-report', verifyToken, generateFeedbackReport);


export default MasterAdminRoutes;