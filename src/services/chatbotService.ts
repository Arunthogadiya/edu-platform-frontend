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

  async submitVoiceQuery(audioData: string, childId: number): Promise<VoiceQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chatbot/voice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          audio_data: audioData, 
          child_id: childId,
          conversation_id: this.currentConversationId 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store conversation ID if provided
      if (data.conversation_id) {
        this.currentConversationId = data.conversation_id;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to submit voice query:', error);
      throw error;
    }
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage, ChatResponse, VoiceQueryResponse };