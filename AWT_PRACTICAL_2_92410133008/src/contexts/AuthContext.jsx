import { createContext, useContext, useState, useEffect, use } from 'react'

// Q1 + Q4: Implement Authentication with simulated JWT + localStorage
export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // TODO: Student to implement login, register, logout, token handling
    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
    useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
            
            const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
            
        }
    }, [])
    };