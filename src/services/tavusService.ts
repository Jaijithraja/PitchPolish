interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
  created_at: string;
  conversation_name?: string;
}

interface TavusConversationRequest {
  replica_id: string;
  persona_id?: string;
  conversational_context?: string;
  conversation_name?: string;
  callback_url?: string;
  properties?: {
    max_call_duration?: number;
    participant_left_timeout?: number;
    participant_absent_timeout?: number;
    enable_recording?: boolean;
    language?: string;
    apply_greenscreen?: boolean;
  };
}

class TavusService {
  private apiKey = '1a79e4d9c0c64fc295cce4fef918c8ec';
  private replicaId = 'rb17cf590e15';
  private baseUrl = 'https://tavusapi.com/v2';
  private activeConversations = new Set<string>();

  async createConversation(config?: {
    type?: 'pitch' | 'interview';
    duration?: number;
    enableRecording?: boolean;
  }): Promise<TavusConversationResponse> {
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };

    // Enhanced conversation context based on type
    const conversationalContext = config?.type === 'pitch' 
      ? `You are an expert startup pitch coach and investor. Help the user practice their startup pitch by:
         1. Listening carefully to their pitch presentation
         2. Asking clarifying questions about their business model, market, and traction
         3. Providing constructive feedback on clarity, structure, and persuasiveness
         4. Suggesting specific improvements for investor presentations
         5. Helping them anticipate and prepare for investor questions
         Keep the conversation natural, encouraging, and focused on actionable feedback.`
      : `You are an experienced interview coach and hiring manager. Conduct a professional mock interview by:
         1. Asking relevant behavioral and technical questions
         2. Listening carefully to responses and body language
         3. Providing detailed feedback on answer structure and content
         4. Suggesting improvements using frameworks like STAR method
         5. Asking appropriate follow-up questions
         6. Helping build confidence and interview skills
         Be professional, supportive, and provide specific actionable advice.`;

    const data: TavusConversationRequest = {
      replica_id: this.replicaId,
      conversational_context: conversationalContext,
      conversation_name: config?.type === 'pitch' 
        ? 'PitchPolish Startup Pitch Practice Session'
        : 'PitchPolish Interview Practice Session',
      properties: {
        max_call_duration: config?.duration || 600, // 10 minutes default
        participant_left_timeout: 60,
        participant_absent_timeout: 120,
        enable_recording: config?.enableRecording || false,
        language: 'english',
        apply_greenscreen: false
      }
    };

