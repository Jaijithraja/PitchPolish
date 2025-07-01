// Tavus Debugging and Diagnostic Utility
// Use this to identify and fix connection issues

interface TavusDebugResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  fix?: string;
}

export class TavusDebugger {
  private apiKey = '1a79e4d9c0c64fc295cce4fef918c8ec';
  private replicaId = 'rb17cf590e15';
  private baseUrl = 'https://tavusapi.com/v2';

  async runFullDiagnostic(): Promise<TavusDebugResult[]> {
    const results: TavusDebugResult[] = [];
    
    console.log('🔍 Starting Tavus diagnostic...');
    
    // Step 1: Test basic connectivity
    results.push(await this.testConnectivity());
    
    // Step 2: Validate API credentials
    results.push(await this.validateCredentials());
    
    // Step 3: Test conversation creation
    results.push(await this.testConversationCreation());
    
    // Step 4: Check Daily.co script loading
    results.push(await this.testDailyScript());
    
    // Step 5: Test CORS and browser restrictions
    results.push(await this.testCORS());
    
    // Step 6: Check for active conversations
    results.push(await this.checkActiveConversations());
    
    return results;
  }

  private async testConnectivity(): Promise<TavusDebugResult> {
    try {
      console.log('🌐 Testing basic connectivity to Tavus...');
      
      const response = await fetch(this.baseUrl, {
        method: 'HEAD',
        mode: 'cors'
      });
      
      return {
        step: 'Connectivity Test',
        status: 'success',
        message: `Successfully reached ${this.baseUrl}`,
        data: { status: response.status }
      };
    } catch (error) {
      return {
        step: 'Connectivity Test',
        status: 'error',
        message: 'Cannot reach Tavus API endpoint',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        fix: 'Check your internet connection and firewall settings'
      };
    }
  }

  private async validateCredentials(): Promise<TavusDebugResult> {
    try {
      console.log('🔑 Validating API credentials...');
      
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      if (response.status === 401) {
        return {
          step: 'Credential Validation',
          status: 'error',
          message: 'Invalid API key',
          data: { apiKey: this.apiKey.substring(0, 8) + '...' },
          fix: 'Get a valid API key from Tavus dashboard'
        };
      }
      
      if (response.status === 403) {
        return {
          step: 'Credential Validation',
          status: 'error',
          message: 'API key lacks required permissions',
          fix: 'Check API key permissions in Tavus dashboard'
        };
      }
      
      if (response.ok || response.status === 404) {
        return {
          step: 'Credential Validation',
          status: 'success',
          message: 'API credentials are valid',
          data: { status: response.status }
        };
      }
      
      return {
        step: 'Credential Validation',
        status: 'warning',
        message: `Unexpected response: ${response.status}`,
        data: { status: response.status }
      };
      
    } catch (error) {
      return {
        step: 'Credential Validation',
        status: 'error',
        message: 'Failed to validate credentials',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        fix: 'Check network connection and API endpoint'
      };
    }
  }

  private async testConversationCreation(): Promise<TavusDebugResult> {
    try {
      console.log('💬 Testing conversation creation...');
      
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          replica_id: this.replicaId,
          conversational_context: 'Test conversation for debugging',
          conversation_name: 'Debug Test',
          properties: {
            max_call_duration: 60,
            participant_left_timeout: 30,
            participant_absent_timeout: 60,
            enable_recording: false,
            language: 'english'
          }
        })
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Failed to create conversation';
        let fix = 'Check API documentation';
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
          
