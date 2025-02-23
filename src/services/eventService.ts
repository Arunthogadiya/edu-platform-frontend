import api from './apiConfig';

export interface Event {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  class_value: string;
  section: string;
}

export interface Assessment {
  id?: number;
  title: string;
  description: string;
  assessment_date: string;
  class_value: string;
  section: string;
}

class EventService {
  async getUpcomingEvents(class_value: string, section: string) {
    try {
      const response = await api.get('/api/events/upcoming', {
        params: { class_value, section }
      });
      // Return the array directly
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  async getPreviousEvents(class_value: string, section: string) {
    try {
      const response = await api.get('/api/events/previous', {
        params: { class_value, section }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching previous events:', error);
      throw error;
    }
  }

  async createEvent(eventData: Event) {
    try {
      const response = await api.post('/api/events', eventData);
      return {
        success: true,
        message: response.data.message || 'Event created successfully'
      };
    } catch (error: any) {
      console.error('Error creating event:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create event'
      };
    }
  }

  // Assessment methods
  async getUpcomingAssessments(class_value: string, section: string) {
    try {
      const response = await api.get('/api/assessments/upcoming', {
        params: { class_value, section }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming assessments:', error);
      throw error;
    }
  }

  async getPreviousAssessments(class_value: string, section: string) {
    try {
      const response = await api.get('/api/assessments/previous', {
        params: { class_value, section }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching previous assessments:', error);
      throw error;
    }
  }

  async createAssessment(assessmentData: Assessment) {
    try {
      const response = await api.post('/api/assessments', assessmentData);
      return {
        success: true,
        message: response.data.message || 'Assessment created successfully'
      };
    } catch (error: any) {
      console.error('Error creating assessment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create assessment'
      };
    }
  }
}

export const eventService = new EventService();
