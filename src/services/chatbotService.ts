interface ChatMessage {
  id: string;
  query: string;
  response: string;
  timestamp: string;
  resources?: string[];
}

interface ChatResponse {
  response: string;
  resources?: string[];
  conversation_id?: string;
}

interface VoiceQueryResponse extends ChatResponse {
  transcript: string;
}

class ChatbotService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://192.168.0.100:5000/edu-platform/v1';
  private currentConversationId: string | null = null;

  async submitTextQuery(query: string, childId: number): Promise<ChatResponse> {
    try {
      const endpoint = `${this.baseUrl}/api/chatbot/conversation`;
      const payload: any = { query };
      
      if (this.currentConversationId) {
        payload.conversation_id = this.currentConversationId;
      }

      console.log('Sending request to:', endpoint, 'with payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.conversation_id) {
        this.currentConversationId = data.conversation_id;
      }

      return data;
    } catch (error) {
      console.error('Failed to submit query:', error);
      throw error;
    }
  }

  // Reset conversation
  resetConversation() {
    this.currentConversationId = null;
  }

  async fetchChatHistory(userId: number): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/conversation`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      throw error;
    }
  }

  async submitVoiceQuery(audioBase64: string, childId: number): Promise<VoiceQueryResponse> {
    try {
      // Validate base64 data
      if (!audioBase64 || !/^[A-Za-z0-9+/=]+$/.test(audioBase64)) {
        throw new Error('Invalid audio data format');
      }

      const payload = {
        audio_data: audioBase64,
        conversation_id: this.currentConversationId,
        encoding: 'base64',
        format: 'webm'
      };

      console.log('Sending audio data, size:', Math.round(audioBase64.length * 0.75), 'bytes');

      const response = await fetch(`${this.baseUrl}/api/chatbot/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error details:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.conversation_id) {
        this.currentConversationId = data.conversation_id;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to submit voice query:', error);
      // Add more context to the error
      throw new Error(`Voice query failed: ${error.message || 'Unknown error'}`);
    }
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage, ChatResponse, VoiceQueryResponse };