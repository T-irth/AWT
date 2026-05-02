import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Synchronously initialize user + axios header before first render
// This prevents a race condition where API calls on mount fire before
// the header is set (which caused 401 errors in the admin panel).
const getStoredUser = () => {
  try {
    const s = localStorage.getItem('smartcart_user');
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();
if (initialUser?.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialUser.token}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('smartcart_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const register = async (formData) => {
    const { data } = await axios.post('/api/auth/register', formData);
    setUser(data);
    localStorage.setItem('smartcart_user', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartcart_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
