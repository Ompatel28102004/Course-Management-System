import { Router } from "express";

import { 
    getProfile, Overview, pendingFees, dueDates
} from '../controller/FinanceAdminController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const FinanceAdminRoutes = Router();
FinanceAdminRoutes.get('/overview',verifyToken, Overview);
FinanceAdminRoutes.get('/pendingFees', pendingFees);
FinanceAdminRoutes.get('/dueDates',verifyToken, dueDates);
FinanceAdminRoutes.get('/profile', verifyToken, getProfile);

export default FinanceAdminRoutes;