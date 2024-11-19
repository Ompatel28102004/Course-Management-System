import { Router } from "express";

import { 
    Overview, pendingFees, dueDates
} from '../controller/FinanceAdminController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const FinanceAdminRoutes = Router();
FinanceAdminRoutes.get('/overview', Overview);
FinanceAdminRoutes.get('/pendingFees', pendingFees);
FinanceAdminRoutes.get('/dueDates', dueDates);

export default FinanceAdminRoutes;