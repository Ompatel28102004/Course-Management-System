import { Router } from "express";
import { login, changePassword, verifySecurityCode, forgotPassword, getUserRole } from "../controller/AuthController.js";
import verifyToken from "../middlewares/AuthMiddleware.js";

const AuthRoutes = Router();

// Login route
AuthRoutes.post("/login", login);

// Route to verify security code for admin and faculty
AuthRoutes.post("/verify-security-code", verifySecurityCode);

// Change password route
AuthRoutes.post("/change-password", verifyToken, changePassword);

AuthRoutes.post("/forgot-password", forgotPassword);

// Verify User Role
AuthRoutes.get("/verify-user-role", getUserRole);

export default AuthRoutes;
