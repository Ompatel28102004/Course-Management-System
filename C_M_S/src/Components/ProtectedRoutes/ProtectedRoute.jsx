import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredRole }) => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');

    // If user is not logged in, redirect to login page (landing page)
    if (!token) {
        return <Navigate to="/landing-page" replace />;
    }

    // If user is authenticated but the role does not match the required role
    if (requiredRole && role !== requiredRole) {
        return <Navigate to={`/${role}-dashboard`} replace />; // Redirect to their own dashboard
    }

    

    // User is authenticated and authorized to view the component
    return element; 
};

export default ProtectedRoute;
