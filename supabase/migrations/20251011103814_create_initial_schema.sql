/*
  # Initial Schema for Job Portal Platform

  ## Overview
  Creates the complete database structure for a job portal with candidate and recruiter roles,
  job listings, resume management, and AI-powered interview system.

  ## New Tables

  ### 1. `profiles`
  - `id` (uuid, FK to auth.users) - User profile ID
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'candidate' or 'recruiter'
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `jobs`
  - `id` (uuid, PK) - Job listing ID
  - `recruiter_id` (uuid, FK) - Recruiter who posted the job
  - `title` (text) - Job title
  - `company` (text) - Company name
  - `description` (text) - Job description
  - `requirements` (text) - Job requirements
  - `skills` (text[]) - Required skills array
  - `location` (text) - Job location
  - `experience_level` (text) - Required experience level
  - `salary_range` (text) - Salary range
  - `category` (text) - Job category
  - `status` (text) - Job status: 'active', 'closed'
  - `created_at` (timestamptz) - Posting date

  ### 3. `resumes`
  - `id` (uuid, PK) - Resume ID
  - `candidate_id` (uuid, FK) - Candidate who uploaded
  - `file_name` (text) - Original file name
  - `file_url` (text) - Storage URL
  - `parsed_data` (jsonb) - Extracted information (skills, experience, education)
  - `created_at` (timestamptz) - Upload timestamp

  ### 4. `interviews`
  - `id` (uuid, PK) - Interview session ID
  - `candidate_id` (uuid, FK) - Candidate taking interview
  - `job_id` (uuid, FK) - Related job posting
  - `status` (text) - Interview status: 'in_progress', 'completed'
  - `started_at` (timestamptz) - Interview start time
  - `completed_at` (timestamptz) - Interview completion time
  - `overall_score` (numeric) - Final score percentage
  - `scores` (jsonb) - Detailed score breakdown by category

  ### 5. `interview_questions`
  - `id` (uuid, PK) - Question ID
  - `category` (text) - Question category: 'introduction', 'behavioral', 'coding', 'soft_skills'
  - `difficulty` (text) - Difficulty level: 'easy', 'medium', 'hard'
  - `question_text` (text) - The question content
  - `expected_keywords` (text[]) - Keywords for evaluation
  - `max_score` (numeric) - Maximum points for this question

  ### 6. `interview_responses`
  - `id` (uuid, PK) - Response ID
  - `interview_id` (uuid, FK) - Related interview session
  - `question_id` (uuid, FK) - Question answered
  - `answer_text` (text) - Candidate's answer
  - `score` (numeric) - Points earned
  - `answered_at` (timestamptz) - Timestamp of answer

  ## Security
  - RLS enabled on all tables
  - Profiles: Users can read/update their own profile
  - Jobs: Public read access, recruiters can manage their own jobs
  - Resumes: Candidates can manage their own resumes
  - Interviews: Candidates can access their own interviews
  - Interview Questions: Public read access for active interviews
  - Interview Responses: Candidates can manage their own responses
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('candidate', 'recruiter')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  requirements text NOT NULL,
  skills text[] DEFAULT '{}',
  location text NOT NULL,
  experience_level text NOT NULL,
  salary_range text,
  category text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Recruiters can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = recruiter_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'recruiter')
  );

CREATE POLICY "Recruiters can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = recruiter_id)
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Recruiters can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = recruiter_id);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  parsed_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own resumes"
  ON resumes FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can insert own resumes"
  ON resumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own resumes"
  ON resumes FOR UPDATE
  TO authenticated
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can delete own resumes"
  ON resumes FOR DELETE
  TO authenticated
  USING (auth.uid() = candidate_id);

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  overall_score numeric DEFAULT 0,
  scores jsonb DEFAULT '{}',
  UNIQUE(candidate_id, job_id)
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own interviews"
  ON interviews FOR SELECT
  TO authenticated
  USING (auth.uid() = candidate_id);

CREATE POLICY "Candidates can create own interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update own interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

-- Create interview_questions table
CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('introduction', 'behavioral', 'coding', 'soft_skills')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_text text NOT NULL,
  expected_keywords text[] DEFAULT '{}',
  max_score numeric DEFAULT 10
);

ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions"
  ON interview_questions FOR SELECT
  TO authenticated
  USING (true);

-- Create interview_responses table
CREATE TABLE IF NOT EXISTS interview_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  score numeric DEFAULT 0,
  answered_at timestamptz DEFAULT now(),
  UNIQUE(interview_id, question_id)
);

ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Candidates can view own responses"
  ON interview_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_id
      AND interviews.candidate_id = auth.uid()
    )
  );

CREATE POLICY "Candidates can insert own responses"
  ON interview_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_id
      AND interviews.candidate_id = auth.uid()
    )
  );

-- Insert sample interview questions
INSERT INTO interview_questions (category, difficulty, question_text, expected_keywords, max_score)
VALUES
  ('introduction', 'easy', 'Tell me about yourself and your background in software development.', ARRAY['experience', 'skills', 'projects', 'passion', 'background'], 10),
  ('behavioral', 'medium', 'Describe a challenging project you worked on. What was your approach to solving the problems you encountered?', ARRAY['challenge', 'solution', 'teamwork', 'problem-solving', 'result'], 10),
  ('coding', 'hard', 'Implement a function that finds the longest palindromic substring in a given string.', ARRAY['algorithm', 'optimization', 'edge cases', 'complexity', 'test'], 15),
  ('soft_skills', 'medium', 'How do you handle conflicts within a team when working on a project?', ARRAY['communication', 'compromise', 'understanding', 'resolution', 'collaboration'], 10)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_resumes_candidate ON resumes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job ON interviews(job_id);
CREATE INDEX IF NOT EXISTS idx_responses_interview ON interview_responses(interview_id);