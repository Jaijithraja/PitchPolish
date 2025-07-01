import React, { useState } from 'react';
import { Settings, Mic, Video, Clock, Zap, Users, BookOpen, Headphones, CheckCircle } from 'lucide-react';

interface ConversationConfig {
  type: 'pitch' | 'interview';
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  enableRecording: boolean;
  connectionMode: 'video' | 'audio';
}

interface ConversationSetupProps {
  onStart: (config: ConversationConfig) => void;
  onCancel: () => void;
}

const ConversationSetup: React.FC<ConversationSetupProps> = ({ onStart, onCancel }) => {
  const [config, setConfig] = useState<ConversationConfig>({
    type: 'pitch',
    duration: 300, // 5 minutes
    difficulty: 'intermediate',
    enableRecording: false,
    connectionMode: 'video' // Default to video mode
  });

  const handleStart = () => {
    onStart(config);
  };

  const sessionTypes = [
    {
      type: 'pitch' as const,
      title: 'Startup Pitch',
      description: 'Practice your elevator pitch or investor presentation',
      icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: 'primary'
    },
    {
      type: 'interview' as const,
      title: 'Mock Interview',
      description: 'Practice job interview questions and responses',
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7" />,
      color: 'secondary'
    }
  ];

  const connectionModes = [
    {
      mode: 'video' as const,
      title: 'Video Conversation',
      description: 'Full video experience with AI coach',
      icon: <Video className="w-5 h-5 sm:w-6 sm:h-6" />,
      requirements: 'Camera and microphone access',
      color: 'primary',
      recommended: true,
      reliability: 'Best experience'
    },
    {
      mode: 'audio' as const,
      title: 'Audio Only',
      description: 'Voice conversation with AI coach',
      icon: <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />,
      requirements: 'Microphone access',
      color: 'secondary',
      recommended: false,
      reliability: 'Great for focus'
    }
  ];

  const durations = [
    { value: 180, label: '3 minutes', description: 'Quick practice' },
    { value: 300, label: '5 minutes', description: 'Standard session' },
    { value: 600, label: '10 minutes', description: 'Extended practice' },
    { value: 900, label: '15 minutes', description: 'Full session' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', description: 'Basic questions and gentle feedback' },
    { value: 'intermediate', label: 'Intermediate', description: 'Standard difficulty with detailed feedback' },
    { value: 'advanced', label: 'Advanced', description: 'Challenging questions and expert-level feedback' }
  ];

  return (
    <div className="w-full">
      <div className="text-center mb-6 sm:mb-8">
        <div className="bg-primary-100 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-3 sm:mb-4">
          <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Setup Your Tavus AI Session</h2>
        <p className="text-sm sm:text-base text-gray-600">Configure your conversation with Tavus AI Coach</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Session Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Choose Your Practice Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {sessionTypes.map((sessionType) => (
              <button
                key={sessionType.type}
                onClick={() => setConfig({ ...config, type: sessionType.type })}
                className={`p-4 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                  config.type === sessionType.type
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 sm:p-3 rounded-xl w-fit mb-2 sm:mb-3 ${
                  config.type === sessionType.type ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <div className={config.type === sessionType.type ? 'text-primary-600' : 'text-gray-600'}>
                    {sessionType.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{sessionType.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{sessionType.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Connection Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Choose Your Interaction Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {connectionModes.map((mode) => (
              <button
                key={mode.mode}
                onClick={() => setConfig({ ...config, connectionMode: mode.mode })}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 relative ${
                  config.connectionMode === mode.mode
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {mode.recommended && (
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Recommended
                  </div>
                )}
                <div className={`p-2 rounded-xl w-fit mb-2 sm:mb-3 ${
                  config.connectionMode === mode.mode ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  <div className={config.connectionMode === mode.mode ? 'text-primary-600' : 'text-gray-600'}>
                    {mode.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{mode.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{mode.description}</p>
                <p className="text-xs text-gray-500 mb-1">{mode.requirements}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <CheckCircle className="w-3 h-3 text-success-600" />
                  <span className="text-xs text-success-600 font-medium">{mode.reliability}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Enhanced mode explanation */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">💡 How each mode works:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <Video className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Video Conversation:</strong> Full video experience with the AI coach. 
                  <span className="text-blue-600 font-medium"> You can control your camera and microphone during the conversation.</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Headphones className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Audio Only:</strong> Voice-only conversation with the AI coach. 
                  <span className="text-blue-600 font-medium"> Perfect for focused audio practice.</span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>🎯 Key Point:</strong> Both modes provide high-quality AI coaching. 
                You can enable/disable your camera and microphone anytime during the conversation!
              </p>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Session Duration
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => setConfig({ ...config, duration: duration.value })}
                className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-colors ${
                  config.duration === duration.value
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="font-semibold text-sm sm:text-base">{duration.label}</div>
                <div className="text-xs opacity-75 mt-1">{duration.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 sm:mb-4">
            Difficulty Level
          </label>
          <div className="space-y-2 sm:space-y-3">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty.value}
                onClick={() => setConfig({ ...config, difficulty: difficulty.value as any })}
                className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-colors ${
                  config.difficulty === difficulty.value
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{difficulty.label}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">{difficulty.description}</div>
                  </div>
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                    config.difficulty === difficulty.value
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}>
                    {config.difficulty === difficulty.value && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recording Option */}
        <div>
          <label className="flex items-start space-x-3 p-3 sm:p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableRecording}
              onChange={(e) => setConfig({ ...config, enableRecording: e.target.checked })}
              className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm sm:text-base">Enable Session Recording</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Record your session for later review (optional)</div>
            </div>
          </label>
        </div>

        {/* Enhanced Tavus AI Info */}
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl p-4 sm:p-6 border border-primary-200">
          <h4 className="font-semibold text-primary-900 mb-2 sm:mb-3 flex items-center space-x-2 text-sm sm:text-base">
            <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Powered by Tavus AI - Interactive & Engaging:</span>
          </h4>
          <div className="space-y-2 text-xs sm:text-sm text-primary-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary-600" />
              <span>Realistic AI avatar with natural conversation abilities</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary-600" />
              <span>Control your camera and microphone during conversation</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary-600" />
              <span>Real-time feedback and coaching during your practice</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-primary-600" />
              <span>Professional video and audio quality</span>
            </div>
            <div className="mt-3 pt-3 border-t border-primary-200 text-xs text-primary-700">
              <p><strong>Status:</strong> Connected and ready • <strong>Selected Mode:</strong> {config.connectionMode}</p>
              {config.connectionMode === 'video' && (
                <p className="text-primary-600 font-medium mt-1">🎥 Video mode selected - full interactive experience!</p>
              )}
              {config.connectionMode === 'audio' && (
                <p className="text-primary-600 font-medium mt-1">🎧 Audio mode selected - focused voice conversation!</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2 sm:pt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 border border-gray-300 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-primary-600 text-white rounded-2xl font-semibold hover:bg-primary-700 transition-colors shadow-lg text-sm sm:text-base flex items-center justify-center space-x-2"
          >
            {config.connectionMode === 'video' ? (
              <>
                <Video className="w-5 h-5" />
                <span>Start Video Session</span>
              </>
            ) : (
              <>
                <Headphones className="w-5 h-5" />
                <span>Start Audio Session</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationSetup;