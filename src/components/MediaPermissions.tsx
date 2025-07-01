import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, AlertCircle, CheckCircle, XCircle, RefreshCw, Settings, ExternalLink, Video } from 'lucide-react';

interface MediaPermissionsProps {
  onPermissionsGranted: (stream: MediaStream) => void;
  onPermissionsDenied: (error: string) => void;
  requiredPermissions: ('camera' | 'microphone')[];
}

const MediaPermissions: React.FC<MediaPermissionsProps> = ({
  onPermissionsGranted,
  onPermissionsDenied,
  requiredPermissions
}) => {
  const [permissionStatus, setPermissionStatus] = useState<{
    camera?: PermissionState;
    microphone?: PermissionState;
  }>({});
  const [isRequestingFull, setIsRequestingFull] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedHelp, setShowDetailedHelp] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [autoRequestAttempted, setAutoRequestAttempted] = useState(false);
  const [permissionsDeniedPermanently, setPermissionsDeniedPermanently] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  // Auto-request permissions when component mounts - IMMEDIATE REQUEST
  useEffect(() => {
    const autoRequestPermissions = async () => {
      if (!autoRequestAttempted && !hasAttempted) {
        setAutoRequestAttempted(true);
        console.log('🚀 Auto-requesting camera and microphone permissions immediately...');
        
        // Request permissions immediately without delay
        requestPermissions();
      }
    };

    autoRequestPermissions();
  }, [autoRequestAttempted, hasAttempted]);

  // Set up video preview when stream is available
  useEffect(() => {
    if (userStream && videoRef.current) {
      console.log('🎥 Setting up video preview with stream:', userStream);
      console.log('📹 Video tracks:', userStream.getVideoTracks().length);
      console.log('🎤 Audio tracks:', userStream.getAudioTracks().length);
      
      videoRef.current.srcObject = userStream;
      videoRef.current.play()
        .then(() => {
          console.log('✅ Video preview started successfully');
          setStreamActive(true);
        })
        .catch(e => {
          console.warn('⚠️ Video play failed:', e);
          setStreamActive(false);
        });
    }
  }, [userStream]);

  // Cleanup stream when component unmounts
  useEffect(() => {
    return () => {
      if (userStream) {
        console.log('🧹 Cleaning up media stream');
        userStream.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Stopped ${track.kind} track`);
        });
      }
    };
  }, [userStream]);

  const checkCurrentPermissions = async () => {
    try {
      const status: any = {};
      
      if (requiredPermissions.includes('camera')) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        status.camera = cameraPermission.state;
      }
      
      if (requiredPermissions.includes('microphone')) {
        const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        status.microphone = micPermission.state;
      }
      
      setPermissionStatus(status);
    } catch (error) {
      console.log('Permission API not supported, will check during media access');
    }
  };

  const requestPermissions = async () => {
    setIsRequestingFull(true);
    setError(null);
    setHasAttempted(true);
    setPermissionsDeniedPermanently(false);

    try {
      const constraints: MediaStreamConstraints = {};
      
      // Always request microphone if it's in required permissions
      if (requiredPermissions.includes('microphone')) {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 }
        };
      }
      
      // For video mode, camera is required - try to get it
      if (requiredPermissions.includes('camera')) {
        constraints.video = {
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        };
      }

      console.log('🎥 Requesting media permissions:', constraints);
      console.log('📋 Required permissions:', requiredPermissions);
      
      let stream: MediaStream | null = null;
      
      try {
        // Try to get both audio and video if requested
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('✅ Full media permissions granted');
      } catch (fullError: any) {
        console.log('⚠️ Full media request failed, trying microphone only:', fullError);
        
        // If video mode was requested but failed, try microphone only
        if (requiredPermissions.includes('camera') && requiredPermissions.includes('microphone')) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              audio: constraints.audio,
              video: false 
            });
            console.log('✅ Microphone-only permissions granted for video mode');
            
            // Show user that camera failed but microphone works
            setError('Camera access denied, but microphone is working. You can still participate in video calls with audio only.');
          } catch (audioError: any) {
            console.log('❌ Even microphone failed:', audioError);
            // Handle gracefully instead of throwing
            handlePermissionError(audioError);
            return;
          }
        } else {
          // Handle the error gracefully instead of throwing
          handlePermissionError(fullError);
          return;
        }
      }
      
      if (stream) {
        console.log('📹 Video tracks:', stream.getVideoTracks().length);
        console.log('🎤 Audio tracks:', stream.getAudioTracks().length);
        
        // Store the stream for preview
        setUserStream(stream);
        
        // Test that tracks are actually working
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();
        
        if (videoTracks.length > 0) {
          console.log('📹 Video track details:', {
            label: videoTracks[0].label,
            enabled: videoTracks[0].enabled,
            readyState: videoTracks[0].readyState,
            settings: videoTracks[0].getSettings()
          });
        }
        
        if (audioTracks.length > 0) {
          console.log('🎤 Audio track details:', {
            label: audioTracks[0].label,
            enabled: audioTracks[0].enabled,
            readyState: audioTracks[0].readyState,
            settings: audioTracks[0].getSettings()
          });
        }
        
        // Clear any error state since we got the stream successfully
        setError(null);
        setShowDetailedHelp(false);
        setPermissionsDeniedPermanently(false);
        
        await checkCurrentPermissions();
        onPermissionsGranted(stream);
        return;
      }
      
    } catch (error: any) {
      console.error('❌ Media permission error:', error);
      handlePermissionError(error);
    } finally {
      setIsRequestingFull(false);
    }
  };

  const handlePermissionError = (error: any) => {
    let errorMessage = 'Media access was denied';
    let isUserDenial = false;
    
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        if (requiredPermissions.length === 1 && requiredPermissions.includes('microphone')) {
          errorMessage = 'Microphone access was denied. Please allow microphone access to continue with video conversation.';
        } else if (requiredPermissions.length === 1 && requiredPermissions.includes('camera')) {
          errorMessage = 'Camera access was denied. Please allow camera access to continue with video conversation.';
        } else {
          errorMessage = 'Camera and microphone access was denied. Please allow access to continue with video conversation.';
        }
        isUserDenial = true;
        setShowDetailedHelp(true);
        setPermissionsDeniedPermanently(true);
        break;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        if (requiredPermissions.length === 1 && requiredPermissions.includes('microphone')) {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (requiredPermissions.length === 1 && requiredPermissions.includes('camera')) {
          errorMessage = 'No camera found. Please connect a camera and try again.';
        } else {
          errorMessage = 'No camera or microphone found. Please connect your devices and try again.';
        }
        break;
      case 'NotReadableError':
      case 'TrackStartError':
        if (requiredPermissions.length === 1 && requiredPermissions.includes('microphone')) {
          errorMessage = 'Microphone is already in use by another application. Please close other apps and try again.';
        } else if (requiredPermissions.length === 1 && requiredPermissions.includes('camera')) {
          errorMessage = 'Camera is already in use by another application. Please close other apps and try again.';
        } else {
          errorMessage = 'Camera/microphone is already in use by another application. Please close other apps and try again.';
        }
        break;
      case 'OverconstrainedError':
        errorMessage = 'Media device constraints could not be satisfied. Please check your device settings.';
        break;
      case 'SecurityError':
        errorMessage = 'Media access blocked due to security restrictions. Please check your browser settings.';
        break;
      default:
        errorMessage = `Media access error: ${error.message}. Please check your device settings and try again.`;
        setShowDetailedHelp(true);
        setPermissionsDeniedPermanently(true);
    }
    
    setError(errorMessage);
    
    // CRITICAL FIX: Always call onPermissionsDenied to allow the parent to handle the error
    console.log('🔄 Calling onPermissionsDenied to notify parent component');
    onPermissionsDenied(errorMessage);
  };

  const handleSkipPermissions = () => {
    console.log('⏭️ User chose to skip permissions');
    // Call onPermissionsDenied to trigger the parent's error handling
    onPermissionsDenied('User chose to skip camera and microphone permissions');
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'your browser';
  };

  const getBrowserSpecificInstructions = () => {
    const browser = getBrowserName();
    const currentUrl = window.location.origin;
    const deviceType = requiredPermissions.length === 1 && requiredPermissions.includes('microphone') 
      ? 'microphone' 
      : requiredPermissions.length === 1 && requiredPermissions.includes('camera')
      ? 'camera'
      : 'camera and microphone';
    
    switch (browser) {
      case 'Chrome':
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">For Chrome:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-4">
              <li>Click the {deviceType} icon in the address bar (next to the URL)</li>
              <li>Select "Always allow {currentUrl} to access your {deviceType}"</li>
              <li>Click "Done" and refresh this page</li>
              <li>Alternative: Go to Settings → Privacy and security → Site Settings → {deviceType === 'microphone' ? 'Microphone' : 'Camera/Microphone'}</li>
            </ol>
          </div>
        );
      case 'Firefox':
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">For Firefox:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-4">
              <li>Click the shield icon or {deviceType} icon in the address bar</li>
              <li>Click "Allow" for {deviceType} permissions</li>
              <li>Refresh this page</li>
              <li>Alternative: Go to Settings → Privacy & Security → Permissions</li>
            </ol>
          </div>
        );
      case 'Safari':
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">For Safari:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-4">
              <li>Go to Safari → Settings → Websites</li>
              <li>Click "{deviceType === 'microphone' ? 'Microphone' : 'Camera and Microphone'}" in the left sidebar</li>
              <li>Set permissions for this website to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        );
      case 'Edge':
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">For Microsoft Edge:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-4">
              <li>Click the {deviceType} icon in the address bar</li>
              <li>Select "Always allow" for this site</li>
              <li>Refresh this page</li>
              <li>Alternative: Go to Settings → Site permissions → {deviceType === 'microphone' ? 'Microphone' : 'Camera/Microphone'}</li>
            </ol>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className="font-medium text-blue-900">General instructions:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside ml-4">
              <li>Look for {deviceType} icons in your browser's address bar</li>
              <li>Click on them and select "Allow" or "Always allow"</li>
              <li>Check your browser's site settings or permissions</li>
              <li>Refresh this page after making changes</li>
            </ol>
          </div>
        );
    }
  };

  const getPermissionIcon = (permission: PermissionState | undefined) => {
    switch (permission) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-error-600" />;
      case 'prompt':
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPermissionText = (permission: PermissionState | undefined) => {
    switch (permission) {
      case 'granted':
        return 'Allowed';
      case 'denied':
        return 'Blocked';
      case 'prompt':
        return 'Will ask';
      default:
        return 'Unknown';
    }
  };

  const allPermissionsGranted = requiredPermissions.every(perm => 
    permissionStatus[perm] === 'granted'
  ) || (userStream && userStream.getTracks().length > 0);

  const hasBlockedPermissions = requiredPermissions.some(perm => 
    permissionStatus[perm] === 'denied'
  );

  // Get the title based on what's actually required
  const getTitle = () => {
    if (requiredPermissions.length === 1 && requiredPermissions.includes('microphone')) {
      return 'Microphone Permission Required';
    } else if (requiredPermissions.length === 1 && requiredPermissions.includes('camera')) {
      return 'Camera Permission Required';
    } else {
      return 'Camera & Microphone Permissions Required';
    }
  };

  // Check if this is video mode (both camera and microphone requested)
  const isVideoMode = requiredPermissions.includes('camera') && requiredPermissions.includes('microphone');

  // If permissions are granted and we have a stream, we should not show the error state
  const shouldShowErrorState = error && !userStream;

  // Show action buttons if we don't have permissions/stream AND (we have blocked permissions OR haven't attempted yet OR have an error)
  const shouldShowActionButtons = !userStream && (hasBlockedPermissions || !hasAttempted || error);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        {isVideoMode ? (
          <Video className="w-6 h-6 text-primary-600" />
        ) : requiredPermissions.length === 1 && requiredPermissions.includes('microphone') ? (
          <Mic className="w-6 h-6 text-primary-600" />
        ) : (
          <Camera className="w-6 h-6 text-primary-600" />
        )}
        <span>{getTitle()}</span>
      </h3>

      {/* Auto-request Notice */}
      {isRequestingFull && !hasAttempted && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <RefreshCw className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5 animate-spin" />
            <div>
              <h4 className="font-medium text-primary-900 mb-1">🎥 Requesting Camera & Microphone Access</h4>
              <p className="text-sm text-primary-800 mb-2">
                Your browser should show a permission popup. Please click "Allow" to enable video conversation.
              </p>
              <div className="text-xs text-primary-700 space-y-1">
                <p>📱 Look for a popup at the top of your browser</p>
                <p>🔒 If blocked, click the camera/microphone icon in the address bar</p>
                <p>🎯 Camera and microphone are required for this conversation mode</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Status */}
      <div className="space-y-3 mb-6">
        {requiredPermissions.includes('camera') && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Camera className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Camera Access</span>
            </div>
            <div className="flex items-center space-x-2">
              {userStream && userStream.getVideoTracks().length > 0 ? (
                <CheckCircle className="w-5 h-5 text-success-600" />
              ) : (
                getPermissionIcon(permissionStatus.camera)
              )}
              <span className="text-sm font-medium">
                {userStream && userStream.getVideoTracks().length > 0 ? 'Active' :
                 getPermissionText(permissionStatus.camera)}
              </span>
            </div>
          </div>
        )}

        {requiredPermissions.includes('microphone') && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Mic className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Microphone Access</span>
            </div>
            <div className="flex items-center space-x-2">
              {userStream && userStream.getAudioTracks().length > 0 ? (
                <CheckCircle className="w-5 h-5 text-success-600" />
              ) : (
                getPermissionIcon(permissionStatus.microphone)
              )}
              <span className="text-sm font-medium">
                {userStream && userStream.getAudioTracks().length > 0 ? 'Active' :
                 getPermissionText(permissionStatus.microphone)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Video Preview */}
      {userStream && userStream.getVideoTracks().length > 0 && streamActive && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Video className="w-4 h-4 text-primary-600" />
            <span>📹 Your Video Preview</span>
          </h4>
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video max-w-md mx-auto">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              You
            </div>
            <div className="absolute top-2 right-2 flex space-x-1">
              {userStream.getVideoTracks().length > 0 && userStream.getVideoTracks()[0].enabled && (
                <div className="w-2 h-2 bg-green-400 rounded-full" title="Video On"></div>
              )}
              {userStream.getAudioTracks().length > 0 && userStream.getAudioTracks()[0].enabled && (
                <div className="w-2 h-2 bg-blue-400 rounded-full" title="Audio On"></div>
              )}
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-success-600 font-medium">✅ Camera is working!</p>
            <p className="text-xs text-gray-500">
              Video: {userStream.getVideoTracks().length > 0 ? 'Active' : 'None'} • 
              Audio: {userStream.getAudioTracks().length > 0 ? 'Active' : 'None'}
            </p>
          </div>
        </div>
      )}

      {/* Audio Only Preview */}
      {userStream && userStream.getAudioTracks().length > 0 && userStream.getVideoTracks().length === 0 && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <Mic className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-blue-900 mb-1">🎤 Microphone Active</h4>
            <p className="text-sm text-blue-700">Your microphone is working and ready for conversation!</p>
            <div className="mt-2 text-xs text-blue-600">
              Audio tracks: {userStream.getAudioTracks().length}
            </div>
          </div>
        </div>
      )}

      {/* Error Message - Only show if we don't have permissions or stream */}
      {shouldShowErrorState && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 mb-1">Permission Required</h4>
              <p className="text-sm text-yellow-700 mb-3">{error}</p>
              
              <div className="bg-yellow-100 rounded-lg p-3">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  🎯 Camera and microphone access is required for this conversation mode.
                </p>
                <p className="text-xs text-yellow-700">
                  Please allow access to continue with your AI coaching session.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions - Only show if user wants to enable media and we have errors */}
      {(hasBlockedPermissions || showDetailedHelp) && shouldShowErrorState && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>How to enable {requiredPermissions.length === 1 && requiredPermissions.includes('microphone') ? 'microphone' : requiredPermissions.length === 1 && requiredPermissions.includes('camera') ? 'camera' : 'camera/microphone'}?</span>
            </h4>
            <button
              onClick={() => setShowDetailedHelp(!showDetailedHelp)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <span>{showDetailedHelp ? 'Hide' : 'Show'} instructions</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {showDetailedHelp && (
            <div className="space-y-4">
              {getBrowserSpecificInstructions()}
              
              <div className="border-t border-blue-200 pt-3">
                <p className="text-sm font-medium text-blue-900 mb-2">Still having trouble?</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside ml-2">
                  <li>Make sure you're using HTTPS (secure connection)</li>
                  <li>Try refreshing the page after changing permissions</li>
                  <li>Check if other applications are using your {requiredPermissions.length === 1 && requiredPermissions.includes('microphone') ? 'microphone' : requiredPermissions.length === 1 && requiredPermissions.includes('camera') ? 'camera' : 'camera/microphone'}</li>
                  <li>Restart your browser if permissions seem stuck</li>
                  <li>Ensure your {requiredPermissions.length === 1 && requiredPermissions.includes('microphone') ? 'microphone is' : requiredPermissions.length === 1 && requiredPermissions.includes('camera') ? 'camera is' : 'camera and microphone are'} properly connected</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - Show if we don't have permissions/stream AND need to show them */}
      {shouldShowActionButtons && (
        <div className="space-y-3">
          {/* Primary button - Full permissions */}
          <button
            onClick={requestPermissions}
            disabled={isRequestingFull}
            className={`w-full py-3 px-4 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${
              isRequestingFull
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isRequestingFull ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Requesting Permissions...</span>
              </>
            ) : isVideoMode ? (
              <>
                <Video className="w-5 h-5" />
                <span>Enable Camera + Microphone</span>
              </>
            ) : requiredPermissions.length === 1 && requiredPermissions.includes('microphone') ? (
              <>
                <Mic className="w-5 h-5" />
                <span>Enable Microphone</span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span>Enable Camera</span>
              </>
            )}
          </button>

          {/* Skip permissions button - CRITICAL FIX */}
          {permissionsDeniedPermanently && (
            <button
              onClick={handleSkipPermissions}
              className="w-full py-3 px-4 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 bg-gray-600 text-white hover:bg-gray-700"
            >
              <span>Continue Without Camera/Microphone</span>
            </button>
          )}
        </div>
      )}

      {/* Success state */}
      {userStream && (
        <div className="text-center">
          <div className="bg-green-100 text-green-800 px-4 py-3 rounded-xl font-medium">
            ✅ Media access granted and working! Ready to continue.
          </div>
        </div>
      )}

      {/* Additional Help Link */}
      {shouldShowErrorState && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need more help with browser permissions? Check your browser's help documentation for site permissions.
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaPermissions;