// Complete Tavus AI Hosting Utility
// This file provides all the necessary functions to host Tavus conversational AI

interface TavusConfig {
  apiKey: string;
  replicaId: string;
  baseUrl?: string;
}

interface ConversationOptions {
  type?: 'pitch' | 'interview' | 'general';
  duration?: number;
  language?: string;
  enableRecording?: boolean;
  conversationalContext?: string;
  personaId?: string;
}

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
  created_at: string;
}

export class TavusHostingService {
  private config: TavusConfig;
  private activeConversations = new Map<string, TavusConversation>();

  constructor(config: TavusConfig) {
    this.config = {
      baseUrl: 'https://tavusapi.com/v2',
      ...config
    };
  }

  /**
   * Create a new Tavus conversation
   */
  async createConversation(options: ConversationOptions = {}): Promise<TavusConversation> {
    const {
      type = 'general',
      duration = 600,
      language = 'english',
      enableRecording = false,
      conversationalContext,
      personaId = 'default'
    } = options;

    // Generate context based on conversation type
    const context = conversationalContext || this.generateContext(type);

    const requestBody = {
      replica_id: this.config.replicaId,
      persona_id: personaId,
      conversational_context: context,
      conversation_name: `PitchPolish ${type} Session - ${new Date().toISOString()}`,
      properties: {
        max_call_duration: duration,
        participant_left_timeout: 60,
        participant_absent_timeout: 120,
        enable_recording: enableRecording,
        language: language,
        apply_greenscreen: false
      }
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tavus API Error: ${response.status} - ${errorText}`);
      }

      const conversation = await response.json();
      
      // Ensure conversation URL is properly formatted
      if (!conversation.conversation_url && conversation.conversation_id) {
        conversation.conversation_url = `https://tavus.daily.co/${conversation.conversation_id}`;
      }

      // Track the conversation
      this.activeConversations.set(conversation.conversation_id, conversation);

      return conversation;
    } catch (error) {
      console.error('Failed to create Tavus conversation:', error);
      throw error;
    }
  }

  /**
   * End a Tavus conversation
   */
  async endConversation(conversationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey
        }
      });

      // Remove from tracking regardless of response
      this.activeConversations.delete(conversationId);

      if (!response.ok) {
        console.warn(`Failed to end conversation ${conversationId}:`, response.status);
      }
    } catch (error) {
      console.error('Error ending conversation:', error);
      // Still remove from tracking
      this.activeConversations.delete(conversationId);
    }
  }

  /**
   * Get conversation details
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.config.apiKey
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Failed to get conversation: ${response.status}`);
      }
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * List all active conversations
   */
  async listConversations(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.config.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.conversations || [];
      } else {
        throw new Error(`Failed to list conversations: ${response.status}`);
      }
    } catch (error) {
      console.error('Error listing conversations:', error);
      return [];
    }
  }

  /**
   * Clean up all active conversations
   */
  async cleanupAllConversations(): Promise<void> {
    const conversationIds = Array.from(this.activeConversations.keys());
    
    const cleanupPromises = conversationIds.map(id => 
      this.endConversation(id).catch(error => 
        console.warn(`Failed to cleanup conversation ${id}:`, error)
      )
    );

    await Promise.allSettled(cleanupPromises);
    this.activeConversations.clear();
  }

  /**
   * Test connection to Tavus API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.config.apiKey
        }
      });

      return response.ok || response.status === 404; // 404 is also valid (empty list)
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate conversation context based on type
   */
  private generateContext(type: string): string {
    switch (type) {
      case 'pitch':
        return `You are an expert startup pitch coach and investor. Help the user practice their startup pitch by:
        1. Listening carefully to their pitch presentation
        2. Asking clarifying questions about their business model, market, and traction
        3. Providing constructive feedback on clarity, structure, and persuasiveness
        4. Suggesting specific improvements for investor presentations
        5. Helping them anticipate and prepare for investor questions
        Keep the conversation natural, encouraging, and focused on actionable feedback.`;

      case 'interview':
        return `You are an experienced interview coach and hiring manager. Conduct a professional mock interview by:
        1. Asking relevant behavioral and technical questions
        2. Listening carefully to responses and body language
        3. Providing detailed feedback on answer structure and content
        4. Suggesting improvements using frameworks like STAR method
        5. Asking appropriate follow-up questions
        6. Helping build confidence and interview skills
        Be professional, supportive, and provide specific actionable advice.`;

      default:
        return `You are a helpful AI assistant and coach. Engage in natural conversation while:
        1. Listening actively to the user's needs
        2. Providing helpful and constructive feedback
        3. Asking relevant follow-up questions
        4. Maintaining a supportive and encouraging tone
        5. Offering practical advice and suggestions
        Keep the conversation engaging and focused on helping the user achieve their goals.`;
    }
  }

  /**
   * Get active conversations count
   */
  getActiveConversationsCount(): number {
    return this.activeConversations.size;
  }

  /**
   * Get all active conversation IDs
   */
  getActiveConversationIds(): string[] {
    return Array.from(this.activeConversations.keys());
  }
}

// Utility function to create a simple iframe embed
export function createTavusIframe(conversationUrl: string, options: {
  width?: string;
  height?: string;
  allowFullscreen?: boolean;
} = {}): HTMLIFrameElement {
  const {
    width = '100%',
    height = '600px',
    allowFullscreen = true
  } = options;

  const iframe = document.createElement('iframe');
  iframe.src = conversationUrl;
  iframe.style.width = width;
  iframe.style.height = height;
  iframe.style.border = 'none';
  iframe.style.borderRadius = '8px';
  
  if (allowFullscreen) {
    iframe.allow = 'camera; microphone; fullscreen';
  }

  return iframe;
}

// Utility function to embed Tavus in a container
export function embedTavusInContainer(
  containerId: string, 
  conversationUrl: string,
  options?: {
    width?: string;
    height?: string;
    allowFullscreen?: boolean;
  }
): HTMLIFrameElement | null {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with ID '${containerId}' not found`);
    return null;
  }

  const iframe = createTavusIframe(conversationUrl, options);
  container.appendChild(iframe);
  
  return iframe;
}

// Main hosting script for simple integration
export async function hostTavusAI(config: {
  apiKey: string;
  replicaId: string;
  containerId: string;
  conversationType?: 'pitch' | 'interview' | 'general';
  duration?: number;
  enableRecording?: boolean;
}): Promise<{
  conversation: TavusConversation;
  iframe: HTMLIFrameElement;
  cleanup: () => Promise<void>;
}> {
  const tavusService = new TavusHostingService({
    apiKey: config.apiKey,
    replicaId: config.replicaId
  });

  try {
    // Create conversation
    const conversation = await tavusService.createConversation({
      type: config.conversationType || 'general',
      duration: config.duration || 600,
      enableRecording: config.enableRecording || false
    });

    // Embed in container
    const iframe = embedTavusInContainer(
      config.containerId,
      conversation.conversation_url,
      { height: '600px' }
    );

    if (!iframe) {
      throw new Error(`Failed to embed Tavus in container '${config.containerId}'`);
    }

    // Return conversation, iframe, and cleanup function
    return {
      conversation,
      iframe,
      cleanup: async () => {
        await tavusService.endConversation(conversation.conversation_id);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }
    };
  } catch (error) {
    console.error('Failed to host Tavus AI:', error);
    throw error;
  }
}

// Export default instance with your credentials
export const defaultTavusService = new TavusHostingService({
  apiKey: '1a79e4d9c0c64fc295cce4fef918c8ec',
  replicaId: 'rb17cf590e15'
});