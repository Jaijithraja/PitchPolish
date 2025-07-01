import { useState, useCallback } from 'react';
import { tavusService } from '../services/tavusService';

interface ConversationConfig {
  type: 'pitch' | 'interview';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  enableRecording: boolean;
}

interface ConversationState {
  isConnecting: boolean;
  isConnected: boolean;
  conversationData: any;
  error: string | null;
}

export const useTavusConversation = () => {
  const [state, setState] = useState<ConversationState>({
    isConnecting: false,
    isConnected: false,
    conversationData: null,
    error: null
  });

  const startConversation = useCallback(async (config: ConversationConfig) => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const conversationData = await tavusService.createConversation({
        type: config.type,
        duration: config.duration,
        enableRecording: config.enableRecording
      });

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        conversationData
      }));

      return conversationData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start conversation';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const endConversation = useCallback(async () => {
    if (state.conversationData?.conversation_id) {
      try {
        await tavusService.endConversation(state.conversationData.conversation_id);
      } catch (error) {
        console.warn('Error ending conversation:', error);
      }
    }

    setState({
      isConnecting: false,
      isConnected: false,
      conversationData: null,
      error: null
    });
  }, [state.conversationData]);

  const getAnalytics = useCallback(async () => {
    if (!state.conversationData?.conversation_id) {
      throw new Error('No active conversation');
    }

    try {
      return await tavusService.getConversationAnalytics(state.conversationData.conversation_id);
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }, [state.conversationData]);

  return {
    ...state,
    startConversation,
    endConversation,
    getAnalytics
  };
};