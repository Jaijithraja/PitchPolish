import { useState, useCallback } from 'react';

interface ConversationConfig {
  type: 'pitch' | 'interview';
  duration?: number;
  apiKey?: string;
}

export const useAIConversation = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startConversation = useCallback(async (config: ConversationConfig) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Example integration with Tavus API (as shown in your image)
      const response = await fetch('/api/start-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey || process.env.REACT_APP_TAVUS_API_KEY}`
        },
        body: JSON.stringify({
          type: config.type,
          duration: config.duration || 300, // 5 minutes default
          // Add other configuration options
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      
      // Handle the response - typically contains conversation URL or WebRTC details
      setIsConnected(true);
      return data;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const endConversation = useCallback(async () => {
    setIsConnected(false);
    // Add cleanup logic here
  }, []);

  return {
    isConnecting,
    isConnected,
    error,
    startConversation,
    endConversation
  };
};