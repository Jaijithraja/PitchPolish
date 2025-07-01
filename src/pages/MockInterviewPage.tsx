import React, { useState } from 'react';
import { Play, Mic, Clock, ChevronDown, Star, Eye, RotateCcw, ArrowRight, Bot, MessageSquare, Video, Headphones } from 'lucide-react';
import AIConversationModal from '../components/AIConversationModal';

const MockInterviewPage = () => {
  const [selectedType, setSelectedType] = useState('');
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const interviewTypes = [
    { value: 'hr', label: 'HR & Behavioral' },
    { value: 'tech-ds', label: 'Tech - Data Science' },
    { value: 'tech-web', label: 'Tech - Web Development' },
    { value: 'mba', label: 'MBA & Consulting' },
    { value: 'behavioral', label: 'Behavioral Questions' }
  ];

  const mockQuestions = [
    "Tell me about yourself and why you're interested in this position.",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "Where do you see yourself in five years?",
    "What are your greatest strengths and how do they apply to this role?"
  ];

  const mockFeedback = {
    rating: 8.2,
    tip: "Add more specificity to your achievements with concrete metrics and examples.",
    sampleAnswer: "Here's a structured approach you could take..."
  };

  const handleStartInterview = () => {
    if (selectedType) {
      setIsInterviewStarted(true);
      setCurrentQuestion(0);
      setShowFeedback(false);
    }
  };

  const handleStartAIInterview = () => {
    setIsAIModalOpen(true);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setTimer(0);
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    // Auto-stop for demo
    setTimeout(() => {
      setIsRecording(false);
      setShowFeedback(true);
      clearInterval(interval);
    }, 8000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowFeedback(false);
      setTimer(0);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Mock Interview Practice
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Practice with realistic interview questions and get AI-powered feedback to improve your responses.
          </p>
        </div>

        {!isInterviewStarted ? (
          /* Setup Section */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Choose Your Interview Type
              </h2>
              
              <div className="space-y-4">
                {interviewTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-medium transition-all duration-200 ${
                      selectedType === type.value
                        ? 'border-primary-600 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Interview Mode Selection */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  Choose Your Interview Mode
                </h3>
                
                {/* AI Voice Interview - Featured Option */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-primary-100 p-2 rounded-xl">
                      <Bot className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary-900">🎤 AI Voice Interview (Recommended)</h4>
                      <p className="text-sm text-primary-700">Real-time conversation with Tavus AI interviewer</p>
                    </div>
                    <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      NEW
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Natural Conversation</span>
                      </div>
                      <p className="text-gray-600 text-xs">Speak naturally with AI interviewer</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Real-time Feedback</span>
                      </div>
                      <p className="text-gray-600 text-xs">Get instant coaching during interview</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Adaptive Questions</span>
                      </div>
                      <p className="text-gray-600 text-xs">AI asks follow-up questions based on your answers</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Multiple Modes</span>
                      </div>
                      <p className="text-gray-600 text-xs">Voice, video, or text conversation</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStartAIInterview}
                    disabled={!selectedType}
                    className={`w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      selectedType
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Bot className="h-5 w-5" />
                    <span>Start AI Voice Interview</span>
                  </button>
                </div>

                {/* Traditional Practice Mode */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-gray-100 p-2 rounded-xl">
                      <Mic className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">📝 Traditional Practice Mode</h4>
                      <p className="text-sm text-gray-600">Record yourself answering preset questions</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Self-Paced</span>
                      </div>
                      <p className="text-gray-600 text-xs">Practice at your own speed</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Preset Questions</span>
                      </div>
                      <p className="text-gray-600 text-xs">Common interview questions</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleStartInterview}
                    disabled={!selectedType}
                    className={`w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      selectedType
                        ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Traditional Practice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Traditional Interview Section */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Interview Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Question</span>
                    <span className="font-medium">{currentQuestion + 1} of {mockQuestions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Recording Status</h3>
                <div className="space-y-4">
                  {isRecording ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-error-500 rounded-full animate-pulse"></div>
                      <span className="text-error-600 font-medium">Recording</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-600">Ready to record</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-lg font-mono">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{formatTime(timer)}</span>
                  </div>

                  <button
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`w-full py-3 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${
                      isRecording
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    <Mic className="h-5 w-5" />
                    <span>{isRecording ? 'Recording...' : 'Start Recording'}</span>
                  </button>
                </div>
              </div>

              {/* Switch to AI Interview Option */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-2xl p-4">
                <div className="text-center">
                  <Bot className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <h4 className="font-medium text-primary-900 mb-1">Try AI Voice Interview</h4>
                  <p className="text-xs text-primary-700 mb-3">Get real-time conversation practice</p>
                  <button
                    onClick={handleStartAIInterview}
                    className="w-full bg-primary-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Switch to AI Interview
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Question & Feedback */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Eye className="h-4 w-4" />
                    <span>Question {currentQuestion + 1}</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
                    {mockQuestions[currentQuestion]}
                  </h2>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">💡 Tips for this question:</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Structure your answer with the STAR method (Situation, Task, Action, Result)</li>
                    <li>• Keep your response between 60-90 seconds</li>
                    <li>• Use specific examples and quantify your achievements</li>
                    <li>• Maintain eye contact with the camera</li>
                  </ul>
                </div>

                {showFeedback && (
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 border border-primary-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Star className="h-6 w-6 text-warning-500" />
                      <span>Answer Feedback</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Overall Rating</p>
                        <p className="text-3xl font-bold text-primary-600">{mockFeedback.rating}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Response Time</p>
                        <p className="text-3xl font-bold text-secondary-600">{formatTime(timer)}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">💬 Improvement Tip:</h4>
                      <p className="text-gray-700 bg-white p-4 rounded-xl">{mockFeedback.tip}</p>
                    </div>

                    <details className="bg-white rounded-xl p-4">
                      <summary className="font-medium text-gray-900 cursor-pointer hover:text-primary-600">
                        📝 View Sample Answer
                      </summary>
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        "I'm a data scientist with 3 years of experience in machine learning and analytics. 
                        In my current role at TechCorp, I led a team that improved customer retention by 23% 
                        through predictive modeling. I'm passionate about using data to solve real business problems..."
                      </p>
                    </details>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleNextQuestion}
                        disabled={currentQuestion >= mockQuestions.length - 1}
                        className={`flex-1 py-3 rounded-2xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          currentQuestion >= mockQuestions.length - 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                      >
                        <span>Next Question</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button className="flex-1 bg-white text-primary-600 border-2 border-primary-600 py-3 rounded-2xl font-semibold hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2">
                        <RotateCcw className="h-4 w-4" />
                        <span>Retry Question</span>
                      </button>
                    </div>
                  </div>
                )}
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
};

export default MockInterviewPage;