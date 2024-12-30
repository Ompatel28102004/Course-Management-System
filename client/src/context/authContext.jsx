import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn"));
    const login = () => {
        setIsLoggedIn(true);
    };
    

    return (
        <AuthContext.Provider value={{login,isLoggedIn}}>
            {children}
        </AuthContext.Provider>
    );
};
