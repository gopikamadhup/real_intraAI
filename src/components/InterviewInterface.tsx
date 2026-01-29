import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Settings, Maximize2, Mic, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ResultsDashboard from './ResultsDashboard';

interface Job {
  id: string;
  title: string;
  company: string;
}

interface Question {
  id: string;
  category: string;
  difficulty: string;
  question_text: string;
  expected_keywords: string[];
  max_score: number;
}

interface InterviewInterfaceProps {
  job: Job;
  onBack: () => void;
}

export default function InterviewInterface({ job, onBack }: InterviewInterfaceProps) {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);

  useEffect(() => {
    initializeInterview();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const initializeInterview = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('interview_questions')
        .select('*')
        .order('category');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      const { data: existingInterview } = await supabase
        .from('interviews')
        .select('id')
        .eq('candidate_id', user?.id)
        .eq('job_id', job.id)
        .maybeSingle();

      if (existingInterview) {
        setInterviewId(existingInterview.id);
        const { data: responses } = await supabase
          .from('interview_responses')
          .select('question_id, answer_text')
          .eq('interview_id', existingInterview.id);

        if (responses) {
          const answersMap: { [key: string]: string } = {};
          responses.forEach((r) => {
            answersMap[r.question_id] = r.answer_text;
          });
          setAnswers(answersMap);
        }
      } else {
        const { data: newInterview, error: interviewError } = await supabase
          .from('interviews')
          .insert({
            candidate_id: user?.id!,
            job_id: job.id,
            status: 'in_progress',
          })
          .select()
          .single();

        if (interviewError) throw interviewError;
        setInterviewId(newInterview.id);
      }
    } catch (error) {
      console.error('Error initializing interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = (answer: string, question: Question): number => {
    const answerLower = answer.toLowerCase();
    const keywordsFound = question.expected_keywords.filter((keyword) =>
      answerLower.includes(keyword.toLowerCase())
    ).length;

    const ratio = keywordsFound / question.expected_keywords.length;
    const baseScore = ratio * question.max_score;
    const lengthBonus = answer.length > 50 ? question.max_score * 0.1 : 0;

    return Math.min(question.max_score, baseScore + lengthBonus);
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || !interviewId) return;

    setSubmitting(true);
    const question = questions[currentQuestionIndex];

    try {
      const score = calculateScore(currentAnswer, question);

      const { error } = await supabase.from('interview_responses').upsert({
        interview_id: interviewId,
        question_id: question.id,
        answer_text: currentAnswer,
        score,
      });

      if (error) throw error;

      setAnswers({ ...answers, [question.id]: currentAnswer });
      setCurrentAnswer('');

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        await completeInterview();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const completeInterview = async () => {
    if (!interviewId) return;

    try {
      const { data: responses } = await supabase
        .from('interview_responses')
        .select('score, question_id')
        .eq('interview_id', interviewId);

      if (!responses) return;

      const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
      const maxScore = questions.reduce((sum, q) => sum + q.max_score, 0);
      const overallScore = (totalScore / maxScore) * 100;

      const scoresByCategory: { [key: string]: number } = {};
      questions.forEach((q) => {
        const response = responses.find((r) => r.question_id === q.id);
        if (response) {
          scoresByCategory[q.category] = (response.score / q.max_score) * 100;
        }
      });

      await supabase
        .from('interviews')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          overall_score: overallScore,
          scores: scoresByCategory,
        })
        .eq('id', interviewId);

      setShowResults(true);
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-500 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-slate-500 bg-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading interview...</div>
      </div>
    );
  }

  if (showResults && interviewId) {
    return <ResultsDashboard interviewId={interviewId} onBack={onBack} />;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-lg font-semibold">
                {job.title} - {job.company}
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs text-slate-400">Time Remaining</p>
              <p className="text-lg font-semibold text-red-400">{formatTime(timeRemaining)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Candidate</p>
              <p className="text-sm font-medium">{profile?.full_name}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-64 bg-slate-800 border-r border-slate-700 p-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-400 mb-3">Interview Questions</h2>
            <p className="text-xs text-slate-500">Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  idx === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[q.id]
                    ? 'bg-slate-700 text-slate-300'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="capitalize text-xs">{q.category}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${getDifficultyColor(
                      q.difficulty
                    )}`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <p className="text-xs line-clamp-2">{q.question_text}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-3xl w-full">
              <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-full w-48 h-48 mx-auto mb-8 flex items-center justify-center shadow-2xl">
                <div className="bg-red-400 rounded-full w-36 h-36 flex items-center justify-center">
                  <div className="bg-red-300 rounded-full w-24 h-24 flex items-center justify-center">
                    <div className="bg-white rounded-full w-4 h-4"></div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">INTERA-I Assistant</h2>
                <p className="text-slate-400">Your AI Interview Companion</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold capitalize mb-2">
                      {currentQuestion.category}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 ml-2 rounded-full text-xs font-semibold uppercase ${getDifficultyColor(
                        currentQuestion.difficulty
                      )}`}
                    >
                      {currentQuestion.difficulty}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                      disabled={currentQuestionIndex === 0}
                      className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))
                      }
                      disabled={currentQuestionIndex === questions.length - 1}
                      className="p-2 hover:bg-slate-700 rounded-lg disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-lg text-white leading-relaxed">{currentQuestion.question_text}</p>
              </div>

              <div className="flex space-x-3 mb-4">
                <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Mic className="w-4 h-4" />
                  <span className="text-sm">Start Recording</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Camera On</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold">Code Editor</h3>
            <div className="flex space-x-2">
              <button className="p-1 hover:bg-slate-700 rounded">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-slate-700 rounded">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col p-4">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="flex-1 bg-slate-900 text-slate-300 font-mono text-sm p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-4 space-y-2">
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim() || submitting}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : currentQuestionIndex === questions.length - 1 ? 'Submit & Finish' : 'Submit'}
              </button>

              <button
                onClick={onBack}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                Exit Interview
              </button>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              <p className="mb-1">Output:</p>
              <div className="bg-slate-900 rounded p-2 h-20 overflow-auto">
                {currentAnswer && <p className="text-green-400">Answer recorded</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
