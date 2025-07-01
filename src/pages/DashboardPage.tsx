import React from 'react';
import { TrendingUp, Award, Calendar, Share2, Target, Clock, Mic, Video } from 'lucide-react';

const DashboardPage = () => {
  const mockStats = {
    totalSessions: 23,
    avgConfidence: 7.8,
    avgSpeed: 125,
    totalTime: '4h 32m'
  };

  const mockBadges = [
    {
      title: 'Clarity Master',
      description: 'Achieved excellent voice clarity',
      date: 'June 20, 2024',
      icon: <Mic className="h-6 w-6 text-primary-600" />,
      color: 'bg-primary-50 border-primary-200'
    },
    {
      title: 'Pitch Streak',
      description: '7 days of consistent practice',
      date: 'June 18, 2024',
      icon: <Target className="h-6 w-6 text-success-600" />,
      color: 'bg-success-50 border-success-200'
    },
    {
      title: 'Interview Pro',
      description: 'Completed 10 mock interviews',
      date: 'June 15, 2024',
      icon: <Video className="h-6 w-6 text-secondary-600" />,
      color: 'bg-secondary-50 border-secondary-200'
    }
  ];

  const mockProgressData = [
    { session: 1, confidence: 6.2, clarity: 7.1, speed: 140 },
    { session: 2, confidence: 6.8, clarity: 7.3, speed: 138 },
    { session: 3, confidence: 7.1, clarity: 7.8, speed: 135 },
    { session: 4, confidence: 7.5, clarity: 8.2, speed: 130 },
    { session: 5, confidence: 7.8, clarity: 8.5, speed: 125 }
  ];

  const recentSessions = [
    {
      type: 'Pitch Practice',
      date: '2 hours ago',
      score: 8.2,
      duration: '1m 45s',
      feedback: 'Great improvement in pacing'
    },
    {
      type: 'Mock Interview',
      date: '1 day ago',
      score: 7.9,
      duration: '12m 30s',
      feedback: 'Work on specific examples'
    },
    {
      type: 'Pitch Practice',
      date: '2 days ago',
      score: 7.5,
      duration: '2m 10s',
      feedback: 'Excellent clarity and tone'
    }
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Your Progress Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Track your improvement and celebrate your achievements
            </p>
          </div>
          <button className="mt-4 lg:mt-0 bg-primary-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center space-x-2 shadow-lg">
            <Share2 className="h-5 w-5" />
            <span>Share Report</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-primary-100 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Sessions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.totalSessions}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-success-100 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5 text-success-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Avg Confidence</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.avgConfidence}/10</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-secondary-100 p-2 rounded-xl">
                <Mic className="h-5 w-5 text-secondary-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Avg Speed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.avgSpeed} WPM</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-accent-100 p-2 rounded-xl">
                <Clock className="h-5 w-5 text-accent-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Total Time</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.totalTime}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary-600" />
                <span>Progress Over Time</span>
              </h2>
              
              {/* Simple Line Chart Simulation */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Confidence Score</span>
                    <span className="text-sm text-primary-600 font-semibold">↗ +1.6 points</span>
                  </div>
                  <div className="relative h-16 bg-gray-50 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-end space-x-1 p-2">
                      {mockProgressData.map((data, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-primary-600 rounded-t-sm transition-all duration-300"
                          style={{ height: `${(data.confidence / 10) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Voice Clarity</span>
                    <span className="text-sm text-success-600 font-semibold">↗ +1.4 points</span>
                  </div>
                  <div className="relative h-16 bg-gray-50 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-end space-x-1 p-2">
                      {mockProgressData.map((data, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-success-600 rounded-t-sm transition-all duration-300"
                          style={{ height: `${(data.clarity / 10) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Speaking Speed (WPM)</span>
                    <span className="text-sm text-secondary-600 font-semibold">↘ -15 WPM (Better!)</span>
                  </div>
                  <div className="relative h-16 bg-gray-50 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-end space-x-1 p-2">
                      {mockProgressData.map((data, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-secondary-600 rounded-t-sm transition-all duration-300"
                          style={{ height: `${(data.speed / 160) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Sessions</h2>
              <div className="space-y-4">
                {recentSessions.map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary-100 p-2 rounded-xl">
                        {session.type === 'Pitch Practice' ? (
                          <Mic className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Video className="h-5 w-5 text-primary-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{session.type}</h3>
                        <p className="text-sm text-gray-600">{session.date} • {session.duration}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">{session.score}/10</p>
                      <p className="text-xs text-gray-500">{session.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <Award className="h-6 w-6 text-warning-500" />
                <span>Your Achievements</span>
              </h2>
              
              <div className="space-y-4">
                {mockBadges.map((badge, index) => (
                  <div key={index} className={`p-4 rounded-2xl border-2 ${badge.color}`}>
                    <div className="flex items-start space-x-3">
                      <div className="bg-white p-2 rounded-xl shadow-sm">
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{badge.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <p className="text-xs text-gray-500">Earned {badge.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Radar */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills Overview</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Confidence</span>
                    <span className="text-sm font-bold text-gray-900">7.8/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Clarity</span>
                    <span className="text-sm font-bold text-gray-900">8.5/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Pacing</span>
                    <span className="text-sm font-bold text-gray-900">7.2/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-secondary-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Engagement</span>
                    <span className="text-sm font-bold text-gray-900">6.9/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-accent-600 h-2 rounded-full" style={{ width: '69%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;