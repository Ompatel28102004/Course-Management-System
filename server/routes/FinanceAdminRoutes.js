import { Router } from "express";

import { 
    Overview
} from '../controller/FinanceAdminController.js';

import { verifyToken } from '../middlewares/AuthMiddleware.js';

const FinanceAdminRoutes = Router();
FinanceAdminRoutes.get('/overview',Overview);

export default FinanceAdminRoutes;