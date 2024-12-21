import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Components/HomePage/HomePage.jsx";
import LandingPage from "./Components/LandingPage/LandingPage.jsx";
import AboutUs from "./Components/AboutUsPage/AboutUs.jsx";
import ContactUs from "./Components/ContactUsPage/ContactUs.jsx";
import Login from "./Components/LoginPage/Login.jsx";
import Student from "./Components/Routes/StudentRoutes.jsx";
import Faculty from "./Components/Routes/FacultyRoutes.jsx";
import MasterAdmin from "./Components/Routes/MasterAdminRoutes.jsx";
import AcademicAdmin from "./Components/Routes/AcademicAdminRoutes.jsx";
import FinanceAdmin from "./Components/Routes/FinanceAdminRoutes.jsx";
import ProtectedRoute from "./Components/ProtectedRoutes/ProtectedRoute.jsx"; // Import the ProtectedRoute component
import Navbar from "./Components/Navbar/Navbar.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { HOST } from "./utils/constants.js";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    setToken(authToken);
    setRole(userRole);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const verifyUserRole = async () => {
      try {
        const response = await axios.get(`${HOST}/api/auth/verify-user-role`, {
          params: { userId },
        });
        if (response.data.role !== role) {
          localStorage.setItem("userRole", response.data.role);
          setRole(response.data.role);
        }
      } catch (error) {
        console.error("Error verifying user role:", error);
      }
    };
    if (token && role) {
      verifyUserRole();
    }
  }, [token, role]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {!token || !role ? (
          <>
            <Route path="/landing-page" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
          </>
        ) : (
          <Route path="/" element={<HomePage />} />
        )}

        {/* Protected Routes with Layout */}
        <Route element={<Navbar />}>
          <Route
            path="/student/*"
            element={
              <ProtectedRoute element={<Student />} requiredRole="student" />
            }
          />
          <Route
            path="/faculty/*"
            element={
              <ProtectedRoute element={<Faculty />} requiredRole="faculty" />
            }
          />
          <Route
            path="/master-admin/*"
            element={
              <ProtectedRoute
                element={<MasterAdmin />}
                requiredRole="master-admin"
              />
            }
          />
          <Route
            path="/academic-admin/*"
            element={
              <ProtectedRoute
                element={<AcademicAdmin />}
                requiredRole="academic-admin"
              />
            }
          />
          <Route
            path="/finance-admin/*"
            element={
              <ProtectedRoute
                element={<FinanceAdmin />}
                requiredRole="finance-admin"
              />
            }
          />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
