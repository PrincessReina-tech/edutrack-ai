import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Grades from './pages/Grades';
import AdminDashboard from './pages/AdminDashboard';
import Prediction from './pages/Prediction';
import Home from './pages/Home';
import './App.css';
import AddStudent from './pages/AddStudent';
import CourseManagement from './pages/CourseManagement';
import EditStudent from './pages/EditStudent';

// Protected route component
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/grades" element={
          <ProtectedRoute allowedRole="student">
            <Grades />
          </ProtectedRoute>
        } />
        <Route path="/prediction" element={
          <ProtectedRoute allowedRole="student">
           <Prediction />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/add-student" element={<AddStudent />} />
        <Route path="/admin/courses" element={<CourseManagement />} />
        <Route path="/admin/edit-student/:id" element={<EditStudent />} />
      </Routes>
    </Router>
  );
}

export default App;