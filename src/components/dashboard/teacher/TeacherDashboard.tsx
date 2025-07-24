import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentPerformance from './components/StudentPerformance';
import PerformanceStats from './components/PerformanceStats';
import AttendanceManagement from './components/AttendanceManagement';
import EnhancedAttendanceSystem from './components/EnhancedAttendanceSystem';
import Communication from './components/Communication';
import Calendar from './components/Calendar';
import BehaviorTracking from './components/BehaviorTracking';
import Assessments from './components/Assessments';
import LearningResources from './components/LearningResources';
import DashboardOverviewModern from './components/DashboardOverviewModern';
import ActivityTracking from './components/ActivityTracking';
import EventsManagement from './components/EventsManagement';

const TeacherDashboard: React.FC = () => {
  return (
    <div className="w-full h-full">
      <Routes>
        <Route index element={<DashboardOverviewModern />} />
        <Route path="performance" element={<StudentPerformance />} />
        <Route path="attendance" element={<EnhancedAttendanceSystem />} />
        <Route path="attendance-legacy" element={<AttendanceManagement />} />
        <Route path="communication" element={<Communication />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="behavior" element={<BehaviorTracking />} />
        <Route path="resources" element={<LearningResources />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="resources" element={<LearningResources />} />
        <Route path="activities" element={<ActivityTracking />} />
        <Route path="events" element={<EventsManagement />} />
      </Routes>
    </div>
  );
};

export default TeacherDashboard;