import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StudentPerformance from './components/StudentPerformance';
import AttendanceManagement from './components/AttendanceManagement';
import EnhancedAttendanceSystem from './components/EnhancedAttendanceSystem';
import SmartAttendanceAssistant from './components/SmartAttendanceAssistant';
import Communication from './components/Communication';
import Calendar from './components/Calendar';
import BehaviorTrackingNew from './components/BehaviorTrackingNew';
import Assessments from './components/Assessments';
import LearningResources from './components/LearningResources';
import DashboardOverviewModern from './components/DashboardOverviewModern';
import ActivityTracking from './components/ActivityTracking';
import EventsManagement from './components/EventsManagement';
import AITeachingHub from './pages/AITeachingHub';
import { TeacherProvider } from '../../../contexts/TeacherContext';

const TeacherDashboard: React.FC = () => {
  return (
    <TeacherProvider>
      <div className="w-full h-full">
        <Routes>
          <Route index element={<DashboardOverviewModern />} />
          <Route path="ai-hub" element={<AITeachingHub />} />
          <Route path="performance" element={<StudentPerformance />} />
          <Route path="attendance" element={<EnhancedAttendanceSystem />} />
          <Route path="attendance-assistant" element={<SmartAttendanceAssistant onVoiceCommand={() => {}} isListening={false} setIsListening={() => {}} />} />
          <Route path="attendance-legacy" element={<AttendanceManagement />} />
          <Route path="communication" element={<Communication />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="behavior" element={<BehaviorTrackingNew />} />
          <Route path="resources" element={<LearningResources />} />
          <Route path="assessments" element={<Assessments />} />
          <Route path="activities" element={<ActivityTracking />} />
          <Route path="events" element={<EventsManagement />} />
        </Routes>
      </div>
    </TeacherProvider>
  );
};

export default TeacherDashboard;