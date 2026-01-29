import React, { useState } from 'react';
import { Briefcase, Users, Target, TrendingUp } from 'lucide-react';

interface HomePageProps {
  onAuthSelect: (type: 'login' | 'signup', role: 'candidate' | 'recruiter') => void;
}

export default function HomePage({ onAuthSelect }: HomePageProps) {
  const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">TalentHub</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedRole('candidate')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                For Candidates
              </button>
              <button
                onClick={() => setSelectedRole('recruiter')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                For Recruiters
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Find Your Dream Job with
            <span className="text-blue-600"> AI-Powered Interviews</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12">
            Connect talented candidates with leading companies through intelligent matching and automated interview processes
          </p>

          {!selectedRole && (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div
                onClick={() => setSelectedRole('candidate')}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Users className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">I'm a Candidate</h2>
                <p className="text-slate-600">
                  Browse jobs, upload your resume, and take AI-powered interviews
                </p>
              </div>

              <div
                onClick={() => setSelectedRole('recruiter')}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500 group"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                  <Briefcase className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">I'm a Recruiter</h2>
                <p className="text-slate-600">
                  Post jobs and find the best candidates for your company
                </p>
              </div>
            </div>
          )}

          {selectedRole && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-sm text-slate-500 hover:text-slate-700 mb-4"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {selectedRole === 'candidate' ? 'Candidate Portal' : 'Recruiter Portal'}
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => onAuthSelect('login', selectedRole)}
                  className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onAuthSelect('signup', selectedRole)}
                  className="w-full py-3 px-6 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Smart Matching</h3>
            <p className="text-slate-600">AI-powered job recommendations based on your skills and experience</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">AI Interviews</h3>
            <p className="text-slate-600">Automated interview process with instant feedback and scoring</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Easy Application</h3>
            <p className="text-slate-600">Upload your resume once and apply to multiple positions instantly</p>
          </div>
        </div>
      </main>
    </div>
  );
}
