import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader, AlertCircle, RefreshCw, ExternalLink, Video, Mic, Users, CheckCircle, Wifi, WifiOff, MessageSquare, Clock } from 'lucide-react';

interface TavusEmbedProps {
  conversationUrl: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  userStream?: MediaStream | null;
}

declare global {
  interface Window {
    Daily: any;
  }
}

const TavusEmbed: React.FC<TavusEmbedProps> = ({ 
  conversationUrl, 
  onLoad, 
  onError, 
  className = "",
  userStream
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const callFrameRef = useRef<any>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(true);
  const initializingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptRef = useRef(0);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const corsCheckRef = useRef(false);
  const popupWindowRef = useRef<Window | null>(null);
  
  const [loadingState, setLoadingState] = useState<'loading' | 'loaded' | 'error' | 'redirecting'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [dailyLoaded, setDailyLoaded] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState('Initializing...');
  const [participantCount, setParticipantCount] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<'good' | 'poor' | 'unknown'>('unknown');
  const [connectionStage, setConnectionStage] = useState<'script' | 'frame' | 'join' | 'connected'>('script');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [timeoutCountdown, setTimeoutCountdown] = useState<number | null>(null);
  const [userVideoMinimized, setUserVideoMinimized] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Enhanced cleanup function with proper error handling
  const cleanupDaily = useCallback(async () => {
    console.log('🧹 Starting Daily cleanup...');
    
    // Clear any active timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    
    // Close popup window if open
    if (popupWindowRef.current && !popupWindowRef.current.closed) {
      console.log('🪟 Closing popup window...');
      popupWindowRef.current.close();
      popupWindowRef.current = null;
    }
    
    if (callFrameRef.current) {
      try {
        const frame = callFrameRef.current;
        console.log('🔄 Cleaning up Daily call frame...');
        
        // Check if frame is already destroyed
        if (frame.isDestroyed && frame.isDestroyed()) {
          console.log('✅ Frame already destroyed');
          callFrameRef.current = null;
          return;
        }
        
        // Leave meeting first if we're in one
        const meetingState = frame.meetingState?.();
        if (meetingState && meetingState !== 'left-meeting') {
          console.log('👋 Leaving meeting...');
          await frame.leave().catch((e: any) => console.warn('Error leaving meeting:', e));
        }
        
        // Destroy the frame
        await frame.destroy().catch((e: any) => console.warn('Error destroying frame:', e));
        console.log('✅ Daily frame destroyed');
      } catch (e) {
        console.warn('⚠️ Warning during Daily cleanup:', e);
      }
      callFrameRef.current = null;
    }
    
    // Clean up any existing Daily iframes with proper DOM checks
    const existingFrames = document.querySelectorAll('iframe[src*="daily.co"]');
    existingFrames.forEach((frame, index) => {
      try {
        // Check if the frame is still in the DOM and has a parent node
        if (frame.parentNode) {
          console.log(`🧹 Removing existing Daily iframe ${index + 1}`);
          frame.remove();
        } else {
          console.log(`🧹 Daily iframe ${index + 1} already removed from DOM`);
        }
      } catch (e) {
        console.warn(`⚠️ Warning removing iframe ${index + 1}:`, e);
      }
    });
    
    setConnectionStage('script');
    console.log('✅ Daily cleanup completed');
  }, []);

  // CORS check function
  const checkCORSCompatibility = useCallback(async () => {
    if (corsCheckRef.current) return false;
    corsCheckRef.current = true;
    
    try {
      console.log('🔒 Checking CORS compatibility for Tavus...');
      
      // Try to create a test iframe to check if it will be blocked
      const testFrame = document.createElement('iframe');
      testFrame.style.display = 'none';
      testFrame.src = conversationUrl;
      
      return new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          console.log('⚠️ CORS check timeout - assuming blocked');
          if (testFrame.parentNode) {
            document.body.removeChild(testFrame);
          }
          resolve(false);
        }, 3000);
        
        testFrame.onload = () => {
          console.log('✅ CORS check passed');
          clearTimeout(timeout);
          if (testFrame.parentNode) {
            document.body.removeChild(testFrame);
          }
          resolve(true);
        };
        
        testFrame.onerror = () => {
          console.log('❌ CORS check failed');
          clearTimeout(timeout);
          if (testFrame.parentNode) {
            document.body.removeChild(testFrame);
          }
          resolve(false);
        };
        
        document.body.appendChild(testFrame);
      });
    } catch (error) {
      console.log('❌ CORS check error:', error);
      return false;
    }
  }, [conversationUrl]);

  // Enhanced popup window function with AI Pitch Practice dimensions
  const openTavusPopup = useCallback(() => {
    console.log('🪟 Opening Tavus in optimized popup window...');
    
    // Calculate optimal dimensions for AI Pitch Practice
    const screenWidth = window.screen.availWidth;
    const screenHeight = window.screen.availHeight;
    
    // Responsive dimensions based on screen size
    let width = 1200;
    let height = 800;
    
    // Adjust for smaller screens
    if (screenWidth < 1400) {
      width = Math.min(1000, screenWidth * 0.9);
      height = Math.min(700, screenHeight * 0.85);
    } else if (screenWidth >= 1600) {
      width = 1400;
      height = 900;
    }
    
    // Center the popup
    const left = Math.round((screenWidth - width) / 2);
    const top = Math.round((screenHeight - height) / 2);
    
    // Enhanced popup features for better experience
    const features = [
      `width=${width}`,
      `height=${height}`,
      `left=${left}`,
      `top=${top}`,
      'scrollbars=yes',
      'resizable=yes',
      'status=no',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'directories=no',
      'copyhistory=no'
    ].join(',');
    
    try {
      const popup = window.open(conversationUrl, 'TavusAICoach', features);
      
      if (popup) {
        popupWindowRef.current = popup;
        
        // Focus the popup
        popup.focus();
        
        // Set a custom title for the popup
        setTimeout(() => {
          if (popup && !popup.closed) {
            try {
              popup.document.title = 'PitchPolish - AI Conversation';
            } catch (e) {
              // Cross-origin restriction, ignore
            }
          }
        }, 1000);
        
        // Monitor popup status
        const checkPopup = setInterval(() => {
          if (popup.closed) {
            console.log('🪟 Popup window closed by user');
            clearInterval(checkPopup);
            popupWindowRef.current = null;
          }
        }, 1000);
        
        console.log(`✅ Popup opened successfully: ${width}x${height} at (${left}, ${top})`);
        return true;
      } else {
        console.warn('⚠️ Popup blocked by browser');
        return false;
      }
    } catch (error) {
      console.error('❌ Error opening popup:', error);
      return false;
    }
  }, [conversationUrl]);

  // Auto-redirect function with popup window
  const startAutoRedirect = useCallback((immediate = false) => {
    console.log('🔄 Starting auto-redirect countdown...');
    setLoadingState('redirecting');
    setConnectionProgress('Preparing to open Tavus conversation...');
    
    if (immediate) {
      console.log('🚀 Immediate redirect to Tavus conversation...');
      const success = openTavusPopup();
      if (success) {
        setLoadingState('loaded');
        onLoad?.();
      } else {
        // Fallback to regular tab if popup fails
        window.open(conversationUrl, '_blank', 'noopener,noreferrer');
        setLoadingState('loaded');
        onLoad?.();
      }
      return;
    }
    
    let countdown = 3; // 3 seconds countdown
    setRedirectCountdown(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown -= 1;
      setRedirectCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        console.log('🚀 Auto-opening Tavus conversation popup...');
        
        const success = openTavusPopup();
        if (success) {
          setRedirectCountdown(null);
          setLoadingState('loaded');
          onLoad?.();
        } else {
          // Fallback to regular tab if popup fails
          window.open(conversationUrl, '_blank', 'noopener,noreferrer');
          setRedirectCountdown(null);
          setLoadingState('loaded');
          onLoad?.();
        }
      }
    }, 1000);
    
    redirectTimeoutRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
    }, 3000);
  }, [conversationUrl, onLoad, openTavusPopup]);

  // Load Daily.co script with CORS check
  useEffect(() => {
    const loadDailyScript = async () => {
      // First check CORS compatibility
      const corsCompatible = await checkCORSCompatibility();
      
      if (!corsCompatible) {
        console.log('🔄 CORS blocked detected - starting immediate redirect');
        startAutoRedirect(true);
        return;
      }
      
      if (window.Daily) {
        console.log('✅ Daily.co already loaded');
        setDailyLoaded(true);
        setConnectionProgress('Platform ready');
        setConnectionStage('frame');
        return;
      }

      console.log('📦 Loading Daily.co script...');
      setConnectionProgress('Loading video platform...');
      setConnectionStage('script');
      
      // Remove any existing Daily script first
      const existingScript = document.querySelector('script[src*="daily-js"]');
      if (existingScript) {
        existingScript.remove();
        console.log('🧹 Removed existing Daily script');
      }
      
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@daily-co/daily-js@latest';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => {
          console.log('✅ Daily.co script loaded successfully');
          setDailyLoaded(true);
          setConnectionProgress('Platform ready');
          setConnectionStage('frame');
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('❌ Failed to load Daily.co script:', error);
          setConnectionProgress('Failed to load video platform');
          // Start auto-redirect on script load failure
          startAutoRedirect();
          reject(new Error('Failed to load Daily.co script'));
        };
      });

      document.head.appendChild(script);
      
      // Timeout for script loading
      const timeout = setTimeout(() => {
        if (!window.Daily) {
          console.error('⏰ Daily.co script loading timeout');
          setConnectionProgress('Platform loading timeout');
          // Start auto-redirect on timeout
          startAutoRedirect();
        }
      }, 8000); // Reduced timeout for faster fallback
      
      try {
        await loadPromise;
        clearTimeout(timeout);
      } catch (error) {
        clearTimeout(timeout);
        // Error already handled in script.onerror
      }
    };

    loadDailyScript().catch(console.error);
  }, [startAutoRedirect, checkCORSCompatibility]);

  // Set up user video preview
  useEffect(() => {
    if (userStream && userVideoRef.current) {
      console.log('🎥 Setting up user video preview');
      userVideoRef.current.srcObject = userStream;
      userVideoRef.current.play().catch(e => console.warn('Video play failed:', e));
    }
  }, [userStream]);

  // Enhanced initialization with auto-redirect on failure
  const initializeTavusCall = useCallback(async () => {
    // Prevent multiple initialization attempts
    if (initializingRef.current) {
      console.log('⚠️ Initialization already in progress, skipping...');
      return;
    }
    
    if (!mountedRef.current) {
      console.log('⚠️ Component unmounted, skipping initialization');
      return;
    }

    // Increment connection attempt counter
    connectionAttemptRef.current += 1;
    console.log(`🚀 Connection attempt #${connectionAttemptRef.current}`);

    initializingRef.current = true;

    try {
      console.log('🚀 Initializing Tavus call with URL:', conversationUrl);
      setLoadingState('loading');
      setConnectionProgress('Creating secure video session...');
      setConnectionStage('frame');

      // Enhanced URL validation
      if (!conversationUrl) {
        throw new Error('No conversation URL provided');
      }

      if (!conversationUrl.includes('daily.co')) {
        throw new Error('Invalid conversation URL format - must be a daily.co URL');
      }

      // Ensure container is available
      if (!containerRef.current) {
        throw new Error('Video container not available');
      }

      // Clean up any existing instances first
      await cleanupDaily();
      
      // Wait a moment to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!mountedRef.current) {
        console.log('⚠️ Component unmounted during cleanup wait');
        return;
      }

      console.log('📦 Creating new Daily call frame...');
      setConnectionProgress('Setting up video interface...');

      // Enhanced frame configuration for better compatibility
      const frameConfig: any = {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: '#000000'
        },
        showLeaveButton: false,
        showFullscreenButton: false,
        showLocalVideo: true,
        showParticipantsBar: false,
        activeSpeakerMode: true,
        theme: {
          colors: {
            accent: '#2563eb',
            accentText: '#ffffff',
            background: '#ffffff',
            backgroundAccent: '#f8fafc',
            baseText: '#1f2937',
            border: '#e5e7eb',
            mainAreaBg: '#ffffff',
            mainAreaBgAccent: '#f1f5f9',
            mainAreaText: '#374151',
            supportiveText: '#6b7280'
          }
        }
      };

      // Create Daily call frame
      const callFrame = window.Daily.createFrame(containerRef.current, frameConfig);
      callFrameRef.current = callFrame;
      console.log('✅ Daily call frame created successfully');

      // Set up comprehensive event listeners with auto-redirect on failure
      callFrame
        .on('loading', () => {
          console.log('📡 Daily call frame loading...');
          setConnectionProgress('Loading Tavus conversation...');
          setDebugInfo(prev => ({ ...prev, loading: true }));
        })
        .on('loaded', () => {
          console.log('✅ Daily call frame loaded');
          setConnectionProgress('Connecting to conversation...');
          setDebugInfo(prev => ({ ...prev, loaded: true }));
        })
        .on('joining-meeting', () => {
          console.log('🔄 Joining meeting...');
          setConnectionProgress('Joining Tavus AI session...');
          setConnectionStage('join');
          setDebugInfo(prev => ({ ...prev, joining: true }));
        })
        .on('joined-meeting', async (event: any) => {
          console.log('✅ Joined Tavus meeting successfully');
          console.log('👤 Local participant:', event.participants.local);
          
          if (!mountedRef.current) return;
          
          // Clear timeout on successful connection
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          setLoadingState('loaded');
          setConnectionProgress('Connected to Tavus AI!');
          setConnectionStage('connected');
          initializingRef.current = false;
          setTimeoutCountdown(null);
          setDebugInfo(prev => ({ ...prev, joined: true, participants: event.participants }));
          
          // Reset connection attempt counter on success
          connectionAttemptRef.current = 0;
          
          onLoad?.();

          // Handle user media if available
          if (userStream) {
            console.log('🎥 User stream available, configuring...');
            try {
              const audioTracks = userStream.getAudioTracks();
              const videoTracks = userStream.getVideoTracks();
              
              if (audioTracks.length > 0) {
                await callFrame.setLocalAudio(audioTracks[0]);
                console.log('🎤 Audio track set');
              }
              
              if (videoTracks.length > 0) {
                await callFrame.setLocalVideo(videoTracks[0]);
                console.log('📹 Video track set');
              }
            } catch (mediaError) {
              console.warn('⚠️ Failed to set user media (non-fatal):', mediaError);
            }
          }
        })
        .on('participant-joined', (event: any) => {
          console.log('👤 Participant joined:', event.participant);
          setParticipantCount(prev => prev + 1);
          
          const participant = event.participant;
          if (participant.user_name?.toLowerCase().includes('tavus') || 
              participant.user_name?.toLowerCase().includes('ai') ||
              participant.user_id?.includes('tavus') ||
              participant.session_id?.includes('tavus')) {
            setConnectionProgress('Tavus AI Coach connected!');
            console.log('🤖 Tavus AI participant detected:', participant.user_name);
          }
        })
        .on('participant-left', (event: any) => {
          console.log('👋 Participant left:', event.participant);
          setParticipantCount(prev => Math.max(0, prev - 1));
        })
        .on('error', (error: any) => {
          console.error('❌ Daily call frame error:', error);
          
          if (!mountedRef.current) return;
          
          // Clear timeout on error
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          
          initializingRef.current = false;
          setTimeoutCountdown(null);
          
          console.log('🔄 Starting auto-redirect due to Daily error...');
          startAutoRedirect();
        })
        .on('left-meeting', (event: any) => {
          console.log('👋 Left Tavus meeting:', event);
          if (mountedRef.current) {
            setLoadingState('loading');
            setConnectionProgress('Disconnected from session');
            initializingRef.current = false;
            setConnectionStage('frame');
          }
        })
        .on('camera-error', (error: any) => {
          console.warn('📹 Camera error (non-fatal):', error);
          // Don't treat camera errors as fatal
        })
        .on('microphone-error', (error: any) => {
          console.warn('🎤 Microphone error (non-fatal):', error);
          // Don't treat microphone errors as fatal
        })
        .on('network-quality-change', (event: any) => {
          console.log('📶 Network quality:', event.quality);
          setNetworkQuality(event.quality === 'good' ? 'good' : 'poor');
          if (event.quality === 'poor') {
            setConnectionProgress('Poor network detected - optimizing connection...');
          }
        })
        .on('network-connection', (event: any) => {
          console.log('🌐 Network connection:', event.type);
          if (event.type === 'connected') {
            setNetworkQuality('good');
          } else if (event.type === 'disconnected') {
            setNetworkQuality('poor');
            setConnectionProgress('Network disconnected - attempting to reconnect...');
          }
        });

      // Join the conversation with enhanced configuration and timeout
      console.log('🔗 Joining Tavus conversation...');
      setConnectionProgress('Connecting to AI coach...');
      
      const joinConfig: any = { 
        url: conversationUrl,
        userName: 'PitchPolish User',
        userData: { 
          source: 'PitchPolish',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          attempt: connectionAttemptRef.current
        }
      };

      // Configure media settings based on userStream
      if (userStream) {
        const audioTracks = userStream.getAudioTracks();
        const videoTracks = userStream.getVideoTracks();
        
        joinConfig.startAudioOff = audioTracks.length === 0 || !audioTracks[0].enabled;
        joinConfig.startVideoOff = videoTracks.length === 0 || !videoTracks[0].enabled;
        
        console.log('🎥 Join config - Audio:', !joinConfig.startAudioOff, 'Video:', !joinConfig.startVideoOff);
      } else {
        // Default to audio/video off if no stream provided
        joinConfig.startAudioOff = true;
        joinConfig.startVideoOff = true;
        console.log('🎥 No user stream - joining with media off');
      }

      // Reduced timeout with auto-redirect
      const TIMEOUT_DURATION = 15000; // 15 seconds only
      
      let countdown = TIMEOUT_DURATION / 1000;
      setTimeoutCountdown(countdown);
      
      console.log(`⏰ Setting timeout for ${TIMEOUT_DURATION}ms (attempt #${connectionAttemptRef.current})`);
      
      const countdownInterval = setInterval(() => {
        countdown -= 1;
        setTimeoutCountdown(countdown);
        if (countdown <= 0) {
          clearInterval(countdownInterval);
        }
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        clearInterval(countdownInterval);
        if (initializingRef.current && mountedRef.current) {
          console.error(`⏰ Join timeout after ${TIMEOUT_DURATION / 1000} seconds (attempt #${connectionAttemptRef.current})`);
          
          initializingRef.current = false;
          setTimeoutCountdown(null);
          
          console.log('🔄 Starting auto-redirect due to timeout...');
          startAutoRedirect();
        }
      }, TIMEOUT_DURATION);

      // Join with the timeout
      const joinPromise = callFrame.join(joinConfig);
      await joinPromise;

      // Clear countdown if successful
      clearInterval(countdownInterval);
      setTimeoutCountdown(null);

    } catch (error) {
      console.error('❌ Error initializing Tavus call:', error);
      
      if (!mountedRef.current) return;
      
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      initializingRef.current = false;
      setTimeoutCountdown(null);
      
      console.log('🔄 Starting auto-redirect due to initialization error...');
      startAutoRedirect();
    }
  }, [conversationUrl, userStream, cleanupDaily, onLoad, startAutoRedirect]);

  // Main connection effect with proper state management and duplicate prevention
  useEffect(() => {
    mountedRef.current = true;
    
    if (!dailyLoaded || !conversationUrl || !containerRef.current) {
      return;
    }

    // Validate URL format early
    if (!conversationUrl.includes('daily.co')) {
      console.error('❌ Invalid conversation URL format:', conversationUrl);
      setConnectionProgress('Invalid conversation URL format');
      startAutoRedirect();
      return;
    }

    // Shorter delay for faster initialization
    const initTimer = setTimeout(() => {
      if (mountedRef.current && !initializingRef.current) {
        initializeTavusCall();
      }
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [dailyLoaded, conversationUrl, retryCount, initializeTavusCall, startAutoRedirect]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      mountedRef.current = false;
      initializingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
      cleanupDaily();
    };
  }, [cleanupDaily]);

  // Enhanced retry handler with exponential backoff
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying connection...');
    
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    
    // Reset states
    setLoadingState('loading');
    setConnectionProgress('Retrying connection...');
    setNetworkQuality('unknown');
    initializingRef.current = false;
    setDebugInfo({});
    setTimeoutCountdown(null);
    setRedirectCountdown(null);
    
    // Reset connection attempt counter if too many attempts
    if (connectionAttemptRef.current > 3) {
      connectionAttemptRef.current = 0;
    }
    
    // Increment retry count with exponential backoff
    setRetryCount(prev => {
      const newCount = prev + 1;
      const delay = Math.min(1000 * Math.pow(2, newCount - 1), 3000); // Max 3 second delay
      
      console.log(`🔄 Retry attempt ${newCount} with ${delay}ms delay`);
      
      setTimeout(() => {
        if (mountedRef.current) {
          // Force re-initialization by updating a dependency
          setConnectionStage('script');
        }
      }, delay);
      
      return newCount;
    });
  }, []);

  const openInNewTab = () => {
    console.log('🔗 Opening Tavus conversation in optimized popup...');
    const success = openTavusPopup();
    if (!success) {
      // Fallback to regular tab
      window.open(conversationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getConnectionStageProgress = () => {
    switch (connectionStage) {
      case 'script': return 25;
      case 'frame': return 50;
      case 'join': return 75;
      case 'connected': return 100;
      default: return 0;
    }
  };

  return (
    <div className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* New Tab Button - Always Visible in Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={openInNewTab}
          className="bg-gray-900 bg-opacity-80 hover:bg-opacity-90 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-lg backdrop-blur-sm border border-white border-opacity-20"
          title="Open conversation in optimized popup window"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Open Popup</span>
        </button>
      </div>

      {/* Enhanced Loading State */}
      {loadingState === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center z-10">
          <div className="text-white text-center p-6 max-w-md">
            <Loader className="w-16 h-16 animate-spin mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3">Loading Tavus conversation...</h3>
            <p className="text-primary-100 mb-4 text-lg">{connectionProgress}</p>
            
            {/* Timeout Countdown */}
            {timeoutCountdown !== null && timeoutCountdown > 0 && (
              <div className="mb-4 flex items-center justify-center space-x-2 text-primary-200">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Timeout in {timeoutCountdown}s</span>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="w-full bg-black bg-opacity-20 rounded-full h-3 mb-4">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${getConnectionStageProgress()}%` }}
              ></div>
            </div>
            
            <div className="bg-black bg-opacity-20 rounded-xl p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>Daily.co Platform:</span>
                <span className={`flex items-center space-x-1 ${dailyLoaded ? 'text-green-300' : 'text-yellow-300'}`}>
                  {dailyLoaded ? <CheckCircle className="w-4 h-4" /> : <Loader className="w-4 h-4 animate-spin" />}
                  <span>{dailyLoaded ? 'Ready' : 'Loading...'}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Network Quality:</span>
                <span className={`flex items-center space-x-1 ${
                  networkQuality === 'good' ? 'text-green-300' : 
                  networkQuality === 'poor' ? 'text-red-300' : 'text-gray-300'
                }`}>
                  {networkQuality === 'good' ? <Wifi className="w-4 h-4" /> : 
                   networkQuality === 'poor' ? <WifiOff className="w-4 h-4" /> : 
                   <Loader className="w-4 h-4 animate-spin" />}
                  <span>{networkQuality === 'unknown' ? 'Testing...' : networkQuality}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Participants:</span>
                <span className="text-blue-300">{participantCount} connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Attempt:</span>
                <span className="text-orange-300">#{connectionAttemptRef.current}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stage:</span>
                <span className="text-purple-300 capitalize">{connectionStage}</span>
              </div>
            </div>
            
            {/* Connection Tips */}
            <div className="mt-4 text-xs text-primary-200 space-y-1">
              <p>💡 Connection usually takes 15-30 seconds</p>
              {connectionAttemptRef.current > 1 && <p>🔄 Attempt #{connectionAttemptRef.current} in progress</p>}
              {networkQuality === 'poor' && <p>📶 Poor network detected - optimizing...</p>}
              {connectionStage === 'join' && <p>🤝 Joining conversation room...</p>}
              {timeoutCountdown !== null && timeoutCountdown <= 10 && <p>⏰ Will open popup window if connection fails...</p>}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Redirect State */}
      {loadingState === 'redirecting' && (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 to-accent-600 flex items-center justify-center z-10">
          <div className="text-white text-center p-6 max-w-md">
            <ExternalLink className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold mb-3">Opening Tavus Popup Window...</h3>
            <p className="text-secondary-100 mb-4 text-lg">Your conversation will start in an optimized window</p>
            
            {/* Redirect Countdown */}
            {redirectCountdown !== null && redirectCountdown > 0 && (
              <div className="mb-6 flex items-center justify-center space-x-2 text-secondary-200">
                <Clock className="w-6 h-6" />
                <span className="text-2xl font-bold">{redirectCountdown}</span>
                <span className="text-lg">seconds</span>
              </div>
            )}
            
            {/* Progress Bar */}
            <div className="w-full bg-black bg-opacity-20 rounded-full h-4 mb-6">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${redirectCountdown ? ((3 - redirectCountdown) / 3) * 100 : 100}%` }}
              ></div>
            </div>
            
            <div className="bg-black bg-opacity-20 rounded-xl p-4 text-sm space-y-2">
              <p className="text-secondary-100">🪟 Opening optimized popup window...</p>
              <p className="text-secondary-200 text-xs">Perfect size for AI conversation practice</p>
              <p className="text-secondary-200 text-xs">💡 Make sure pop-ups are allowed for this site</p>
            </div>
            
            <button
              onClick={openInNewTab}
              className="mt-4 bg-white text-secondary-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Now</span>
            </button>
          </div>
        </div>
      )}

      {/* User Video Preview - MOVED TO BOTTOM RIGHT */}
      {userStream && loadingState === 'loaded' && (
        <div className={`absolute bottom-4 right-4 z-30 transition-all duration-300 ${
          userVideoMinimized ? 'w-20 h-16' : 'w-64 h-48'
        } bg-gray-900 rounded-xl overflow-hidden border-2 border-white shadow-xl`}>
          <video
            ref={userVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Video Controls Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 group">
            {/* Minimize/Maximize Button */}
            <button
              onClick={() => setUserVideoMinimized(!userVideoMinimized)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title={userVideoMinimized ? 'Expand video' : 'Minimize video'}
            >
              {userVideoMinimized ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z" />
                </svg>
              )}
            </button>
            
            {/* User Label */}
            {!userVideoMinimized && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
                You
              </div>
            )}
            
            {/* Status Indicators */}
            <div className="absolute top-2 left-2 flex space-x-1">
              {userStream.getVideoTracks().length > 0 && userStream.getVideoTracks()[0].enabled && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Video Active"></div>
              )}
              {userStream.getAudioTracks().length > 0 && userStream.getAudioTracks()[0].enabled && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" title="Audio Active"></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Daily.co Call Frame Container - MAIN CONTENT AREA */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />

      {/* Enhanced Connection Status Overlay */}
      {loadingState === 'loaded' && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Tavus AI Coach</span>
          {participantCount > 0 && (
            <>
              <Users className="w-3 h-3" />
              <span>{participantCount}</span>
            </>
          )}
          {networkQuality !== 'unknown' && (
            <>
              {networkQuality === 'good' ? 
                <Wifi className="w-3 h-3 text-green-400" /> : 
                <WifiOff className="w-3 h-3 text-red-400" />
              }
            </>
          )}
        </div>
      )}

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs z-30">
          <p>URL: {conversationUrl.substring(0, 50)}...</p>
          <p>Daily: {dailyLoaded ? '✅' : '❌'}</p>
          <p>State: {loadingState}</p>
          <p>Progress: {connectionProgress}</p>
          <p>Retries: {retryCount}</p>
          <p>Attempts: {connectionAttemptRef.current}</p>
          <p>Participants: {participantCount}</p>
          <p>Timeout: {timeoutCountdown}s</p>
          <p>Redirect: {redirectCountdown}s</p>
          <p>Initializing: {initializingRef.current ? 'Yes' : 'No'}</p>
          <p>Mounted: {mountedRef.current ? 'Yes' : 'No'}</p>
          <p>Popup: {popupWindowRef.current ? 'Open' : 'Closed'}</p>
          {userStream && (
            <div>
              <p>Stream: {userStream.getTracks().length} tracks</p>
              <p>Video: {userStream.getVideoTracks().length > 0 ? '✅' : '❌'}</p>
              <p>Audio: {userStream.getAudioTracks().length > 0 ? '✅' : '❌'}</p>
            </div>
          )}
          {Object.keys(debugInfo).length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-500">
              <p>Debug: {JSON.stringify(debugInfo, null, 1).substring(0, 100)}...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TavusEmbed;