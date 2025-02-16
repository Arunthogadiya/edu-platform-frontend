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
}

interface VoiceQueryResponse extends ChatResponse {
  transcript: string;
}

const MOCK_CHAT_HISTORY: ChatMessage[] = [
  {
    id: '1',
    query: "How is my child doing in Math?",
    response: "Based on recent assessments, your child is performing well in Mathematics with an average of 90%. They've shown particular strength in Algebra.",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resources: ["Mathematics Progress Report", "Recent Quiz Results"]
  },
  {
    id: '2',
    query: "Any upcoming tests?",
    response: "Yes, there's a Science test scheduled for next week covering recent Chemistry topics. The study materials have been shared in the student portal.",
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    resources: ["Test Schedule", "Study Materials"]
  }
];

class ChatbotService {
  private baseUrl = import.meta.env.VITE_API_URL || '/api/chatbot';
  private useMockData = true; // Set to true while backend is not available

  async submitTextQuery(query: string, childId: number): Promise<ChatResponse> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      return {
        response: `Here's a simulated response for your query about: ${query}. Since the backend is not available, I'm providing general guidance. You can check the dashboard for detailed information.`,
        resources: ["Dashboard Overview", "Academic Calendar"]
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query, child_id: childId })
      });

      // Check for non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to submit query:', error);
      return {
        response: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
        resources: []
      };
    }
  }

  async fetchChatHistory(userId: number): Promise<ChatMessage[]> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      return MOCK_CHAT_HISTORY;
    }

    try {
      const response = await fetch(`${this.baseUrl}/history?user_id=${userId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Check for non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.history || [];
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      return []; // Return empty history on error
    }
  }

  async submitVoiceQuery(audioData: string, childId: number): Promise<VoiceQueryResponse> {
    if (this.useMockData) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate voice processing delay
      return {
        response: "I've processed your voice input. While the backend is not available, I can help you navigate the dashboard and provide general information.",
        transcript: "Show me my child's progress",
        resources: []
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/voice-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ audio_data: audioData, child_id: childId })
      });

      // Check for non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to submit voice query:', error);
      return {
        response: "I'm sorry, I couldn't process your voice input. Please try again or type your question.",
        transcript: "",
        resources: []
      };
    }
  }
}

export const chatbotService = new ChatbotService();
export type { ChatMessage, ChatResponse, VoiceQueryResponse };