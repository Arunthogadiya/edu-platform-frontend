import React, { useEffect, useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import { Book, Bell, Calendar, MessageSquare, TrendingUp, Clock, Activity, Award } from 'lucide-react';
import { dashboardService } from '../../../services/dashboardService';

interface Activity {
  activity_name: string;
  badge: string;
}

interface BehaviorRecord {
  sentiment_score: number;
}

interface DashboardData {
  studentName?: string;
  grades?: any;
  attendance?: any;
  activities?: {
    activities: Activity[];
  };
  behavior?: {
    behavior_records: BehaviorRecord[];
  };
}

const MOCK_TIMELINE = [
  { time: '8:45 AM', event: 'Arrived at school', type: 'attendance' },
  { time: '9:00 AM', event: 'Mathematics Class', type: 'class' },
  { time: '10:30 AM', event: 'Science Test', type: 'assessment' },
  { time: '12:00 PM', event: 'Lunch Break', type: 'break' },
  { time: '1:00 PM', event: 'English Class', type: 'class' },
];

const ParentDashboard: React.FC = () => {
  const isIndexRoute = useMatch('/parent/dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get mock data directly
        const data = {
          studentName: "John Smith", // Add mock student name
          grades: dashboardService.getMockGrades(),
          attendance: dashboardService.getMockAttendance(),
          activities: dashboardService.getMockActivities(),
          behavior: dashboardService.getMockBehavior()
        };
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isIndexRoute) {
      loadDashboardData();
    }
  }, [isIndexRoute]);

  if (!isIndexRoute) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Student Name Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{dashboardData.studentName}'s Education Portal</h1>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-900">Today's Classes</h3>
            <Clock className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-700">6/6</p>
          <p className="text-sm text-purple-600 mt-1">Classes completed</p>
        </div>

        <div className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-900">Attendance</h3>
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-700">Present</p>
          <p className="text-sm text-green-600 mt-1">On time - 8:45 AM</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Activities</h3>
            <Activity className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {dashboardData.activities?.activities?.length || 3}
          </p>
          <p className="text-sm text-blue-600 mt-1">Active participations</p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-yellow-900">Performance</h3>
            <Award className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-700">A+</p>
          <p className="text-sm text-yellow-600 mt-1">Overall grade</p>
        </div>
      </div>

      {/* Recent Updates and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Timeline */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Timeline</h2>
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-6">
            {MOCK_TIMELINE.map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-16 text-sm text-gray-500">{item.time}</div>
                <div className={`w-px h-full mx-4 ${
                  item.type === 'assessment' ? 'bg-yellow-500' :
                  item.type === 'class' ? 'bg-blue-500' :
                  item.type === 'break' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <Bell className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {(dashboardData.activities?.activities || []).map((activity: Activity, index: number) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <Award className="h-5 w-5 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{activity.activity_name}</p>
                  <p className="text-xs text-gray-400 mt-1">Today</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;