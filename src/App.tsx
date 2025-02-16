import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { RoleSelectionPage } from './components/login/role-selection/RoleSelectionPage'
import TeacherLogin from './components/login/teacher/TeacherLogin'
import ParentLogin from './components/login/parent/ParentLogin'
import ParentDashboard from './components/dashboard/parent/ParentDashboard'
import AcademicPerformance from './components/dashboard/parent/pages/AcademicPerformance'
import AttendanceBehavior from './components/dashboard/parent/pages/AttendanceBehavior'
import Messages from './components/dashboard/parent/pages/Messages'
import Community from './components/dashboard/parent/pages/Community'
import EduPal from './components/dashboard/parent/EduPal'
import { PrivateRoute } from './components/auth/PrivateRoute'
import DashboardLayout from './components/dashboard/layouts/DashboardLayout'
import { LanguageProvider } from './contexts/LanguageContext'
import './i18n'; // Import i18n configuration
import BehaviorTracker from './components/dashboard/parent/pages/BehaviorTracker';
import TalentProfile from './components/dashboard/parent/pages/TalentProfile';

const ProtectedDashboard = () => {
  return (
    <PrivateRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
      <EduPal />
    </PrivateRoute>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/select-role" element={<RoleSelectionPage />} />
          
          {/* Auth routes */}
          <Route path="/auth">
            <Route path="teacher">
              <Route path="login" element={<TeacherLogin />} />
              <Route path="register" element={<TeacherLogin />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>
            <Route path="parent">
              <Route path="login" element={<ParentLogin />} />
              <Route path="register" element={<ParentLogin />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>
          </Route>
          
          {/* Nested dashboard routes under a single protected layout */}
          <Route element={<ProtectedDashboard />}>
            <Route path="/parent/dashboard" element={<ParentDashboard />}>
              <Route path="academics" element={<AcademicPerformance />} />
              <Route path="attendance" element={<AttendanceBehavior />} />
              <Route path="messages" element={<Messages />} />
              <Route path="community" element={<Community />} />
              <Route path="behavior" element={<BehaviorTracker />} />
              <Route path="talent" element={<TalentProfile />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/select-role" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  )
}

export default App
