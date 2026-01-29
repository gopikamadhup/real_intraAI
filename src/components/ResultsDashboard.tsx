import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ResultsDashboardProps {
  interviewId: string;
  onBack: () => void;
}

interface InterviewResult {
  overall_score: number;
  scores: { [key: string]: number };
  completed_at: string;
  job: {
    title: string;
    company: string;
  };
}

export default function ResultsDashboard({ interviewId, onBack }: ResultsDashboardProps) {
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [interviewId]);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select(
          `
          overall_score,
          scores,
          completed_at,
          job:jobs (
            title,
            company
          )
        `
        )
        .eq('id', interviewId)
        .single();

      if (error) throw error;
      setResult(data as any);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getCategoryName = (category: string): string => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading results...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">No results found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800">Interview Results</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-6">
            <Award className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Interview Completed!</h1>
          <p className="text-xl text-slate-600">
            {result.job.title} at {result.job.company}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Overall Score</h2>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - result.overall_score / 100)}`}
                  className={getScoreColor(result.overall_score)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score.toFixed(0)}%
                </span>
                <span className="text-slate-600 font-medium mt-2">
                  {getScoreLabel(result.overall_score)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Score Breakdown by Category</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(result.scores).map(([category, score]) => (
                <div key={category} className="bg-slate-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-slate-800">
                      {getCategoryName(category)}
                    </h4>
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        score >= 80
                          ? 'bg-green-500'
                          : score >= 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Strengths</h3>
                <ul className="space-y-1 text-slate-600">
                  {Object.entries(result.scores)
                    .filter(([, score]) => score >= 70)
                    .map(([category]) => (
                      <li key={category} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>{getCategoryName(category)}</span>
                      </li>
                    ))}
                  {Object.entries(result.scores).filter(([, score]) => score >= 70).length === 0 && (
                    <li className="text-slate-500 italic">
                      Keep practicing to identify your strengths
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Areas for Improvement</h3>
                <ul className="space-y-1 text-slate-600">
                  {Object.entries(result.scores)
                    .filter(([, score]) => score < 70)
                    .map(([category]) => (
                      <li key={category} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>{getCategoryName(category)}</span>
                      </li>
                    ))}
                  {Object.entries(result.scores).filter(([, score]) => score < 70).length === 0 && (
                    <li className="text-slate-500 italic">Great job! Keep up the excellent work</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Interview Completion Certificate</h3>
          <p className="text-blue-100 mb-6">
            You have successfully completed the AI interview for {result.job.title}
          </p>
          <div className="flex justify-center space-x-4">
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Download Certificate</span>
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors"
            >
              Browse More Jobs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
