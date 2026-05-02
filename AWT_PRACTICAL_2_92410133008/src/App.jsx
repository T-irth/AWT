import { useState, useEffect, use } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, data } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TaskProvider } from './contexts/TaskContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskDetail from './components/TaskDetail';

const App = () => {
  // TODO: Q1 - Initialize useState, useEffect for localStorage, Context Providers,
  //       React Router, .env config, and Protected Routes
  return (
    <AuthProvider>
      <TaskProvider>
        <Router>
          <div className="app">
            <Navbar />
            <Routes>
              {/* Student to implement all routes with ProtectedRoute logic */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/new" element={<TaskForm />} />
              <Route path="/tasks/edit:encodedId" element={<TaskForm />} />
              <Route path="/task/:encodedId" element={<TaskDetail />} />
            </Routes>
          </div>
        </Router>
      </TaskProvider>
    </AuthProvider>
  );
};
useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
            
            const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
          
        }
    }, [])

export default App;