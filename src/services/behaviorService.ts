import api from './apiConfig';
import { studentApi } from './api/studentApi';

interface BehaviorData {
  date: string;
  category: string;
  score: number;
  notes?: string;
  source: 'school' | 'home';
}

interface BehaviorAnalysis {
  trends: {
    collaboration: number[];
    empathy: number[];
    emotional_regulation: number[];
    dates: string[];
  };
  flags: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
  }[];
  suggestions: {
    area: string;
    recommendation: string;
    activities: string[];
  }[];
}

interface Student {
  id: string;
  name: string;
  behavior: {
    type: string;
    category: string;
    description: string;
    date: string;
  }[];
}

interface ClassBehaviorResponse {
  behaviors: Array<{
    student_id: string;
    student_name: string;
    observation_text: string;
    date: string;
    sentiment_score: number;
    type: 'positive' | 'negative' | 'neutral';
    category?: string;
  }>;
  summary: {
    overall_sentiment: number;
    counts: {
      positive: number;
      negative: number;
      neutral: number;
    };
    categories: {
      [key: string]: number;
    };
  };
}

class BehaviorService {
  async getBehaviorAnalysis(childId: string): Promise<BehaviorAnalysis> {
    const response = await api.get(`/api/dashboard/behaviour`);
    return response.data;
  }

  async getSchoolBehavior(childId: string): Promise<BehaviorData[]> {
    const response = await api.get(`/api/dashboard/behaviour`);
    return response.data;
  }

  async getHomeBehavior(childId: string): Promise<BehaviorData[]> {
    const response = await api.get(`/api/dashboard/behaviour`);
    return response.data;
  }

  async logHomeBehavior(comment: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post('/api/behaviour/home', { 
        observation_text: comment  
      });
      
      return { 
        success: true, 
        message: response.data.message || 'Behavior logged successfully' 
      };
    } catch (error: any) {
      console.error('Error logging home behavior:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to log behavior' 
      };
    }
  }

  async getClassBehavior(class_value: string, section: string) {
    try {
      const response = await api.get('/api/dashboard/behavior', {
        params: { class_value, section }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching class behavior:', error);
      return null;
    }
  }

  async getStudents(classValue: string, section: string): Promise<Student[]> {
    try {
      const students = await studentApi.getStudents(classValue, section);
      // Transform the student data to match our interface
      return students.map(student => ({
        id: student.student_id.toString(),
        name: student.student_name,
        behavior: [] // Initialize empty behavior array - you can fetch behavior separately if needed
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  async logSchoolBehavior(data: {
    student_id: string;
    observation_text: string;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post('/api/behaviour/school', data);
      return {
        success: true,
        message: response.data.message || 'Behavior logged successfully'
      };
    } catch (error: any) {
      console.error('Error logging school behavior:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to log behavior'
      };
    }
  }

  async getClassAnalysis(class_value: string, section: string): Promise<ClassBehaviorResponse> {
    try {
      const response = await api.get('/api/dashboard/behaviour', {
        params: { class_value, section }
      });
      console.log('Raw behavior data:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching class behavior analysis:', error);
      throw error;
    }
  }
}

export const behaviorService = new BehaviorService();
