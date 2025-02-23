import api from './apiConfig';

export interface LearningResource {
  id?: number;
  title: string;
  description: string;
  audio_data: File | null;
  class_value: string;
  section: string;
}

class LearningResourceService {
  async uploadResource(data: { 
    title: string;
    description: string;
    audio_data: string; // base64 string
    class_value: string;
    section: string;
  }) {
    try {
      const response = await api.post('/api/audio_resources', data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return {
        success: true,
        message: response.data.message || 'Resource uploaded successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Error uploading resource:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload resource'
      };
    }
  }

  async getResources(class_value: string, section: string) {
    try {
      const response = await api.get('/api/audio_resources', {
        params: { class_value, section }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  async deleteResource(resourceId: number) {
    try {
      const response = await api.delete(`/api/audio_resources/${resourceId}`);
      return {
        success: true,
        message: response.data.message || 'Resource deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete resource'
      };
    }
  }
}

export const learningResourceService = new LearningResourceService();
