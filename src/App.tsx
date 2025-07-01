import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PitchPracticePage from './pages/PitchPracticePage';
import MockInterviewPage from './pages/MockInterviewPage';
import SkillsProjectsPage from './pages/SkillsProjectsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-inter">
        <Navigation />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice-pitch" element={<PitchPracticePage />} />
            <Route path="/mock-interview" element={<MockInterviewPage />} />
            <Route path="/skills-projects" element={<SkillsProjectsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;