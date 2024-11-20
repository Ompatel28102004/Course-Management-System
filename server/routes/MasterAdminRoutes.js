import { Router } from "express";
import { 
    getProfile,
    getAllAdminActivities, submitActivityResponse,
    addAdmin, getAdmins, deleteAdmin,
    getTemporaryAccess,
    getTotalUsers,
} from "../controller/MasterAdminController.js";
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const MasterAdminRoutes = Router();

MasterAdminRoutes.get('/get-profile', verifyToken, getProfile);

MasterAdminRoutes.get('/get-admins', verifyToken, getAdmins);
MasterAdminRoutes.get('/get-all-admin-activities', verifyToken, getAllAdminActivities);
MasterAdminRoutes.put('/submit-activity-response', verifyToken, submitActivityResponse);
MasterAdminRoutes.post('/add-admin', verifyToken, addAdmin);
MasterAdminRoutes.delete('/delete-admin', verifyToken, deleteAdmin);
MasterAdminRoutes.post('/get-temp-admin-access', verifyToken, getTemporaryAccess);
MasterAdminRoutes.get('/get-total-users', verifyToken, getTotalUsers);



export default MasterAdminRoutes;