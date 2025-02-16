interface EducationUpdate {
  type: 'grade' | 'attendance' | 'behavior' | 'homework' | 'event';
  priority: 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  data?: any;
}

const DUMMY_NOTIFICATIONS = [
  {
    type: 'grade',
    priority: 'high',
    message: 'New Math Test Result',
    timestamp: new Date(),
    data: { subject: 'Mathematics', score: 85 }
  },
  {
    type: 'attendance',
    priority: 'medium',
    message: 'Present today',
    timestamp: new Date(),
    data: { status: 'present' }
  },
  {
    type: 'homework',
    priority: 'high',
    message: 'Science project due tomorrow',
    timestamp: new Date(),
    data: { subject: 'Science' }
  }
] as EducationUpdate[];

class NotificationService {
  private lastUpdateCheck: number = 0;
  private updateInterval: number = 30000; // 30 seconds
  private cachedUpdates: EducationUpdate[] = DUMMY_NOTIFICATIONS;
  private baseUrl = import.meta.env.VITE_API_URL || '/api';  // Allow configuration via env

  private static checkThresholds(value: number, type: string): boolean {
    const thresholds = {
      grade: 70,
      attendance: 90,
      behavior: 7
    };
    return value < thresholds[type as keyof typeof thresholds];
  }

  async getImportantUpdates(childId: number, force: boolean = false): Promise<EducationUpdate[]> {
    // Return dummy data immediately
    return this.cachedUpdates;
  }

  generateNotificationMessage(update: EducationUpdate): string {
    const prefix = this.getPriorityPrefix(update.priority);
    
    switch (update.type) {
      case 'grade':
        return `${prefix} New grade posted: ${update.data.subject} - ${update.data.score}%`;
      case 'attendance':
        return `${prefix} Attendance alert: ${update.message}`;
      case 'homework':
        return `${prefix} Homework reminder: ${update.message}`;
      case 'behavior':
        return `${prefix} Behavior note: ${update.message}`;
      case 'event':
        return `${prefix} Upcoming event: ${update.message}`;
      default:
        return `${prefix} ${update.message}`;
    }
  }

  private getPriorityPrefix(priority: string): string {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '📌';
    }
  }

  shouldShowUpdate(update: EducationUpdate): boolean {
    if (update.priority === 'high') return true;
    
    const updateTime = new Date(update.timestamp).getTime();
    const now = Date.now();
    const hoursSinceUpdate = (now - updateTime) / (1000 * 60 * 60);
    
    switch (update.priority) {
      case 'medium':
        return hoursSinceUpdate <= 24; // Show medium priority updates for 24 hours
      case 'low':
        return hoursSinceUpdate <= 12; // Show low priority updates for 12 hours
      default:
        return hoursSinceUpdate <= 6; // Default to 6 hours
    }
  }
}

export const notificationService = new NotificationService();

export const fetchNotifications = async (userId: string | undefined) => {
  // Return dummy notifications without API call
  return { notifications: DUMMY_NOTIFICATIONS };
};