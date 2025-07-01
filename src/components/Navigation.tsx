import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bot } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Practice Pitch', path: '/practice-pitch' },
    { name: 'Mock Interview', path: '/mock-interview' },
    { name: 'Skills & Projects', path: '/skills-projects' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">PitchPolish</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons and Bolt Badge */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-primary-600 text-white px-6 py-2 rounded-2xl font-medium hover:bg-primary-700 transition-colors duration-200 shadow-md"
            >
              Sign Up
            </Link>
            
            {/* Bolt Badge - Desktop - Larger Size with Proper Spacing */}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center hover:opacity-80 hover:scale-105 transition-all duration-200 ml-3"
              title="Powered by Bolt"
            >
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt" 
                className="w-16 h-16 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
              />
            </a>
          </div>

          {/* Mobile Menu Button and Badge */}
          <div className="md:hidden flex items-center space-x-3">
            {/* Mobile Bolt Badge - Larger Size */}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center hover:opacity-80 transition-opacity duration-200"
              title="Powered by Bolt"
            >
              <img 
                src="/black_circle_360x360.png" 
                alt="Powered by Bolt" 
                className="w-12 h-12 rounded-full shadow-md"
              />
            </a>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 rounded-xl font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block mx-3 mt-2 bg-primary-600 text-white px-6 py-2 rounded-2xl font-medium text-center hover:bg-primary-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;