import React, { useState } from 'react';
import { Search, ExternalLink, BookOpen, Code, Database, Award, TrendingUp, Users } from 'lucide-react';

const SkillsProjectsPage = () => {
  const [targetRole, setTargetRole] = useState('');
  const [showResults, setShowResults] = useState(false);

  const roles = [
    'Data Scientist',
    'Software Engineer',
    'Product Manager',
    'UX Designer',
    'Marketing Manager',
    'Business Analyst',
    'DevOps Engineer',
    'Machine Learning Engineer'
  ];

  const mockCertifications = [
    {
      title: 'Google Data Analytics Certificate',
      provider: 'Coursera',
      duration: '3-6 months',
      level: 'Beginner',
      skills: ['SQL', 'Python', 'Tableau', 'R'],
      icon: <Award className="h-6 w-6 text-warning-600" />
    },
    {
      title: 'AWS Machine Learning Specialty',
      provider: 'AWS',
      duration: '2-3 months',
      level: 'Advanced',
      skills: ['ML', 'AWS', 'Deep Learning'],
      icon: <TrendingUp className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Meta Frontend Developer Certificate',
      provider: 'Meta',
      duration: '4-5 months',
      level: 'Intermediate',
      skills: ['React', 'JavaScript', 'HTML/CSS'],
      icon: <Code className="h-6 w-6 text-secondary-600" />
    }
  ];

  const mockProjects = [
    {
      title: 'Customer Churn Prediction Model',
      description: 'Build a machine learning model to predict customer churn using historical data',
      skills: ['Python', 'Scikit-learn', 'Pandas', 'Data Visualization'],
      difficulty: 'Intermediate',
      duration: '2-3 weeks',
      icon: <Users className="h-6 w-6 text-error-600" />
    },
    {
      title: 'Real-time Chat Application',
      description: 'Create a full-stack chat app with WebSocket integration and user authentication',
      skills: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
      difficulty: 'Advanced',
      duration: '3-4 weeks',
      icon: <Code className="h-6 w-6 text-primary-600" />
    },
    {
      title: 'Sales Dashboard with Power BI',
      description: 'Design an interactive dashboard to track sales KPIs and generate insights',
      skills: ['Power BI', 'SQL', 'Data Modeling', 'DAX'],
      difficulty: 'Beginner',
      duration: '1-2 weeks',
      icon: <TrendingUp className="h-6 w-6 text-success-600" />
    }
  ];

  const mockDatasets = [
    {
      title: 'COVID-19 Global Dataset',
      source: 'Our World in Data',
      description: 'Comprehensive global COVID-19 statistics and vaccination data',
      size: '50MB',
      format: 'CSV, JSON',
      url: '#'
    },
    {
      title: 'NYC Taxi Trip Records',
      source: 'NYC Open Data',
      description: 'Yellow and green taxi trip records from New York City',
      size: '2.3GB',
      format: 'Parquet, CSV',
      url: '#'
    },
    {
      title: 'E-commerce Customer Reviews',
      source: 'Kaggle',
      description: 'Amazon product reviews dataset for sentiment analysis',
      size: '156MB',
      format: 'CSV',
      url: '#'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRole) {
      setShowResults(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-success-100 text-success-700';
      case 'Intermediate': return 'bg-warning-100 text-warning-700';
      case 'Advanced': return 'bg-error-100 text-error-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Skills & Project Recommendations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized recommendations for certifications, projects, and datasets to advance your career.
          </p>
        </div>

        {/* Form Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              What role are you preparing for?
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <select
                  id="role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  required
                >
                  <option value="">Select your target role...</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <Search className="h-5 w-5" />
                <span>Get Recommendations</span>
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-8">
            {/* Certifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary-600" />
                <span>Recommended Certifications</span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockCertifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-primary-50 p-3 rounded-2xl">
                        {cert.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(cert.level)}`}>
                        {cert.level}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{cert.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{cert.provider} • {cert.duration}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills you'll learn:</p>
                      <div className="flex flex-wrap gap-2">
                        {cert.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full bg-primary-600 text-white py-3 rounded-2xl font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Enroll Now</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Mini-Projects */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Code className="h-6 w-6 text-secondary-600" />
                <span>Project Ideas</span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockProjects.map((project, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-secondary-50 p-3 rounded-2xl">
                        {project.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <p className="text-xs text-gray-500 mb-4">Estimated time: {project.duration}</p>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Technologies:</p>
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill, skillIndex) => (
                          <span key={skillIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full bg-secondary-600 text-white py-3 rounded-2xl font-medium hover:bg-secondary-700 transition-colors duration-200">
                      Start Project
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Datasets */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Database className="h-6 w-6 text-accent-600" />
                <span>Recommended Datasets</span>
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockDatasets.map((dataset, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                    <div className="mb-4">
                      <div className="bg-accent-50 p-3 rounded-2xl w-fit mb-3">
                        <Database className="h-6 w-6 text-accent-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{dataset.title}</h3>
                      <p className="text-sm text-gray-600">{dataset.source}</p>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4">{dataset.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium text-gray-900">{dataset.size}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium text-gray-900">{dataset.format}</span>
                      </div>
                    </div>
                    
                    <button className="w-full bg-accent-600 text-white py-3 rounded-2xl font-medium hover:bg-accent-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                      <ExternalLink className="h-4 w-4" />
                      <span>Download Dataset</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsProjectsPage;