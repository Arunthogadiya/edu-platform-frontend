import api from './apiConfig';

interface Notification {
  id: number;
  type: 'grade' | 'attendance' | 'homework' | 'general';
  message: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

class NotificationService {
  async getImportantUpdates(childId: number): Promise<Notification[]> {
    try {
      const response = await api.get(`/api/notifications/important/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching important updates:', error);
      return [];
    }
  }

  generateNotificationMessage(notification: Notification): string {
    // Format the notification message based on type
    switch (notification.type) {
      case 'grade':
        return `New grade update: ${notification.message}`;
      case 'attendance':
        return `Attendance update: ${notification.message}`;
      case 'homework':
        return `Homework update: ${notification.message}`;
      default:
        return notification.message;
    }
  }
}

export const notificationService = new NotificationService();

export const fetchNotifications = async (userId: string | undefined) => {
  const response = await api.get(`/users/${userId}/notifications`);
  return response.data;
};