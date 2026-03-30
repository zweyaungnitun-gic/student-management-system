// src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';

import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import StudentDetail from './pages/students/StudentDetail';

import TeacherList from './pages/teachers/TeacherList';
import TeacherForm from './pages/teachers/TeacherForm';
import TeacherDetails from './pages/teachers/TeacherDetails';

import CourseList from './pages/courses/CourseList';
import CourseForm from './pages/courses/CourseForm';
import CourseDetails from './pages/courses/CourseDetails';  // Make sure this file exists

import EnrollmentList from './pages/enrollments/EnrollmentList';
import EnrollmentForm from './pages/enrollments/EnrollmentForm';

import TestList from './pages/tests/TestList';
import TestForm from './pages/tests/TestForm';

import ResultList from './pages/results/ResultList';
import ResultForm from './pages/results/ResultForm';

import RegistrationList from './pages/registrations/RegistrationList';
import RegistrationDetail from './pages/registrations/RegistrationDetail';

import ReportList from './pages/reports/ReportList';

import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            },
          }}
        />
        <Routes>
          {/* Redirect root and login to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />

          {/* Main app - no authentication required */}
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />

            {/* Students */}
            <Route path="students">
              <Route index element={<StudentList />} />
              <Route path="new" element={<StudentForm />} />
              <Route path=":id" element={<StudentDetail />} />
              <Route path=":id/edit" element={<StudentForm />} />
            </Route>

            {/* Teachers */}
            <Route path="teachers">
              <Route index element={<TeacherList />} />
              <Route path="new" element={<TeacherForm />} />
              <Route path=":id" element={<TeacherDetails />} />
              <Route path=":id/edit" element={<TeacherForm />} />
            </Route>

            {/* Courses */}
            <Route path="courses">
              <Route index element={<CourseList />} />
              <Route path="new" element={<CourseForm />} />
              <Route path=":id" element={<CourseDetails />} />
              <Route path=":id/edit" element={<CourseForm />} />
            </Route>

            {/* Enrollments */}
            <Route path="enrollments">
              <Route index element={<EnrollmentList />} />
              <Route path="new" element={<EnrollmentForm />} />
              <Route path=":id" element={<EnrollmentForm />} />
            </Route>

            {/* Tests */}
            <Route path="tests">
              <Route index element={<TestList />} />
              <Route path="new" element={<TestForm />} />
              <Route path=":id" element={<TestForm />} />
            </Route>

            {/* Results */}
            <Route path="results">
              <Route index element={<ResultList />} />
              <Route path="new" element={<ResultForm />} />
              <Route path=":id" element={<ResultForm />} />
            </Route>

            {/* Registrations */}
            <Route path="registrations">
              <Route index element={<RegistrationList />} />
              <Route path=":id" element={<RegistrationDetail />} />
            </Route>

            {/* Reports */}
            <Route path="reports" element={<ReportList />} />

            {/* Users */}
            <Route path="users">
              <Route index element={<UserList />} />
              <Route path="new" element={<UserForm />} />
              <Route path=":id/edit" element={<UserForm />} />
            </Route>
          </Route>

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem', color: 'var(--text-primary)' }}>
                <h1 style={{ fontSize: '4rem', margin: 0 }}>404</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;