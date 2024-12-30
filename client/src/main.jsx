import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SocketProvider } from './context/SocketContext.jsx'
import { AuthProvider, useAuth } from "./context/authContext.jsx"; // Import the AuthProvider and useAuth hook

const Root = () => {
  const { isLoggedIn } = useAuth(); // Access isLoggedIn from the context
  console.log("isLoggedIn: ", isLoggedIn);

  return (
    <StrictMode>
      {isLoggedIn ? (
        <SocketProvider>
          <App />
        </SocketProvider>
      ) : (
        <App />
      )}
    </StrictMode>
  );
};
createRoot(document.getElementById('root')).render(
  <AuthProvider> 
    <Root />
  </AuthProvider>
)