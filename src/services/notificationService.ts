import axios from 'axios';

interface NotificationUpdate {
  type: 'grade' | 'attendance' | 'homework' | 'general';
  message: string;
  timestamp: string;
}

class NotificationService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://192.168.0.100:5000/edu-platform/v1';

  async getImportantUpdates(childId: number | undefined): Promise<NotificationUpdate[]> {
    try {
      if (!childId) {
        console.warn('No child ID provided to getImportantUpdates');
        return [];
      }

      const response = await axios.get(`${this.baseUrl}/api/notifications/important/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch important updates:', error);
      return []; // Return empty array instead of throwing
    }
  }

  generateNotificationMessage(update: NotificationUpdate): string {
    return update.message || 'New update available';
  }
}

export const notificationService = new NotificationService();
export type { NotificationUpdate };

export const fetchNotifications = async (userId: string | undefined) => {
  const response = await api.get(`/users/${userId}/notifications`);
  return response.data;
};