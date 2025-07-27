interface ChatResponse {
  text: string;
  session_id: string;
}

interface WebSocketMessage {
  type?: 'audio' | 'text' | 'status' | 'error';
  mime_type?: string;
  data?: any;
  message?: string;
  audio_data?: string;
  response?: string;
  role?: string;
  turn_complete?: boolean;
}

class AITeachingHubService {
  private wsConnection: WebSocket | null = null;
  private wsBaseUrl = 'wss://teacher-agent-939627319138.asia-south1.run.app';
  private httpBaseUrl = 'https://teacher-agent-939627319138.asia-south1.run.app';
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private currentMessageId: string | null = null; // Track current streaming message

  // HTTP Chat API for text and images
  async sendChatMessage(message: string, sessionId: string, imageData?: string, imageMimeType?: string): Promise<ChatResponse> {
    try {
      const requestBody: any = {
        message,
        session_id: sessionId
      };

      if (imageData) {
        requestBody.image_data = imageData;
        requestBody.image_mime_type = imageMimeType || 'image/jpeg';
      }

      const response = await fetch(`${this.httpBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.response,
        session_id: data.session_id
      };
    } catch (error) {
      console.error('HTTP chat error:', error);
      throw error;
    }
  }

  // Delete session API
  async deleteSession(sessionId: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.httpBaseUrl}/api/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Delete session error:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time audio
  connectWebSocket(sessionId: string, isAudio: boolean = true, audioInputOnly: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.wsBaseUrl}/ws/${sessionId}?is_audio=${isAudio}&audio_input_only=${audioInputOnly}`;
        this.wsConnection = new WebSocket(wsUrl);

        this.wsConnection.onopen = () => {
          console.log(`WebSocket connected for session ${sessionId}`);
          resolve();
        };

        this.wsConnection.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleWebSocketMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.wsConnection.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.wsConnection = null;
        };

        this.wsConnection.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnectWebSocket(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.messageHandlers.clear();
  }

  sendAudioData(audioData: ArrayBuffer): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      // Convert ArrayBuffer to base64
      const base64Audio = this.arrayBufferToBase64(audioData);
      
      // Format message according to backend expectations
      const message = {
        mime_type: "audio/pcm",
        data: base64Audio
      };
      
      this.wsConnection.send(JSON.stringify(message));
    }
  }

  sendTextMessage(message: string): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      // Format message according to backend expectations
      const wsMessage = {
        mime_type: "text/plain",
        data: message,
        role: "user"
      };
      
      this.wsConnection.send(JSON.stringify(wsMessage));
    }
  }

  // Message handler registration
  onMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    console.log('[AGENT TO CLIENT]', message);

    // Handle turn completion
    if (message.turn_complete && message.turn_complete === true) {
      this.currentMessageId = null;
      const handler = this.messageHandlers.get('turn_complete');
      if (handler) {
        handler(message);
      }
      return;
    }

    // Handle messages based on mime_type (backend format) or type (frontend format)
    const messageType = message.mime_type || message.type;
    
    if (messageType === 'audio/pcm') {
      const handler = this.messageHandlers.get('audio');
      if (handler) {
        handler({
          ...message,
          type: 'audio'
        });
      }
    } else if (messageType === 'text/plain') {
      const handler = this.messageHandlers.get('text');
      if (handler) {
        handler({
          ...message,
          type: 'text',
          response: message.data,
          role: message.role,
          isStreaming: !message.turn_complete,
          messageId: this.currentMessageId
        });
      }
    } else if (message.type) {
      // Handle other message types (status, error)
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      }
    }

    // Call generic message handler if exists
    const genericHandler = this.messageHandlers.get('*');
    if (genericHandler) {
      genericHandler(message);
    }
  }

  setCurrentMessageId(id: string | null): void {
    this.currentMessageId = id;
  }

  getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  isWebSocketConnected(): boolean {
    return this.wsConnection !== null && this.wsConnection.readyState === WebSocket.OPEN;
  }
}

export const aiTeachingHubService = new AITeachingHubService();
