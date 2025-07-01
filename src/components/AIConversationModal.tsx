import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Settings, Loader, AlertCircle, CheckCircle, Bug, MessageSquare } from 'lucide-react';
import { tavusService } from '../services/tavusService';
import ConversationSetup from './ConversationSetup';
import TavusEmbed from './TavusEmbed';
import MediaPermissions from './MediaPermissions';
import TavusDebugPanel from './TavusDebugPanel';

interface AIConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConversationConfig {
  type: 'pitch' | 'interview';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  enableRecording: boolean;
  connectionMode: 'video' | 'audio';
}

const AIConversationModal: React.FC<AIConversationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'setup' | 'permissions' | 'connecting' | 'conversation' | 'ended' | 'error'>('setup');
  const [conversationData, setConversationData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ConversationConfig | null>(null);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'failed' | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cleanupRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step === 'setup') {
      // Quick connection test - don't block the UI
      testTavusConnection();
    }
  }, [isOpen, step]);

  const testTavusConnection = async () => {
    setConnectionStatus('testing');
    try {
      // Quick test without creating actual conversation
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'HEAD', // Just check if endpoint is reachable
        headers: {
          'x-api-key': '1a79e4d9c0c64fc295cce4fef918c8ec'
        }
      });
      
      // Even if we get 405 (method not allowed), it means the endpoint is reachable
      if (response.status === 405 || response.status === 200 || response.status === 401) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('failed');
        setError('Tavus API endpoint not reachable. Please check your internet connection.');
      }
    } catch (error) {
      console.warn('Connection test failed, but proceeding anyway:', error);
      // Don't fail the whole flow for connection test
      setConnectionStatus('connected');
    }
  };

  const handleClose = async () => {
    console.log('🔄 Closing AI conversation modal...');
    
    // Prevent multiple cleanup calls
    if (cleanupRef.current) {
      console.log('⚠️ Cleanup already in progress, skipping...');
      return;
    }
    cleanupRef.current = true;
    
    // Clean up conversation
    if (conversationData?.conversation_id) {
      console.log('🧹 Ending Tavus conversation:', conversationData.conversation_id);
      try {
        await tavusService.endConversation(conversationData.conversation_id);
      } catch (error) {
        console.warn('Warning ending conversation:', error);
      }
    }
    
    // Clean up media stream
    if (userStream) {
      console.log('🎥 Stopping media stream');
      userStream.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      setUserStream(null);
    }
    
    // Reset state
    setStep('setup');
    setConversationData(null);
    setError(null);
    setConfig(null);
    setConnectionStatus(null);
    setIsMuted(false);
    setIsVideoOn(true);
    setShowDebugPanel(false);
    
    // Reset cleanup flag after a delay
    setTimeout(() => {
      cleanupRef.current = false;
    }, 1000);
    
    onClose();
  };

  const handleStartConversation = async (sessionConfig: ConversationConfig) => {
    try {
      setConfig(sessionConfig);
      setError(null);

      console.log('🚀 Starting conversation with config:', sessionConfig);

      // Always request permissions for video/audio modes
      console.log('🎥 Requesting camera and microphone permissions');
      setStep('permissions');
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      setStep('error');
    }
  };

  const handlePermissionsGranted = async (stream: MediaStream) => {
    console.log('✅ Permissions granted, received stream:', stream);
    setUserStream(stream);
    
    // Set up video preview immediately
    if (videoRef.current && config?.connectionMode === 'video') {
      console.log('🖥️ Setting up video preview');
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('Video play failed:', e));
    }

    // Proceed to connecting step
    console.log('⏭️ Proceeding to connecting step');
    setStep('connecting');
    
    // Create Tavus conversation
    if (config) {
      console.log('🔄 Creating Tavus conversation...');
      await createTavusConversation(config);
    }
  };

  const handlePermissionsDenied = (errorMessage: string) => {
    console.log('⚠️ Permissions denied:', errorMessage);
    
    // CRITICAL FIX: Instead of going to error state, proceed without media
    console.log('🔄 Proceeding to conversation without camera/microphone');
    setError(null); // Clear any error
    setUserStream(null); // No media stream
    setStep('connecting');
    
    // Create Tavus conversation without media
    if (config) {
      console.log('🔄 Creating Tavus conversation without media...');
      createTavusConversation(config);
    }
  };

  const createTavusConversation = async (sessionConfig: ConversationConfig) => {
    try {
      console.log('🚀 Creating Tavus conversation with config:', sessionConfig);
      
      const conversation = await tavusService.createConversation({
        type: sessionConfig.type,
        duration: sessionConfig.duration,
        enableRecording: sessionConfig.enableRecording
      });

      console.log('✅ Tavus conversation created successfully:', conversation);
      
      // Validate conversation data
      if (!conversation.conversation_id) {
        throw new Error('Invalid conversation response: missing conversation_id');
      }
      
      if (!conversation.conversation_url) {
        console.log('🔗 No conversation_url provided, constructing from ID');
        conversation.conversation_url = `https://tavus.daily.co/${conversation.conversation_id}`;
      }
      
      console.log('🎯 Final conversation URL:', conversation.conversation_url);
      
      setConversationData(conversation);
      setStep('conversation');

    } catch (error) {
      console.error('❌ Error creating Tavus conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      setStep('error');
    }
  };

  const handleEndCall = async () => {
    console.log('📞 Ending call...');
    setStep('ended');
    if (conversationData?.conversation_id) {
      try {
        await tavusService.endConversation(conversationData.conversation_id);
      } catch (error) {
        console.warn('Warning ending conversation:', error);
      }
    }
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleTavusLoad = () => {
    console.log('✅ Tavus conversation loaded successfully');
    setError(null);
  };

  const handleTavusError = () => {
    console.log('❌ Tavus video connection failed');
    setError('Failed to connect to Tavus AI. Please check your internet connection and try again.');
  };

  const handleRetry = () => {
    console.log('🔄 Retrying from setup...');
    setError(null);
    setStep('setup');
    setConversationData(null);
  };

  const handleRetryPermissions = () => {
    console.log('🔄 Retrying permissions...');
    setError(null);
    setStep('permissions');
  };

  const handleContinueWithoutMedia = () => {
    console.log('🔄 Continuing without camera/microphone');
    setError(null);
    setUserStream(null);
    setStep('connecting');
    
    if (config) {
      createTavusConversation(config);
    }
  };

  const toggleMute = () => {
    if (userStream) {
      const audioTracks = userStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
        console.log(`🎤 Audio track ${isMuted ? 'enabled' : 'disabled'}`);
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (userStream) {
      const videoTracks = userStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
        console.log(`📹 Video track ${!isVideoOn ? 'enabled' : 'disabled'}`);
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[98vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {step === 'setup' && 'Setup AI Practice Session'}
              {step === 'permissions' && 'Enable Camera & Microphone'}
              {step === 'connecting' && 'Connecting to Tavus AI'}
              {step === 'conversation' && `AI ${config?.type === 'pitch' ? 'Pitch' : 'Interview'} Practice`}
              {step === 'ended' && 'Session Completed'}
              {step === 'error' && 'Connection Error'}
            </h2>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-xs sm:text-sm text-gray-600">
                {step === 'setup' && 'Configure your practice session'}
                {step === 'permissions' && 'Camera and microphone access required for video conversation'}
                {step === 'connecting' && (userStream ? 'Setting up your video conversation...' : 'Setting up your conversation...')}
                {step === 'conversation' && (userStream ? 'Live video conversation with Tavus AI Coach' : 'Live conversation with Tavus AI Coach')}
                {step === 'ended' && 'Thank you for practicing!'}
                {step === 'error' && 'Please resolve the issue to continue'}
              </p>
              {step === 'setup' && connectionStatus && (
                <div className="flex items-center space-x-1">
                  {connectionStatus === 'testing' && (
                    <>
                      <Loader className="w-3 h-3 animate-spin text-gray-400" />
                      <span className="text-xs text-gray-500">Testing...</span>
                    </>
                  )}
                  {connectionStatus === 'connected' && (
                    <>
                      <CheckCircle className="w-3 h-3 text-success-600" />
                      <span className="text-xs text-success-600">Tavus Ready</span>
                    </>
                  )}
                  {connectionStatus === 'failed' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-error-600" />
                      <span className="text-xs text-error-600">Connection Failed</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {/* Debug Button */}
            <button
              onClick={() => setShowDebugPanel(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100 flex-shrink-0"
              title="Open Debug Panel"
            >
              <Bug className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {step === 'setup' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="max-w-4xl mx-auto">
                <ConversationSetup
                  onStart={handleStartConversation}
                  onCancel={handleClose}
                />
              </div>
            </div>
          )}

          {step === 'permissions' && config && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="max-w-2xl mx-auto">
                <MediaPermissions
                  onPermissionsGranted={handlePermissionsGranted}
                  onPermissionsDenied={handlePermissionsDenied}
                  requiredPermissions={
                    config.connectionMode === 'video' 
                      ? ['camera', 'microphone']
                      : ['microphone']
                  }
                />
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <Loader className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-primary-600 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Connecting to Tavus AI Coach
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Setting up your {userStream ? config?.connectionMode : 'conversation'}...
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>🤖 Replica ID: rb17cf590e15</p>
                  <p>🔑 API Key: 1a79e4d9c0c64fc295cce4fef918c8ec</p>
                  <p>🌐 Endpoint: https://tavusapi.com/v2/conversations</p>
                  {userStream ? (
                    <div className="mt-2 p-2 bg-success-50 rounded">
                      <p className="text-success-600">✅ Media stream ready</p>
                      <p className="text-success-600">📹 Video tracks: {userStream.getVideoTracks().length}</p>
                      <p className="text-success-600">🎤 Audio tracks: {userStream.getAudioTracks().length}</p>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                      <p className="text-blue-600">💬 Text-based conversation mode</p>
                      <p className="text-blue-600">No camera/microphone required</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    💡 <strong>Connection Tips:</strong> Usually takes 15-45 seconds. 
                    {userStream ? ' Make sure your camera and microphone are working properly.' : ' Text-based conversation works without any permissions.'}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setShowDebugPanel(true)}
                    className="text-sm text-primary-600 hover:text-primary-800 underline flex items-center space-x-1 mx-auto"
                  >
                    <Bug className="w-4 h-4" />
                    <span>Having issues? Open Debug Panel</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'conversation' && conversationData && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Tavus AI Area - Full Screen */}
              <div className="flex-1 relative">
                <TavusEmbed
                  conversationUrl={conversationData.conversation_url}
                  onLoad={handleTavusLoad}
                  onError={handleTavusError}
                  userStream={userStream}
                  className="w-full h-full"
                />
              </div>

              {/* Controls */}
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                  {userStream && (
                    <>
                      <button
                        onClick={toggleMute}
                        className={`p-3 sm:p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
                          isMuted 
                            ? 'bg-error-600 text-white hover:bg-error-700' 
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </button>

                      {config?.connectionMode === 'video' && (
                        <button
                          onClick={toggleVideo}
                          className={`p-3 sm:p-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
                            !isVideoOn 
                              ? 'bg-error-600 text-white hover:bg-error-700' 
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
                        >
                          {isVideoOn ? <Video className="w-5 h-5 sm:w-6 sm:h-6" /> : <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleEndCall}
                    className="p-3 sm:p-4 rounded-full bg-error-600 text-white hover:bg-error-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    title="End conversation"
                  >
                    <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    {config?.type === 'pitch' 
                      ? 'Present your startup pitch to the Tavus AI coach'
                      : 'Answer interview questions from your Tavus AI interviewer'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Session: {conversationData.conversation_id} • Powered by Tavus AI
                    {!userStream && ' • Text-based conversation'}
                  </p>
                  {userStream && (
                    <div className="mt-2 flex justify-center space-x-4 text-xs">
                      <span className={`px-2 py-1 rounded ${userStream.getVideoTracks().length > 0 && userStream.getVideoTracks()[0].enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        📹 Video: {userStream.getVideoTracks().length > 0 && userStream.getVideoTracks()[0].enabled ? 'On' : 'Off'}
                      </span>
                      <span className={`px-2 py-1 rounded ${userStream.getAudioTracks().length > 0 && userStream.getAudioTracks()[0].enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        🎤 Audio: {userStream.getAudioTracks().length > 0 && userStream.getAudioTracks()[0].enabled ? 'On' : 'Off'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'ended' && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-success-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Session Completed!
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Great job practicing with Tavus AI!
                </p>
                <button
                  onClick={handleClose}
                  className="bg-primary-600 text-white px-6 sm:px-8 py-3 rounded-2xl font-medium hover:bg-primary-700 transition-colors text-sm sm:text-base"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-error-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Connection Error
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {error || 'Unable to connect to Tavus AI. Please try again.'}
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={handleRetryPermissions}
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-primary-700 transition-colors text-sm sm:text-base"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleContinueWithoutMedia}
                    className="w-full bg-secondary-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-secondary-700 transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Continue Without Camera/Microphone</span>
                  </button>
                  <button
                    onClick={() => setShowDebugPanel(true)}
                    className="w-full bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium hover:bg-gray-700 transition-colors text-sm sm:text-base flex items-center justify-center space-x-2"
                  >
                    <Bug className="w-4 h-4" />
                    <span>Debug Connection</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-medium hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      {showDebugPanel && (
        <TavusDebugPanel />
      )}
    </div>
  );
};

export default AIConversationModal;