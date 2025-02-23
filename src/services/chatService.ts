import api from './apiConfig';

interface ChatMessage {
  chat_id: number;
  created_at: string;
  is_read: boolean;
  message: string;
  parent_id: number;
  sender: 'parent' | 'teacher';
  teacher_id: number;
}

class ChatService {
  async sendMessage(data: { teacher_id: number; parent_id: number; message: string }) {
    try {
      console.log('Sending chat payload:', data);
      const response = await api.post('/api/chat', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getParentChats(parentId: number, teacherId: number) {
    try {
      const response = await api.get(`/api/chat/teacher/${teacherId}/parent/${parentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error('Failed to fetch chat history');
    }
  }

  async getTeacherChats(teacherId: number) {
    try {
      console.log('Fetching all chats for teacher:', teacherId);
      const response = await api.get(`/api/chat/teacher/${teacherId}/conversations`);
      console.log('Teacher conversations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher chats:', error);
      throw new Error('Failed to fetch teacher chats');
    }
  }

  async markMessageAsRead(messageId: number) {
    try {
      const response = await api.put(`/api/chat/message/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }
}

export const chatService = new ChatService();
