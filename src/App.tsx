import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { RoleSelectionPage } from './components/login/role-selection/RoleSelectionPage'
import TeacherLogin from './components/login/teacher/TeacherLogin'
import ParentLogin from './components/login/parent/ParentLogin'
import ParentDashboard from './components/dashboard/parent/ParentDashboard'
import TeacherDashboard from './components/dashboard/teacher/TeacherDashboard'
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
import HelpSupport from './components/dashboard/parent/pages/HelpSupport';
import Activities from './components/dashboard/parent/pages/Activities';
import { AttendanceProvider } from './context/AttendanceContext';
import LearningResources from './components/dashboard/parent/LearningResources';

// Separate components for different dashboard layouts
const ParentDashboardLayout = () => (
  <>
    <DashboardLayout userType="parent">
      <Outlet />
    </DashboardLayout>
    <EduPal />
  </>
);

const TeacherDashboardLayout = () => (
  <DashboardLayout userType="teacher">
    <Outlet />
  </DashboardLayout>
);

function App() {
  return (
    <AttendanceProvider>
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
            
            {/* Parent Dashboard */}
            <Route element={<PrivateRoute><ParentDashboardLayout /></PrivateRoute>}>
              <Route path="/parent/dashboard">
                <Route index element={<ParentDashboard />} />
                <Route path="academics" element={<AcademicPerformance />} />
                <Route path="attendance" element={<AttendanceBehavior />} />
                <Route path="messages" element={<Messages />} />
                <Route path="community" element={<Community />} />
                <Route path="behavior" element={<BehaviorTracker />} />
                <Route path="talent" element={<TalentProfile />} />
                <Route path="helper" element={<HelpSupport />} />
                <Route path="activities" element={<Activities />} />
                <Route path="resources" element={<LearningResources />} />
              </Route>
            </Route>

            {/* Teacher Dashboard */}
            <Route element={<PrivateRoute><TeacherDashboardLayout /></PrivateRoute>}>
              <Route path="/teacher/dashboard/*" element={<TeacherDashboard />} />
            </Route>

            <Route path="/" element={<Navigate to="/select-role" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AttendanceProvider>
  )
}

export default App
