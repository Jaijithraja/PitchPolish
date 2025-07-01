import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, Square, Play, RotateCcw, TrendingUp, Clock, MessageCircle, Zap, Bot, ArrowRight, Camera, VideoOff, MicOff, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import AIConversationModal from '../components/AIConversationModal';

export default function PitchPracticePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [permissionErrorType, setPermissionErrorType] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordingMode, setRecordingMode] = useState<'video' | 'audio'>('video');
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<{
    camera?: PermissionState;
    microphone?: PermissionState;
  }>({});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const permissionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const mockFeedback = {
    clarity: 'Good',
    speed: '120 WPM (Optimal)',
    confidence: '7.5/10',
    fillerWords: 3,
    suggestions: [
      'Try adding a more emotional hook at the beginning',
      'Speak 10% slower in the second half',
      'Use more specific metrics when describing achievements',
      'Practice maintaining eye contact with the camera'
    ]
  };

  // Check permission status using the Permissions API
  const checkPermissionStatus = async () => {
    try {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      const newStatus = {
        camera: cameraPermission.state,
        microphone: microphonePermission.state
      };
      
      setPermissionStatus(newStatus);
      
      // If permissions are granted, try to get the media stream
      if (newStatus.camera === 'granted' && newStatus.microphone === 'granted' && recordingMode === 'video') {
        console.log('✅ Both permissions granted, attempting to get video stream...');
        await attemptMediaAccess();
      } else if (newStatus.microphone === 'granted' && recordingMode === 'audio') {
        console.log('✅ Microphone permission granted, attempting to get audio stream...');
        await attemptMediaAccess();
      }
      
      return newStatus;
    } catch (error) {
      console.log('ℹ️ Permissions API not supported, will check during media access');
      return {};
    }
  };

  // Attempt to access media without showing permission prompts
  const attemptMediaAccess = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      if (recordingMode === 'video') {
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        };
      }

      // Clean up existing stream first
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Media access successful!');
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
      
      setMediaStream(stream);
      setHasPermissions(true);
      setPermissionError(null);
      setPermissionErrorType(null);
      
      // Set up video preview
      if (videoRef.current && recordingMode === 'video') {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play failed:', e));
      }

      return stream;
    } catch (error) {
      // Only show error if this was a user-initiated request
      console.log('ℹ️ Media access failed (this may be normal):', error);
      return null;
    }
  };

  // Get browser-specific instructions
  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent;
    const isChrome = userAgent.includes('Chrome') && !userAgent.includes('Edg');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
    const isEdge = userAgent.includes('Edg');

    if (isChrome || isEdge) {
      return {
        browser: isChrome ? 'Chrome' : 'Edge',
        steps: [
          'Click the camera/microphone icon in the address bar',
          'Select "Always allow" for this site',
          'Click "Done" and refresh the page'
        ]
      };
    } else if (isFirefox) {
      return {
        browser: 'Firefox',
        steps: [
          'Click the shield or camera icon in the address bar',
          'Click "Allow" for camera and microphone access',
          'Refresh the page to apply changes'
        ]
      };
    } else if (isSafari) {
      return {
        browser: 'Safari',
        steps: [
          'Go to Safari > Settings > Websites > Camera/Microphone',
          'Set this website to "Allow"',
          'Refresh the page'
        ]
      };
    } else {
      return {
        browser: 'your browser',
        steps: [
          'Look for a camera/microphone icon in your address bar',
          'Click it and select "Allow" for this website',
          'Refresh the page if needed'
        ]
      };
    }
  };

  // Request media permissions - ALWAYS attempt to get permissions
  const requestPermissions = async (mode: 'video' | 'audio', forceRequest = false) => {
    try {
      setIsRequestingPermissions(true);
      setPermissionError(null);
      setPermissionErrorType(null);
      
      console.log(`🎥 Requesting ${mode} permissions...`);
      
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      if (mode === 'video') {
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        };
      }

      // Clean up existing stream first
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('✅ Permissions granted successfully!');
      console.log('📹 Video tracks:', stream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
      
      setMediaStream(stream);
      setHasPermissions(true);
      setPermissionError(null);
      setPermissionErrorType(null);
      
      // Set up video preview
      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play failed:', e));
      }

      // Update permission status
      await checkPermissionStatus();

      return stream;
    } catch (error) {
      // Handle permission errors gracefully - these are expected user interactions, not system errors
      console.log('ℹ️ Media access not granted:', error);
      let errorMessage = 'Failed to access camera/microphone';
      let errorType = 'unknown';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera/microphone access was denied. Please allow access and try again.';
          errorType = 'permission_denied';
          console.log('ℹ️ User denied media permissions - this is normal behavior');
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera/microphone found. Please connect your devices and try again.';
          errorType = 'device_not_found';
          console.log('⚠️ No media devices found');
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera/microphone is already in use by another application.';
          errorType = 'device_in_use';
          console.log('⚠️ Media devices are in use by another application');
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera/microphone settings are not supported by your device.';
          errorType = 'constraints_error';
          console.log('⚠️ Media constraints not supported');
        } else if (error.name === 'SecurityError') {
          errorMessage = 'Access denied due to security restrictions.';
          errorType = 'security_error';
          console.log('⚠️ Security restrictions prevent media access');
        } else {
          console.log('⚠️ Unknown media access error:', error.message);
        }
      }
      
      setPermissionError(errorMessage);
      setPermissionErrorType(errorType);
      setHasPermissions(false);
      return null;
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  // Auto-check permissions on mount and set up periodic checking
  useEffect(() => {
    const initializePermissions = async () => {
      console.log('🎥 Initializing permission checking...');
      
      // Initial check
      await checkPermissionStatus();
      
      // Set up periodic checking every 2 seconds to detect when user grants permissions
      permissionCheckInterval.current = setInterval(async () => {
        const status = await checkPermissionStatus();
        
        // If we don't have media stream but permissions are granted, try to get it
        if (!mediaStream && !isRequestingPermissions) {
          if (recordingMode === 'video' && status.camera === 'granted' && status.microphone === 'granted') {
            console.log('🔄 Permissions detected as granted, attempting to get video stream...');
            await attemptMediaAccess();
          } else if (recordingMode === 'audio' && status.microphone === 'granted') {
            console.log('🔄 Microphone permission detected as granted, attempting to get audio stream...');
            await attemptMediaAccess();
          }
        }
      }, 2000);
    };

    initializePermissions();

    // Cleanup interval on unmount
    return () => {
      if (permissionCheckInterval.current) {
        clearInterval(permissionCheckInterval.current);
      }
    };
  }, []); // Run once on mount

  // Handle mode changes
  useEffect(() => {
    const handleModeChange = async () => {
      if (recordingMode && !isRecording) {
        console.log(`🔄 Mode changed to ${recordingMode}, checking permissions...`);
        await checkPermissionStatus();
        
        // If permissions are already granted, get the stream
        if (recordingMode === 'video' && permissionStatus.camera === 'granted' && permissionStatus.microphone === 'granted') {
          await attemptMediaAccess();
        } else if (recordingMode === 'audio' && permissionStatus.microphone === 'granted') {
          await attemptMediaAccess();
        }
      }
    };

    handleModeChange();
  }, [recordingMode]); // Run when recording mode changes

  // Start recording
  const handleStartRecording = async () => {
    try {
      let stream = mediaStream;
      
      // Request permissions if not already granted
      if (!stream) {
        stream = await requestPermissions(recordingMode);
        if (!stream) return;
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9' // Fallback will be handled automatically
      });
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create blob and show feedback
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        console.log('Recording completed, blob size:', blob.size);
        setShowFeedback(true);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setIsRecording(true);
      setShowFeedback(false);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setPermissionError('Failed to start recording. Please try again.');
      setPermissionErrorType('recording_error');
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Reset recording
  const handleReset = () => {
    handleStopRecording();
    setRecordingTime(0);
    setShowFeedback(false);
    recordedChunksRef.current = [];
  };

  // Switch recording mode
  const handleModeSwitch = (mode: 'video' | 'audio') => {
    if (isRecording) return; // Don't switch during recording
    
    console.log(`🔄 Switching to ${mode} mode...`);
    setRecordingMode(mode);
    // The useEffect will handle the permission request
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (permissionCheckInterval.current) {
        clearInterval(permissionCheckInterval.current);
      }
    };
  }, [mediaStream]);

  const handleStartAIPractice = () => {
    setIsAIModalOpen(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enhanced Start Recording Practice function
  const handleStartRecordingPractice = async () => {
    // Scroll to recording section
    document.getElementById('recording-section')?.scrollIntoView({ behavior: 'smooth' });
    
    // Request permissions if not already granted
    if (!hasPermissions) {
      console.log('🎥 Requesting permissions for recording practice...');
      await requestPermissions(recordingMode);
    }
  };

  // FIXED: Retry permissions - Force a new request
  const handleRetryPermissions = async () => {
    console.log('🔄 Retrying permissions...');
    await requestPermissions(recordingMode, true); // Force request
  };

  // Check if we should show permission error
  const shouldShowPermissionError = () => {
    // Don't show error if we have permissions or are currently requesting
    if (hasPermissions || isRequestingPermissions) return false;
    
    // Show error if we have an explicit error
    if (permissionError) return true;
    
    // Show error if permissions are explicitly denied
    if (recordingMode === 'video' && (permissionStatus.camera === 'denied' || permissionStatus.microphone === 'denied')) return true;
    if (recordingMode === 'audio' && permissionStatus.microphone === 'denied') return true;
    
    return false;
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Practice Your Pitch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your practice method: Get real-time feedback from our AI coach or record yourself for self-analysis.
          </p>
        </div>

        {/* Practice Method Selection */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Coach Practice - Featured */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                RECOMMENDED
              </div>
              
              <div className="mb-6">
                <div className="bg-primary-100 p-4 rounded-2xl w-fit mb-4">
                  <Bot className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  🎤 AI Pitch Coach
                </h2>
                <p className="text-gray-700 mb-4">
                  Practice with our Tavus AI coach for real-time conversation, feedback, and interactive coaching.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Live Feedback</span>
                  </div>
                  <p className="text-xs text-gray-600">Get instant coaching during your pitch</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Natural Conversation</span>
                  </div>
                  <p className="text-xs text-gray-600">Speak naturally with AI interviewer</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Smart Questions</span>
                  </div>
                  <p className="text-xs text-gray-600">AI asks follow-up questions</p>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Multiple Modes</span>
                  </div>
                  <p className="text-xs text-gray-600">Video, audio, or text conversation</p>
                </div>
              </div>

              <button
                onClick={handleStartAIPractice}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
              >
                <Bot className="w-6 h-6" />
                <span>Start AI Pitch Practice</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-primary-700">
                  ✨ Powered by Tavus AI • Real-time conversation • Instant feedback
                </p>
              </div>
            </div>

            {/* Traditional Recording */}
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-8">
              <div className="mb-6">
                <div className="bg-gray-100 p-4 rounded-2xl w-fit mb-4">
                  <Video className="w-8 h-8 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  📹 Self-Recording Practice
                </h2>
                <p className="text-gray-700 mb-4">
                  Record yourself presenting your pitch and get AI analysis of your delivery and content.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Self-Paced</span>
                  </div>
                  <p className="text-xs text-gray-600">Practice at your own speed</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Post Analysis</span>
                  </div>
                  <p className="text-xs text-gray-600">Detailed feedback after recording</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Multiple Takes</span>
                  </div>
                  <p className="text-xs text-gray-600">Record as many times as needed</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900">Privacy</span>
                  </div>
                  <p className="text-xs text-gray-600">Practice privately offline</p>
                </div>
              </div>

              <button
                onClick={handleStartRecordingPractice}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
              >
                <Video className="w-6 h-6" />
                <span>Start Recording Practice</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🎥 Record locally • AI analysis • Multiple attempts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Traditional Recording Section */}
        <div id="recording-section" className="grid lg:grid-cols-2 gap-8">
          {/* Recording Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Your Pitch</h2>
              
              {/* Recording Mode Selection */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => handleModeSwitch('video')}
                  disabled={isRecording}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    recordingMode === 'video'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video + Audio</span>
                </button>
                <button
                  onClick={() => handleModeSwitch('audio')}
                  disabled={isRecording}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    recordingMode === 'audio'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Audio Only</span>
                </button>
              </div>

              {/* Enhanced Permission Error - Only show when needed */}
              {shouldShowPermissionError() && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-800 font-semibold">Camera/Microphone Access Needed</span>
                      </div>
                      <p className="text-blue-700 text-sm mb-4">
                        To record your pitch, we need access to your {recordingMode === 'video' ? 'camera and microphone' : 'microphone'}. 
                        This is completely normal and your privacy is protected.
                      </p>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                          <span>How to enable access in {getBrowserInstructions().browser}:</span>
                        </h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                          {getBrowserInstructions().steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-800">
                            💡 <strong>Tip:</strong> Look for a camera or microphone icon in your browser's address bar. This usually appears when a website requests access to your devices.
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleRetryPermissions}
                          disabled={isRequestingPermissions}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                            isRequestingPermissions
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isRequestingPermissions ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Requesting...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Try Again</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => window.location.reload()}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                        >
                          Refresh Page
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera/Mic Preview */}
              <div className="relative bg-gray-900 rounded-2xl aspect-video mb-6 overflow-hidden">
                {recordingMode === 'video' && hasPermissions && mediaStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {recordingMode === 'video' ? (
                      <div className="text-center text-white">
                        <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Camera Preview</p>
                        <p className="text-sm opacity-75">
                          {isRequestingPermissions ? 'Requesting camera access...' :
                           hasPermissions ? 'Setting up camera...' : 
                           'Camera access needed'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center text-white">
                        <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">Audio Recording Mode</p>
                        <p className="text-sm opacity-75">
                          {isRequestingPermissions ? 'Requesting microphone access...' :
                           hasPermissions ? 'Microphone ready' : 
                           'Microphone access needed'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {isRecording && (
                  <>
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Recording</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {formatTime(recordingTime)}
                    </div>
                  </>
                )}

                {hasPermissions && mediaStream && (
                  <div className="absolute bottom-4 left-4 flex space-x-2">
                    {recordingMode === 'video' && mediaStream.getVideoTracks().length > 0 && (
                      <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </div>
                    )}
                    {mediaStream.getAudioTracks().length > 0 && (
                      <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Mic className="w-3 h-3" />
                        <span>Audio</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={!hasPermissions || isRequestingPermissions}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-colors duration-200 flex items-center space-x-2 shadow-lg ${
                      hasPermissions && !isRequestingPermissions
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="bg-red-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    <Square className="h-5 w-5" />
                    <span>Stop Recording</span>
                  </button>
                )}
                <button 
                  onClick={handleReset}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Status Display */}
              <div className="mt-6 text-center">
                {isRequestingPermissions ? (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                      Requesting {recordingMode === 'video' ? 'camera and microphone' : 'microphone'} access...
                    </span>
                  </div>
                ) : hasPermissions ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {recordingMode === 'video' ? 'Camera and microphone ready' : 'Microphone ready'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">
                      {recordingMode === 'video' ? 'Camera and microphone' : 'Microphone'} access needed
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Instructions and Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary-100 p-2 rounded-xl flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Speak your startup pitch or intro answer</h3>
                    <p className="text-sm text-gray-600 mt-1">Keep it concise and focused on your key points</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-secondary-100 p-2 rounded-xl flex-shrink-0">
                    <Clock className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Aim for 60-90 seconds</h3>
                    <p className="text-sm text-gray-600 mt-1">This is the optimal length for most pitches</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-accent-100 p-2 rounded-xl flex-shrink-0">
                    <Zap className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Click Stop to Get Feedback</h3>
                    <p className="text-sm text-gray-600 mt-1">Our AI will analyze your delivery instantly</p>
                  </div>
                </div>
              </div>
            </div>

            {isRecording && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <h3 className="font-semibold text-red-800">Recording in Progress</h3>
                </div>
                <p className="text-red-700 mb-2">Time: {formatTime(recordingTime)}</p>
                <p className="text-sm text-red-600">Speak clearly and maintain good posture for best results.</p>
              </div>
            )}

            {/* Try AI Coach Suggestion */}
            {!isRecording && !showFeedback && (
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-2xl p-6">
                <div className="text-center">
                  <Bot className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                  <h4 className="font-bold text-primary-900 mb-2">Want Real-Time Feedback?</h4>
                  <p className="text-sm text-primary-700 mb-4">
                    Try our AI Pitch Coach for interactive conversation and instant feedback during your pitch.
                  </p>
                  <button
                    onClick={handleStartAIPractice}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Try AI Pitch Coach</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary-600" />
                <span>Your Feedback Summary</span>
              </h2>

              {/* Feedback Metrics */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-success-50 rounded-2xl border border-success-200">
                  <h3 className="font-semibold text-gray-900 mb-1">Voice Clarity</h3>
                  <p className="text-2xl font-bold text-success-600">{mockFeedback.clarity}</p>
                </div>
                <div className="text-center p-4 bg-primary-50 rounded-2xl border border-primary-200">
                  <h3 className="font-semibold text-gray-900 mb-1">Speaking Speed</h3>
                  <p className="text-lg font-bold text-primary-600">{mockFeedback.speed}</p>
                </div>
                <div className="text-center p-4 bg-secondary-50 rounded-2xl border border-secondary-200">
                  <h3 className="font-semibold text-gray-900 mb-1">Confidence Score</h3>
                  <p className="text-2xl font-bold text-secondary-600">{mockFeedback.confidence}</p>
                </div>
                <div className="text-center p-4 bg-warning-50 rounded-2xl border border-warning-200">
                  <h3 className="font-semibold text-gray-900 mb-1">Filler Words</h3>
                  <p className="text-2xl font-bold text-warning-600">{mockFeedback.fillerWords}</p>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Improvement Suggestions</h3>
                <div className="space-y-3">
                  {mockFeedback.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-primary-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                      </div>
                      <p className="text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleReset}
                  className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Practice Again</span>
                </button>
                <button
                  onClick={handleStartAIPractice}
                  className="bg-secondary-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-secondary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Bot className="h-5 w-5" />
                  <span>Try AI Coach</span>
                </button>
                <button className="bg-white text-primary-600 border-2 border-primary-600 px-6 py-3 rounded-2xl font-semibold hover:bg-primary-50 transition-colors duration-200">
                  Save to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Conversation Modal */}
        <AIConversationModal 
          isOpen={isAIModalOpen} 
          onClose={() => setIsAIModalOpen(false)} 
        />
      </div>
    </div>
  );
}