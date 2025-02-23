import React, { useEffect, useState } from 'react';
import { Outlet, useMatch } from 'react-router-dom';
import { Book, Bell, Calendar, MessageSquare, TrendingUp, Clock, Activity, Award } from 'lucide-react';
import { dashboardService } from '../../../services/dashboardService';
import { authService } from '../../../services/authService';
import { eventService, Event, Assessment } from '../../../services/eventService';
import { learningResourceService } from '../../../services/learningResourceService';

interface Activity {
  activity_name: string;
  badge: string;
}

interface BehaviorRecord {
  sentiment_score: number;
}

interface DashboardData {
  studentName?: string;
  studentId?: number;
  grades?: {
    students: Array<{
      student_id: number;
      student_name: string;
      gender: string;
      subjects: Array<{
        subject: string;
        grades: Array<{
          date: string;
          grade: string;
        }>;
        alert: boolean;
      }>;
    }>;
  };
  attendance?: any;
  activities?: {
    activities: Activity[];
  };
  behavior?: {
    behavior_records: BehaviorRecord[];
  };
}

interface TimeTableEntry {
  id: number;
  class_value: string;
  section: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  subject: string;
  teacher_id: number;
}

const ParentDashboard: React.FC = () => {
  const isIndexRoute = useMatch('/parent/dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [upcomingAssessments, setUpcomingAssessments] = useState<Assessment[]>([]);
  const [timetableData, setTimetableData] = useState<TimeTableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const user = authService.getCurrentUser();
        if (!user) {
          throw new Error('User data not found');
        }

        // Fetch timetable data
        const timetable = await dashboardService.fetchTimeTable();
        setTimetableData(timetable);
        console.log('Timetable data:', timetable);

        const gradesResponse = await dashboardService.fetchGrades(user.id, new Date().toISOString());
        
        // Get data for the specific user
        const data: DashboardData = {
          studentName: gradesResponse.students[0]?.student_name || user.studentName || "Student",
          studentId: gradesResponse.students[0]?.student_id || user.id,
          grades: gradesResponse,
          attendance: await dashboardService.fetchAttendance(user.id, new Date().toISOString()),
          activities: await dashboardService.fetchActivities(user.id),
          behavior: await dashboardService.fetchBehavior(user.id)
        };
        
        // Fetch upcoming events and assessments
        const events = await eventService.getUpcomingEvents(user.class_value, user.section);
        const assessments = await eventService.getUpcomingAssessments(user.class_value, user.section);

        setUpcomingEvents(events);
        setUpcomingAssessments(assessments);
        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isIndexRoute) {
      loadDashboardData();
    }
  }, [isIndexRoute]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    // Convert GMT to IST by adding 5 hours and 30 minutes
    date.setHours(date.getHours() + 5);
    date.setMinutes(date.getMinutes() + 30);
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const getCurrentDaySchedule = (timetableData: TimeTableEntry[]) => {
    if (!timetableData) return [];
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return timetableData
      .filter(entry => entry.day_of_week.toLowerCase() === today.toLowerCase())
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

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

  const getLatestGrade = () => {
    const student = dashboardData.grades?.students[0];
    if (!student?.subjects?.length) return 'N/A';

    let latestGrade = '';
    let latestDate = new Date(0);

    student.subjects.forEach(subject => {
      subject.grades.forEach(grade => {
        const gradeDate = new Date(grade.date);
        if (gradeDate > latestDate) {
          latestDate = gradeDate;
          latestGrade = grade.grade;
        }
      });
    });

    return latestGrade || 'N/A';
  };

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
          <p className="text-2xl font-bold text-yellow-700">{getLatestGrade()}</p>
          <p className="text-sm text-yellow-600 mt-1">Latest grade</p>
        </div>
      </div>

      {/* Recent Updates, Timeline, and Events/Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Timeline */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
            {timetableData ? (
              getCurrentDaySchedule(timetableData).map((period, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-40 flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">{formatTime(period.start_time)} - {formatTime(period.end_time)}</p>
                  </div>
                  <div className="flex-1 ml-4">
                    <p className="font-medium text-gray-900">{period.subject}</p>
                    <p className="text-sm text-gray-500">
                      Class {period.class_value}-{period.section}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p>No schedule available for today</p>
              </div>
            )}
            {timetableData && getCurrentDaySchedule(timetableData).length === 0 && (
              <div className="text-center text-gray-500">
                <p>No classes scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-600">{event.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(event.event_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-500">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Upcoming Assessments */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Assessments</h2>
            <Book className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {upcomingAssessments.map((assessment, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                <Book className="h-5 w-5 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                  <p className="text-xs text-gray-600">{assessment.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(assessment.assessment_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {upcomingAssessments.length === 0 && (
              <p className="text-sm text-gray-500">No upcoming assessments</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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