          if (errorMessage.includes('replica_id')) {
            fix = 'Verify replica ID is correct and active';
          } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
            fix = 'Check account quota and billing status';
          } else if (errorMessage.includes('concurrent')) {
            fix = 'End existing conversations or wait for them to timeout';
          }
        } catch (parseError) {
          // Response is not JSON
        }
        
        return {
          step: 'Conversation Creation',
          status: 'error',
          message: errorMessage,
          data: { 
            status: response.status, 
            response: responseText,
            replicaId: this.replicaId 
          },
          fix
        };
      }
      
      const conversationData = JSON.parse(responseText);
      
      // Clean up the test conversation
      if (conversationData.conversation_id) {
        setTimeout(() => {
          this.cleanupTestConversation(conversationData.conversation_id);
        }, 5000);
      }
      
      return {
        step: 'Conversation Creation',
        status: 'success',
        message: 'Successfully created test conversation',
        data: {
          conversationId: conversationData.conversation_id,
          conversationUrl: conversationData.conversation_url,
          replicaId: this.replicaId
        }
      };
      
    } catch (error) {
      return {
        step: 'Conversation Creation',
        status: 'error',
        message: 'Network error during conversation creation',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        fix: 'Check network connection and try again'
      };
    }
  }

  private async testDailyScript(): Promise<TavusDebugResult> {
    try {
      console.log('📦 Testing Daily.co script loading...');
      
      // Check if Daily is already loaded
      if (window.Daily) {
        return {
          step: 'Daily.co Script',
          status: 'success',
          message: 'Daily.co script is already loaded',
          data: { version: window.Daily.version || 'unknown' }
        };
      }
      
      // Test loading the script
      const scriptUrl = 'https://unpkg.com/@daily-co/daily-js@latest';
      const response = await fetch(scriptUrl, { method: 'HEAD' });
      
      if (response.ok) {
        return {
          step: 'Daily.co Script',
          status: 'warning',
          message: 'Daily.co script is accessible but not loaded',
          data: { scriptUrl },
          fix: 'Script should load automatically when needed'
        };
      } else {
        return {
          step: 'Daily.co Script',
          status: 'error',
          message: 'Cannot access Daily.co script',
          data: { scriptUrl, status: response.status },
          fix: 'Check if CDN is blocked or use a different CDN'
        };
      }
      
    } catch (error) {
      return {
        step: 'Daily.co Script',
        status: 'error',
        message: 'Failed to test Daily.co script',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        fix: 'Check network connection and CDN accessibility'
      };
    }
  }

  private async testCORS(): Promise<TavusDebugResult> {
    try {
      console.log('🔒 Testing CORS and browser restrictions...');
      
      // Test a simple CORS request
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'x-api-key'
        }
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };
      
      return {
        step: 'CORS Test',
        status: 'success',
        message: 'CORS preflight successful',
        data: { 
          status: response.status,
          corsHeaders,
          origin: window.location.origin
        }
      };
      
    } catch (error) {
      return {
        step: 'CORS Test',
        status: 'error',
        message: 'CORS restrictions detected',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
        fix: 'API calls may need to be proxied through your backend'
      };
    }
  }

  private async checkActiveConversations(): Promise<TavusDebugResult> {
    try {
      console.log('📊 Checking active conversations...');
      
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const conversations = data.conversations || [];
        
        return {
          step: 'Active Conversations',
          status: conversations.length > 5 ? 'warning' : 'success',
          message: `Found ${conversations.length} active conversations`,
          data: { 
            count: conversations.length,
            conversations: conversations.slice(0, 3) // Show first 3
          },
          fix: conversations.length > 5 ? 'Consider ending old conversations to free up quota' : undefined
        };
      } else {
        return {
          step: 'Active Conversations',
          status: 'error',
          message: 'Failed to list conversations',
          data: { status: response.status }
        };
      }
      
    } catch (error) {
      return {
        step: 'Active Conversations',
        status: 'error',
        message: 'Error checking conversations',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async cleanupTestConversation(conversationId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });
      console.log('🧹 Cleaned up test conversation:', conversationId);
    } catch (error) {
      console.warn('Failed to cleanup test conversation:', error);
    }
  }

  // Quick fix methods
  async quickFix(): Promise<void> {
    console.log('🔧 Running quick fixes...');
    
    // 1. Clean up any stuck conversations
    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'GET',
        headers: { 'x-api-key': this.apiKey }
      });
      
      if (response.ok) {
        const data = await response.json();
        const conversations = data.conversations || [];
        
        // End conversations older than 1 hour
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        for (const conv of conversations) {
          const createdAt = new Date(conv.created_at).getTime();
          if (createdAt < oneHourAgo) {
            await this.cleanupTestConversation(conv.conversation_id);
          }
        }
      }
    } catch (error) {
      console.warn('Quick fix cleanup failed:', error);
    }
    
    // 2. Clear any cached Daily instances
    if (window.Daily) {
      try {
        // Force cleanup of any existing Daily instances
        const existingFrames = document.querySelectorAll('iframe[src*="daily.co"]');
        existingFrames.forEach(frame => frame.remove());
      } catch (error) {
        console.warn('Daily cleanup failed:', error);
      }
    }
  }
}

// Export singleton instance
export const tavusDebugger = new TavusDebugger();

// Utility function to run diagnostics and display results
export async function runTavusDiagnostics(): Promise<void> {
  console.log('🚀 Starting Tavus diagnostics...');
  
  const results = await tavusDebugger.runFullDiagnostic();
  
  console.log('\n📋 TAVUS DIAGNOSTIC RESULTS:');
  console.log('================================');
  
  results.forEach((result, index) => {
    const icon = result.status === 'success' ? '✅' : 
                 result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`\n${index + 1}. ${icon} ${result.step}`);
    console.log(`   ${result.message}`);
    
    if (result.data) {
      console.log('   Data:', result.data);
    }
    
    if (result.fix) {
      console.log(`   💡 Fix: ${result.fix}`);
    }
  });
  
  console.log('\n================================');
  
  // Count issues
  const errors = results.filter(r => r.status === 'error').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  if (errors > 0) {
    console.log(`❌ Found ${errors} critical issues that need fixing`);
  }
  
  if (warnings > 0) {
    console.log(`⚠️ Found ${warnings} warnings to review`);
  }
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ All diagnostics passed! Tavus should be working correctly.');
  }
}