import axios from 'axios';
import api from './apiConfig';
import { mockGradesData } from '../data/mockGradesData';
import { MockDataProvider } from '../utils/mockDataProvider';
import type { Grade, SubjectGrades } from '../data/mockGradesData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.100:5000/edu-platform/v1';

interface GradeData {
  subject: string;
  score: number;
  date: string;
  trend?: 'up' | 'down' | 'stable';
  comments?: string;
}

interface AttendanceData {
  date: string;
  status: 'present' | 'absent' | 'late';
  arrival_time?: string;
  classes_attended?: number;
  total_classes?: number;
}

interface ActivityData {
  activity_name: string;
  badge: string;
  date: string;
  type: 'academic' | 'extracurricular' | 'sports';
  description?: string;
}

interface BehaviorData {
  date: string;
  behavior_records: Array<{
    type: string;
    sentiment_score: number;
    notes?: string;
  }>;
}

interface Grade {
  date: string;
  grade: string;
}

interface Subject {
  subject: string;
  grades: Grade[];
  alert: boolean;
}

interface Student {
  student_id: number;
  student_name: string;
  gender: string;
  subjects: Subject[];
}

interface GradesResponse {
  students: Student[];
}

interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent';
}

interface StudentAttendance {
  student_id: number;
  student_name: string;
  gender: string;
  attendance: AttendanceRecord[];
}

interface AttendanceResponse {
  students: StudentAttendance[];
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

interface Activity {
  activity_name: string;
  badge: string;
  description: string;
}

interface StudentActivities {
  student_id: number;
  student_name: string;
  gender: string;
  activities: Activity[];
}

interface ActivitiesResponse {
  students: StudentActivities[];
}

interface BehaviorRecord {
  behavior_type: string;
  comment: string;
  date: string;
  sentiment_score: string;
}

interface StudentBehavior {
  student_id: number;
  student_name: string;
  gender: string;
  behavior_records: BehaviorRecord[];
}

interface BehaviorResponse {
  students: StudentBehavior[];
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  role: string;
  subject: string | null;
}

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('Server returned non-JSON response');
  }

  return await response.json();
};

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  avgPerformance: number;
  upcomingTests: number;
}

class DashboardService {
  async fetchGrades(userId: string | number, date?: string): Promise<GradesResponse> {
    try {
      const response = await api.get(`/api/dashboard/grades`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  }

  async fetchAttendance(userId: string | number, date?: string) {
    try {
      const response = await api.get(`/api/dashboard/attendance`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  }

  async fetchActivities(userId: string | number) {
    try {
      const response = await api.get(`/api/dashboard/activities`);
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async fetchBehavior(userId: string | number) {
    try {
      const response = await api.get(`/api/dashboard/behaviour`);
      console.log('Behavior response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching behavior:', error);
      throw error;
    }
  }

  async fetchTimeTable(): Promise<TimeTableEntry[]> {
    try {
      const response = await api.get('/api/dashboard/timetable');
      console.log('Timetable response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      throw new Error('Failed to fetch timetable');
    }
  }

  async fetchTeachers(): Promise<Teacher[]> {
    try {
      // Update the endpoint to match the backend API structure
      const response = await api.get('/teachers');
      console.log('Teachers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw new Error('Failed to fetch teachers data');
    }
  }

  async fetchParents(teacherId: number) {
    try {
      const response = await api.get(`/parents`);
      console.log('Parents list response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching parents:', error);
      throw new Error('Failed to fetch parents list');
    }
  }

  async fetchStudents(class_value: string, section: string) {
    try {
      const response = await axios.get('/api/students', {
        params: {
          class_value,
          section
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getTeacherDashboardStats(class_value: string, section: string): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/dashboard/stats', {
        params: {
          class_value,
          section,
        },
      });
      
      console.log('Dashboard stats response:', response.data);
      return {
        totalStudents: response.data.totalStudents || 0,
        presentToday: response.data.presentToday || 0,
        avgPerformance: response.data.avgPerformance || 0,
        upcomingTests: response.data.upcomingTests || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalStudents: 0,
        presentToday: 0,
        avgPerformance: 0,
        upcomingTests: 0,
      };
    }
  }
}

export const dashboardService = new DashboardService();