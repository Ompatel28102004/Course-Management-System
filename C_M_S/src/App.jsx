import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Components/HomePage/HomePage.jsx';
import Dashboard from "./Components/Landing_Page/Dashboard.jsx";
import Login from './Components/Login_Page/Login.jsx';
import StudentDashboard from "./Components/Mock_Dashboard/StudentDashboard.jsx";
import FacultyDashboard from "./Components/Mock_Dashboard/FacultyDashboard.jsx";
import AdminDashboard from "./Components/Mock_Dashboard/AdminDashboard.jsx";
import ProtectedRoute from './Components/ProtectedRoutes/ProtectedRoute.jsx'; // Import the ProtectedRoute component
import { useEffect, useState } from 'react';

function App() {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        const userRole = localStorage.getItem('userRole');
        setToken(authToken);
        setRole(userRole);
    }, []);

    return (
        <Router>
            <Routes>
                {/* If no token and no role, show the landing page and login page */}
                {!token || !role ? (
                    <>
                        <Route path="/landing-page" element={<Dashboard />} />
                        <Route path="/login" element={<Login />} />
                    </>
                ) : (
                    <Route path="/" element={<HomePage />} />
                )}

                {/* Use ProtectedRoute for role-based dashboards */}
                <Route 
                    path="/student-dashboard" 
                    element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />} 
                />
                <Route 
                    path="/faculty-dashboard" 
                    element={<ProtectedRoute element={<FacultyDashboard />} requiredRole="faculty" />} 
                />
                <Route 
                    path="/admin-dashboard" 
                    element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
                />

                {/* Redirect to HomePage for unknown routes */}
                <Route path="*" element={<HomePage />} />
            </Routes>
        </Router>
    );
}

export default App;
