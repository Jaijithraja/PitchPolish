import React from 'react';
import { X, Play, MessageSquare, TrendingUp, Award, CheckCircle } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    {
      icon: <Play className="w-8 h-8 text-primary-600" />,
      title: "Choose Your Practice Mode",
      description: "Select between AI Voice Coaching for real-time conversation or traditional recording practice.",
      features: ["Interactive AI coach", "Real-time feedback", "Natural conversation"]
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-secondary-600" />,
      title: "Practice Your Skills",
      description: "Present your pitch or answer interview questions while our AI provides instant coaching.",
      features: ["Startup pitch practice", "Mock interviews", "Behavioral questions"]
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-accent-600" />,
      title: "Get Detailed Feedback",
      description: "Receive comprehensive analysis on your performance with actionable improvement suggestions.",
      features: ["Voice clarity analysis", "Confidence scoring", "Speaking pace feedback"]
    },
    {
      icon: <Award className="w-8 h-8 text-success-600" />,
      title: "Track Your Progress",
      description: "Monitor your improvement over time and earn achievements as you develop your skills.",
      features: ["Progress tracking", "Achievement badges", "Performance analytics"]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">How PitchPolish Works</h2>
            <p className="text-gray-600 mt-2">Your AI-powered career coaching platform</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Video Preview Section */}
          <div className="mb-12">
            <div className="relative bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl p-8 text-white text-center">
              <div className="bg-white bg-opacity-20 rounded-2xl p-8 backdrop-blur-sm">
                <Play className="w-16 h-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold mb-2">Watch PitchPolish in Action</h3>
                <p className="text-primary-100 mb-6">See how our AI coach helps you practice and improve</p>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-sm">
                  <p className="mb-2">🎥 <strong>Demo Features:</strong></p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                    <p>• Real-time AI conversation</p>
                    <p>• Instant feedback delivery</p>
                    <p>• Voice and video analysis</p>
                    <p>• Progress tracking dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Step Number */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-600">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className="flex-shrink-0 bg-gray-50 p-4 rounded-2xl">
                  {step.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 mb-4 text-lg leading-relaxed">{step.description}</p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {step.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 bg-gray-50 rounded-xl p-3">
                        <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Key Features Section */}
          <div className="mt-12 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose PitchPolish?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="bg-primary-100 p-3 rounded-xl w-fit mb-4">
                  <MessageSquare className="w-6 h-6 text-primary-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">AI-Powered Coaching</h4>
                <p className="text-gray-600 text-sm">Advanced AI technology provides personalized feedback and coaching tailored to your needs.</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="bg-secondary-100 p-3 rounded-xl w-fit mb-4">
                  <TrendingUp className="w-6 h-6 text-secondary-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Real-Time Analysis</h4>
                <p className="text-gray-600 text-sm">Get instant feedback on your speaking pace, clarity, confidence, and overall presentation skills.</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="bg-accent-100 p-3 rounded-xl w-fit mb-4">
                  <Award className="w-6 h-6 text-accent-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Progress Tracking</h4>
                <p className="text-gray-600 text-sm">Monitor your improvement over time with detailed analytics and achievement badges.</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Practicing?</h3>
            <p className="text-gray-600 mb-6">Join thousands of professionals who have improved their interview and presentation skills.</p>
            <button
              onClick={onClose}
              className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your First Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;