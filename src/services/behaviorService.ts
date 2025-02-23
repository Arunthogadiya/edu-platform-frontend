import api from './apiConfig';

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
}

export const behaviorService = new BehaviorService();
