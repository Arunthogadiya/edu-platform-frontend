import api from './apiConfig';

export interface Activity {
  activity_name: string;
  badge: BadgeType;
  date: string;
  description: string;
}

export interface StudentActivity {
  student_id: number;
  student_name: string;
  activities: Activity[];
}

export type BadgeType = 'mvp' | 'gold' | 'silver' | 'bronze' | 'merit';

export const BADGE_COLORS: Record<BadgeType, { bg: string; text: string; border: string }> = {
  mvp: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  gold: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  silver: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  bronze: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  merit: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
};

export const BADGE_LABELS: Record<BadgeType, string> = {
  mvp: 'Most Valuable Performer',
  gold: 'Gold Achievement',
  silver: 'Silver Achievement',
  bronze: 'Bronze Achievement',
  merit: 'Merit Award'
};

class ActivityService {
  async getClassActivities(class_value: string, section: string) {
    try {
      const response = await api.get('/api/dashboard/activities', {
        params: { class_value, section }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  async logActivity(data: {
    student_id: string;
    activity_name: string;
    badge: BadgeType;
    description: string;
  }) {
    try {
      const response = await api.post('/api/dashboard/activities', data);
      return {
        success: true,
        message: response.data.message || 'Activity logged successfully'
      };
    } catch (error: any) {
      console.error('Error logging activity:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to log activity'
      };
    }
  }
}

export const activityService = new ActivityService();
