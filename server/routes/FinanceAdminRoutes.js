import { Router } from "express";

import { 
    Overview, pendingFees, dueDates
} from '../controller/FinanceAdminController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const FinanceAdminRoutes = Router();
FinanceAdminRoutes.get('/overview',verifyToken, Overview);
FinanceAdminRoutes.get('/pendingFees',verifyToken, pendingFees);
FinanceAdminRoutes.get('/dueDates',verifyToken, dueDates);

export default FinanceAdminRoutes;