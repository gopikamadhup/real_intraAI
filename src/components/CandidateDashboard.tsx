import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, MapPin, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ResumeUpload from './ResumeUpload';
import JobProfile from "./JobProfile";



interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  skills: string[];
  location: string;
  experience_level: string;
  salary_range: string | null;
  category: string;
  created_at: string;
}

export default function CandidateDashboard() {
  const { profile, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, selectedCategory, selectedExperience, jobs]);

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((job) => job.category === selectedCategory);
    }

    if (selectedExperience !== 'all') {
      filtered = filtered.filter((job) => job.experience_level === selectedExperience);
    }

    setFilteredJobs(filtered);
  };

  const categories = Array.from(new Set(jobs.map((job) => job.category)));
  const experienceLevels = Array.from(new Set(jobs.map((job) => job.experience_level)));

  if (selectedJob) {
  return (
    <JobProfile
      job={selectedJob}
      onBack={() => setSelectedJob(null)}
    />
  );
}

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-800">TalentHub</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">Welcome, {profile?.full_name}</span>
              <button
                onClick={() => setShowResumeUpload(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Upload Resume
              </button>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Find Your Next Opportunity</h1>
          <p className="text-slate-600">Browse and apply to jobs that match your skills</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, company, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Levels</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-slate-600">Loading jobs...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{job.title}</h3>
                    <p className="text-blue-600 font-semibold">{job.company}</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {job.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.experience_level}</span>
                  </div>
                  {job.salary_range && (
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 mb-4 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg"
                >
                  View Job
                </button>
              </div>
            ))}

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-slate-600">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showResumeUpload && <ResumeUpload onClose={() => setShowResumeUpload(false)} />}
    </div>
  );
}
