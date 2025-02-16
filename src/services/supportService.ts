interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  videoUrl?: string;
  lastUpdated: string;
}

interface Guide {
  id: string;
  title: string;
  description: string;
  steps: string[];
  pdfUrl?: string;
  videoUrl?: string;
}

interface SupportTicket {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: File[];
}

interface SystemStatus {
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  components: {
    name: string;
    status: 'operational' | 'degraded' | 'maintenance' | 'outage';
    message?: string;
  }[];
  incidents: {
    id: string;
    title: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    lastUpdate: string;
  }[];
}

class SupportService {
  async getFAQs(category?: string): Promise<FAQ[]> {
    // Mock FAQs
    return [
      {
        id: '1',
        category: 'behavior',
        question: 'How do I log behavior observations?',
        answer: 'Navigate to the Behavior tab, click "Log Observation", and fill in the details...',
        videoUrl: 'https://example.com/tutorials/behavior-logging',
        lastUpdated: '2024-02-20'
      },
      {
        id: '2',
        category: 'talent',
        question: 'Understanding talent scores',
        answer: 'Talent scores are calculated based on multiple factors including...',
        lastUpdated: '2024-02-19'
      }
    ];
  }

  async getGuides(): Promise<Guide[]> {
    // Mock guides
    return [
      {
        id: '1',
        title: 'Getting Started with EduPal',
        description: 'Complete guide for new parents',
        steps: [
          'Set up your profile',
          'Connect with your child\'s school',
          'Enable notifications'
        ],
        pdfUrl: 'https://example.com/guides/getting-started.pdf'
      }
    ];
  }

  async submitTicket(ticket: SupportTicket): Promise<{ ticketId: string }> {
    console.log('Submitting ticket:', ticket);
    return { ticketId: Date.now().toString() };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return {
      status: 'operational',
      components: [
        { name: 'Web App', status: 'operational' },
        { name: 'Notifications', status: 'operational' },
        { name: 'Data Sync', status: 'degraded', message: 'Experiencing delays' }
      ],
      incidents: [
        {
          id: '1',
          title: 'Notification Delays',
          status: 'resolved',
          lastUpdate: new Date().toISOString()
        }
      ]
    };
  }

  async submitFeedback(feedback: {
    type: 'bug' | 'feature' | 'general';
    content: string;
    rating?: number;
  }): Promise<{ success: boolean }> {
    console.log('Submitting feedback:', feedback);
    return { success: true };
  }

  async requestCallback(data: {
    phone: string;
    preferredTime: string;
    issue: string;
  }): Promise<{ requestId: string }> {
    console.log('Requesting callback:', data);
    return { requestId: Date.now().toString() };
  }
}

export const supportService = new SupportService();
