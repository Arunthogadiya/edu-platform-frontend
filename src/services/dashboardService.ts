import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface GradeResponse {
  subjects: Array<{
    subject: string;
    grades: Array<{ grade: string }>;
  }>;
}

interface AttendanceResponse {
  attendance: Array<{
    date: string;
    status: string;
  }>;
}

interface ActivityResponse {
  activities: Array<{
    activity_name: string;
    badge: string;
  }>;
}

interface BehaviorResponse {
  behavior_records: Array<{
    behavior_type: string;
    sentiment_score: number;
  }>;
}

interface VoiceQueryResponse {
  result: {
    subject: string;
    grades: Array<{ grade: string }>;
  };
}

export const dashboardService = {
  async fetchGrades(childId: number, startDate: string): Promise<GradeResponse> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/grades`, {
      params: { child_id: childId, start_date: startDate }
    });
    return response.data;
  },

  async fetchAttendance(childId: number, month: string): Promise<AttendanceResponse> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/attendance`, {
      params: { child_id: childId, month }
    });
    return response.data;
  },

  async fetchActivities(childId: number): Promise<ActivityResponse> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/activities`, {
      params: { child_id: childId }
    });
    return response.data;
  },

  async fetchBehavior(childId: number): Promise<BehaviorResponse> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/behavior`, {
      params: { child_id: childId }
    });
    return response.data;
  },

  async submitVoiceQuery(userId: number, studentId: number, command: string): Promise<VoiceQueryResponse> {
    const response = await axios.post(`${API_BASE_URL}/dashboard/voice-query`, {
      user_id: userId,
      student_ID: studentId,
      command
    });
    return response.data;
  }
};