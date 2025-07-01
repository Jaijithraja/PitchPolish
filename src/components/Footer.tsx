import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-primary-600 transition-colors duration-200">
              About
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors duration-200">
              Contact
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors duration-200">
              GitHub
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors duration-200">
              Terms
            </a>
            <a href="#" className="hover:text-primary-600 transition-colors duration-200">
              Privacy
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-primary-600 transition-colors duration-200 p-2 rounded-xl hover:bg-gray-100"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          © 2025 PitchPolish. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;