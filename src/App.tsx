import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { RoleSelectionPage } from './components/login/role-selection/RoleSelectionPage'
import TeacherLogin from './components/login/teacher/TeacherLogin'
import ParentLogin from './components/login/parent/ParentLogin'
import ParentDashboard from './components/dashboard/parent/ParentDashboard'
import AcademicPerformance from './components/dashboard/parent/pages/AcademicPerformance'
import AttendanceBehavior from './components/dashboard/parent/pages/AttendanceBehavior'
import Messages from './components/dashboard/parent/pages/Messages'
import { PrivateRoute } from './components/auth/PrivateRoute'
import DashboardLayout from './components/dashboard/layouts/DashboardLayout'

const ProtectedDashboard = () => {
  return (
    <PrivateRoute>
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    </PrivateRoute>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/select-role" element={<RoleSelectionPage />} />
        <Route path="/auth/teacher" element={<TeacherLogin />} />
        <Route path="/auth/parent" element={<ParentLogin />} />
        
        {/* Nested dashboard routes under a single protected layout */}
        <Route element={<ProtectedDashboard />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />}>
            <Route path="academics" element={<AcademicPerformance />} />
            <Route path="attendance" element={<AttendanceBehavior />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/select-role" replace />} />
      </Routes>
    </Router>
  )
}

export default App
