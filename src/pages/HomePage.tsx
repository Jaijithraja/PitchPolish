import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Mic, TrendingUp, Star, Play } from 'lucide-react';
import AIConversationModal from '../components/AIConversationModal';
import HowItWorksModal from '../components/HowItWorksModal';

const HomePage = () => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8 text-primary-600" />,
      title: 'AI Pitch Coach',
      description: 'Analyze tone, speed, structure and get instant improvement suggestions'
    },
    {
      icon: <Mic className="w-8 h-8 text-secondary-600" />,
      title: 'Mock Interview Assistant',
      description: 'Practice tech, HR, or MBA questions with GPT-powered feedback and sample answers'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-accent-600" />,
      title: 'Skill & Project Recommender',
      description: 'Receive personalized upskilling plans and discover mini-project ideas with datasets'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      content: 'PitchPolish helped me nail my Google interview. The feedback was incredibly detailed and actionable.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Startup Founder',
      content: 'My pitch deck presentation improved dramatically after using this tool. Investors were impressed!',
      rating: 5
    },
    {
      name: 'Emily Johnson',
      role: 'MBA Student',
      content: 'The mock interviews prepared me perfectly for consulting interviews. Highly recommended!',
      rating: 5
    }
  ];

  const handleStartPracticing = () => {
    setIsAIModalOpen(true);
  };

  const handleSeeHowItWorks = () => {
    setIsHowItWorksOpen(true);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your AI Career Coach for{' '}
                <span className="text-primary-600">Interviews</span> and{' '}
                <span className="text-secondary-600">Startup Pitches</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Practice. Improve. Track. All face-to-face, all for free.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleStartPracticing}
                  className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Start Practicing Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSeeHowItWorks}
                  className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold text-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>See How It Works</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Person practicing interview"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to ace your next opportunity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform provides comprehensive feedback and personalized recommendations to help you succeed.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-200 border border-gray-100"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trusted by thousands of professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what our users have to say about their experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to transform your career?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of professionals who have improved their interview skills with PitchPolish.
          </p>
          <Link
            to="/signup"
            className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg inline-flex items-center space-x-2"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* AI Conversation Modal */}
      <AIConversationModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
      />

      {/* How It Works Modal */}
      <HowItWorksModal 
        isOpen={isHowItWorksOpen} 
        onClose={() => setIsHowItWorksOpen(false)} 
      />
    </div>
  );
};

export default HomePage;