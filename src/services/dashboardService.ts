import axios from 'axios';
import { mockGradesData } from '../data/mockGradesData';
import { MockDataProvider } from '../utils/mockDataProvider';
import type { Grade, SubjectGrades } from '../data/mockGradesData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

class DashboardService {
  private baseUrl = import.meta.env.VITE_API_URL || '/api';
  // Force using mock data
  private useMockData = true;

  async fetchGrades(childId: number, startDate: string): Promise<{ subjects: SubjectGrades[] }> {
    // Always return mock data
    const response = await MockDataProvider.getMockResponse(mockGradesData);
    return response.data || { subjects: [] };
  }

  async fetchAttendance(childId: number, month: string): Promise<{ attendance: AttendanceData[] }> {
    // Always return mock data
    return this.getMockAttendance();
  }

  async fetchActivities(childId: number): Promise<{ activities: ActivityData[] }> {
    // Always return mock data
    return this.getMockActivities();
  }

  async fetchBehavior(childId: number): Promise<BehaviorData> {
    // Always return mock data
    return this.getMockBehavior();
  }

  // Mock data methods for development/demo purposes
  getMockGrades() {
    return {
      subjects: [
        {
          subject: 'Mathematics',
          averageScore: 85,
          grades: [
            { score: 88, assignment: 'Algebra Quiz', date: new Date().toISOString() },
            { score: 92, assignment: 'Geometry Test', date: new Date().toISOString() },
            { score: 85, assignment: 'Trigonometry Quiz', date: new Date().toISOString() }
          ],
          trend: 'up'
        },
        {
          subject: 'Science',
          averageScore: 90,
          grades: [
            { score: 95, assignment: 'Chemistry Lab', date: new Date().toISOString() },
            { score: 88, assignment: 'Physics Test', date: new Date().toISOString() },
            { score: 87, assignment: 'Biology Quiz', date: new Date().toISOString() }
          ],
          trend: 'stable'
        },
        {
          subject: 'English',
          averageScore: 88,
          grades: [
            { score: 85, assignment: 'Essay Writing', date: new Date().toISOString() },
            { score: 90, assignment: 'Literature Analysis', date: new Date().toISOString() },
            { score: 89, assignment: 'Comprehension Test', date: new Date().toISOString() }
          ],
          trend: 'up'
        },
        {
          subject: 'History',
          averageScore: 82,
          grades: [
            { score: 78, assignment: 'World War II Essay', date: new Date().toISOString() },
            { score: 84, assignment: 'Civil Rights Movement', date: new Date().toISOString() },
            { score: 84, assignment: 'Ancient Civilizations', date: new Date().toISOString() }
          ],
          trend: 'down'
        }
      ]
    };
  }

  private getMockAttendance(): { attendance: AttendanceData[] } {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    return {
      attendance: Array.from({ length: daysInMonth }, (_, i) => ({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1).toISOString().split('T')[0],
        status: Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'late'),
        arrival_time: '08:45',
        classes_attended: Math.floor(Math.random() * 2) + 5,
        total_classes: 6
      }))
    };
  }

  private getMockActivities(): { activities: ActivityData[] } {
    return {
      activities: [
        {
          activity_name: 'Math Quiz Champion',
          badge: '🏆',
          date: new Date().toISOString().split('T')[0],
          type: 'academic'
        },
        {
          activity_name: 'Science Fair Participant',
          badge: '🔬',
          date: new Date().toISOString().split('T')[0],
          type: 'academic'
        },
        {
          activity_name: 'Sports Day Winner',
          badge: '🏅',
          date: new Date().toISOString().split('T')[0],
          type: 'sports'
        }
      ]
    };
  }

  private getMockBehavior(): BehaviorData {
    return {
      date: new Date().toISOString().split('T')[0],
      behavior_records: [
        {
          type: 'Class Participation',
          sentiment_score: 0.85,
          notes: 'Active participation in class discussions'
        },
        {
          type: 'Homework Completion',
          sentiment_score: 0.95,
          notes: 'Consistently submits homework on time'
        },
        {
          type: 'Peer Interaction',
          sentiment_score: 0.75,
          notes: 'Works well in group activities'
        }
      ]
    };
  }
}

export const dashboardService = new DashboardService();

// Replace API functions with mock data
export const fetchAttendance = async (userId: string) => {
  return dashboardService.getMockAttendance();
};

export const fetchActivities = async (userId: string) => {
  return dashboardService.getMockActivities();
};

export const fetchBehavior = async (userId: string) => {
  return dashboardService.getMockBehavior();
};