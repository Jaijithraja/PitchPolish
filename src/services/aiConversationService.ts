// Service for integrating with various AI conversation providers

export interface ConversationProvider {
  name: string;
  startConversation: (config: ConversationConfig) => Promise<ConversationSession>;
  endConversation: (sessionId: string) => Promise<void>;
}

export interface ConversationConfig {
  type: 'pitch' | 'interview';
  duration?: number;
  language?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ConversationSession {
  sessionId: string;
  conversationUrl?: string;
  webrtcConfig?: any;
  status: 'connecting' | 'connected' | 'ended';
}

// Tavus API Integration (as shown in your image)
class TavusProvider implements ConversationProvider {
  name = 'Tavus';
  private apiKey: string;
  private baseUrl = 'https://tavus.daily.co';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startConversation(config: ConversationConfig): Promise<ConversationSession> {
    const response = await fetch(`${this.baseUrl}/api/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_type: config.type,
        max_duration: config.duration || 300,
        language: config.language || 'en',
        // Add Tavus-specific configuration
        replica_id: 'rb17cf590e15', // Example from your image
        properties: {
          voice_settings: {
            stability: 0.8,
            similarity_boost: 0.8
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to start Tavus conversation: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      sessionId: data.conversation_id,
      conversationUrl: data.conversation_url,
      status: 'connecting'
    };
  }

  async endConversation(sessionId: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/conversations/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
}

// OpenAI Realtime API Integration
class OpenAIRealtimeProvider implements ConversationProvider {
  name = 'OpenAI Realtime';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async startConversation(config: ConversationConfig): Promise<ConversationSession> {
    // WebSocket connection to OpenAI Realtime API
    const ws = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', [
      'realtime',
      `Bearer.${this.apiKey}`
    ]);

    return new Promise((resolve, reject) => {
      ws.onopen = () => {
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: this.getInstructions(config.type),
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            }
          }
        }));

        resolve({
          sessionId: Date.now().toString(),
          webrtcConfig: { websocket: ws },
          status: 'connected'
        });
      };

      ws.onerror = (error) => {
        reject(new Error('Failed to connect to OpenAI Realtime API'));
      };
    });
  }

  async endConversation(sessionId: string): Promise<void> {
    // Close WebSocket connection
  }

  private getInstructions(type: 'pitch' | 'interview'): string {
    if (type === 'pitch') {
      return `You are an AI pitch coach. Help the user practice their startup pitch by:
      1. Listening to their pitch
      2. Asking clarifying questions
      3. Providing constructive feedback on clarity, structure, and persuasiveness
      4. Suggesting improvements
      Keep the conversation natural and encouraging.`;
    } else {
      return `You are an AI interview coach. Conduct a mock interview by:
      1. Asking relevant interview questions
      2. Listening to responses
      3. Providing feedback on answers
      4. Suggesting improvements
      5. Asking follow-up questions
      Be professional but supportive.`;
    }
  }
}

// Factory function to create the appropriate provider
export function createConversationProvider(
  providerName: 'tavus' | 'openai',
  apiKey: string
): ConversationProvider {
  switch (providerName) {
    case 'tavus':
      return new TavusProvider(apiKey);
    case 'openai':
      return new OpenAIRealtimeProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${providerName}`);
  }
}

// Environment variables you'll need to set:
// REACT_APP_TAVUS_API_KEY=your_tavus_api_key
// REACT_APP_OPENAI_API_KEY=your_openai_api_key