    try {
      console.log('🚀 Creating Tavus conversation...');
      console.log('📡 API Endpoint:', `${this.baseUrl}/conversations`);
      console.log('🔑 API Key:', this.apiKey.substring(0, 8) + '...');
      console.log('🤖 Replica ID:', this.replicaId);
      console.log('📦 Request Data:', JSON.stringify(data, null, 2));
      
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      console.log('📊 Response Status:', response.status);
      console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Tavus API Error Response:', errorText);
        
        // Enhanced error handling with user-friendly messages
        try {
          const errorData = JSON.parse(errorText);
          
          if (errorData.message) {
            if (errorData.message.includes('maximum concurrent conversations')) {
              console.log('🧹 Maximum concurrent conversations reached. Attempting cleanup...');
              await this.cleanupActiveConversations();
              
              // Wait a moment for cleanup to take effect
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Retry once after cleanup
              console.log('🔄 Retrying conversation creation after cleanup...');
              return this.createConversation(config);
            }
            
            if (errorData.message.includes('rate limit')) {
              throw new Error('Too many requests. Please wait a moment before starting a new conversation.');
            }
            
            if (errorData.message.includes('invalid') || errorData.message.includes('not found')) {
              throw new Error('Invalid API configuration. Please check your Tavus settings.');
            }
            
            if (errorData.message.includes('quota') || errorData.message.includes('billing')) {
              throw new Error('Account quota exceeded. Please check your Tavus billing settings.');
            }
            
            if (errorData.message.includes('replica')) {
              throw new Error('Invalid replica ID. Please verify your Tavus replica configuration.');
            }
            
            throw new Error(`Tavus API Error: ${errorData.message}`);
          }
          
          throw new Error(`Tavus API Error: ${errorText}`);
        } catch (parseError) {
          // If we can't parse the error, provide a generic message
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment before starting a new conversation.');
          } else if (response.status === 401) {
            throw new Error('Invalid API key. Please check your Tavus configuration.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Please check your Tavus account permissions.');
          } else if (response.status >= 500) {
            throw new Error('Tavus service is temporarily unavailable. Please try again in a moment.');
          } else {
            throw new Error(`Connection failed (${response.status}). Please check your internet connection and try again.`);
          }
        }
      }

      const result = await response.json();
      console.log('✅ Tavus Response:', result);
      
      // Track this conversation
      if (result.conversation_id) {
        this.activeConversations.add(result.conversation_id);
        console.log('📝 Tracking conversation:', result.conversation_id);
      }
      
      // Ensure we have the conversation_url
      if (!result.conversation_url && result.conversation_id) {
        result.conversation_url = `https://tavus.daily.co/${result.conversation_id}`;
        console.log('🔗 Constructed URL:', result.conversation_url);
      }
      
      // Validate the URL format
      if (result.conversation_url && !result.conversation_url.includes('daily.co')) {
        console.warn('⚠️ Unexpected URL format:', result.conversation_url);
      }
      
      return result;
    } catch (error) {
      console.error('💥 Error creating Tavus conversation:', error);
      throw error;
    }
  }

  async endConversation(conversationId: string): Promise<void> {
    try {
      console.log('🔚 Ending conversation:', conversationId);
      
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });

      // Remove from tracking regardless of response
      this.activeConversations.delete(conversationId);
      console.log('📝 Removed from tracking:', conversationId);

      if (response.ok) {
        console.log('✅ Conversation ended successfully');
      } else {
        const errorText = await response.text();
        console.warn('⚠️ Failed to end conversation:', response.status, errorText);
        // Don't throw error here as the conversation might already be ended
      }
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
      // Remove from tracking even if there was an error
      this.activeConversations.delete(conversationId);
    }
  }

  async cleanupActiveConversations(): Promise<void> {
    console.log('🧹 Starting comprehensive conversation cleanup...');
    
    try {
      // First, get all active conversations from the API
      const apiConversations = await this.listActiveConversations();
      console.log('📋 Found active conversations from API:', apiConversations.length);
      
      // Combine API conversations with locally tracked ones
      const allConversationIds = new Set<string>();
      
      // Add conversations from API
      apiConversations.forEach(conv => {
        if (conv.conversation_id && conv.status !== 'ended') {
          allConversationIds.add(conv.conversation_id);
        }
      });
      
      // Add locally tracked conversations
      this.activeConversations.forEach(id => allConversationIds.add(id));
      
      console.log('🎯 Total conversations to cleanup:', allConversationIds.size);
      console.log('📝 Conversation IDs:', Array.from(allConversationIds));
      
      if (allConversationIds.size === 0) {
        console.log('✅ No active conversations found to cleanup');
        return;
      }
      
      // End all conversations in parallel with some delay between requests
      const cleanupPromises = Array.from(allConversationIds).map(async (conversationId, index) => {
        try {
          // Add a small delay between requests to avoid rate limiting
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          console.log(`🔚 Ending conversation ${index + 1}/${allConversationIds.size}:`, conversationId);
          await this.endConversation(conversationId);
        } catch (error) {
          console.warn('⚠️ Warning cleaning up conversation:', conversationId, error);
        }
      });
      
      await Promise.allSettled(cleanupPromises);
      
      // Clear local tracking
      this.activeConversations.clear();
      
      console.log('✅ Comprehensive cleanup completed');
      
      // Wait a moment for the API to process the cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('❌ Error during comprehensive cleanup:', error);
      
      // Fallback: try to clean up locally tracked conversations
      console.log('🔄 Falling back to local conversation cleanup...');
      const fallbackPromises = Array.from(this.activeConversations).map(async (conversationId) => {
        try {
          await this.endConversation(conversationId);
        } catch (error) {
          console.warn('Warning cleaning up conversation:', conversationId, error);
        }
      });
      
      await Promise.allSettled(fallbackPromises);
      this.activeConversations.clear();
      console.log('✅ Fallback cleanup completed');
    }
  }

  async listActiveConversations(): Promise<any[]> {
    try {
      console.log('📋 Fetching active conversations from API...');
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        const conversations = data.conversations || [];
        console.log('📊 API returned conversations:', conversations.length);
        
        // Filter for active conversations only
        const activeConversations = conversations.filter(conv => 
          conv.status && conv.status !== 'ended' && conv.status !== 'failed'
        );
        
        console.log('🟢 Active conversations:', activeConversations.length);
        return activeConversations;
      } else {
        console.warn('⚠️ Failed to list conversations:', response.status);
        const errorText = await response.text();
        console.warn('⚠️ Error details:', errorText);
        return [];
      }
    } catch (error) {
      console.error('❌ Error listing conversations:', error);
      return [];
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Tavus connection...');
      
      // First try to list conversations (lighter operation)
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      if (response.ok || response.status === 404) {
        console.log('✅ Tavus connection test successful!');
        return true;
      } else if (response.status === 401) {
        console.error('❌ Invalid API key');
        return false;
      } else {
        console.warn('⚠️ Tavus connection test returned:', response.status);
        return response.status < 500; // Consider 4xx as "connected but error"
      }
    } catch (error) {
      console.error('❌ Tavus connection test failed:', error);
      return false;
    }
  }

  // Get conversation analytics/details
  async getConversationDetails(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.warn('Failed to get conversation details:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting conversation details:', error);
      return null;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy', details: any }> {
    try {
      const startTime = Date.now();
      const isConnected = await this.testConnection();
      const responseTime = Date.now() - startTime;
      
      const activeConversations = await this.listActiveConversations();
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        details: {
          connected: isConnected,
          responseTime: `${responseTime}ms`,
          activeConversations: activeConversations.length,
          trackedConversations: this.activeConversations.size,
          apiKey: this.apiKey.substring(0, 8) + '...',
          replicaId: this.replicaId
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          connected: false
        }
      };
    }
  }

  // New method to validate credentials before creating conversation
  async validateCredentials(): Promise<{ valid: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (response.status === 401) {
        return { valid: false, error: 'Invalid API key' };
      }

      if (response.status === 403) {
        return { valid: false, error: 'API key lacks required permissions' };
      }

      if (response.ok || response.status === 404) {
        return { valid: true };
      }

      return { valid: false, error: `Unexpected response: ${response.status}` };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  // New method to check if replica is valid
  async validateReplica(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Try to create a minimal test conversation to validate replica
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          replica_id: this.replicaId,
          conversational_context: 'Test validation',
          properties: {
            max_call_duration: 30 // Very short for validation
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Clean up the test conversation immediately
        if (data.conversation_id) {
          setTimeout(() => this.endConversation(data.conversation_id), 1000);
        }
        return { valid: true };
      } else {
        const errorText = await response.text();
        if (errorText.includes('replica_id')) {
          return { valid: false, error: 'Invalid replica ID' };
        }
        return { valid: false, error: `Validation failed: ${response.status}` };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Validation error' 
      };
    }
  }
}

export const tavusService = new TavusService();
export default TavusService;