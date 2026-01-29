export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'candidate' | 'recruiter';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'candidate' | 'recruiter';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'candidate' | 'recruiter';
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          recruiter_id: string;
          title: string;
          company: string;
          description: string;
          requirements: string;
          skills: string[];
          location: string;
          experience_level: string;
          salary_range: string | null;
          category: string;
          status: 'active' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: string;
          recruiter_id: string;
          title: string;
          company: string;
          description: string;
          requirements: string;
          skills?: string[];
          location: string;
          experience_level: string;
          salary_range?: string | null;
          category: string;
          status?: 'active' | 'closed';
          created_at?: string;
        };
        Update: {
          id?: string;
          recruiter_id?: string;
          title?: string;
          company?: string;
          description?: string;
          requirements?: string;
          skills?: string[];
          location?: string;
          experience_level?: string;
          salary_range?: string | null;
          category?: string;
          status?: 'active' | 'closed';
          created_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          candidate_id: string;
          file_name: string;
          file_url: string;
          parsed_data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          file_name: string;
          file_url: string;
          parsed_data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          file_name?: string;
          file_url?: string;
          parsed_data?: any;
          created_at?: string;
        };
      };
      interviews: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          status: 'in_progress' | 'completed';
          started_at: string;
          completed_at: string | null;
          overall_score: number;
          scores: any;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          status?: 'in_progress' | 'completed';
          started_at?: string;
          completed_at?: string | null;
          overall_score?: number;
          scores?: any;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          status?: 'in_progress' | 'completed';
          started_at?: string;
          completed_at?: string | null;
          overall_score?: number;
          scores?: any;
        };
      };
      interview_questions: {
        Row: {
          id: string;
          category: 'introduction' | 'behavioral' | 'coding' | 'soft_skills';
          difficulty: 'easy' | 'medium' | 'hard';
          question_text: string;
          expected_keywords: string[];
          max_score: number;
        };
        Insert: {
          id?: string;
          category: 'introduction' | 'behavioral' | 'coding' | 'soft_skills';
          difficulty: 'easy' | 'medium' | 'hard';
          question_text: string;
          expected_keywords?: string[];
          max_score?: number;
        };
        Update: {
          id?: string;
          category?: 'introduction' | 'behavioral' | 'coding' | 'soft_skills';
          difficulty?: 'easy' | 'medium' | 'hard';
          question_text?: string;
          expected_keywords?: string[];
          max_score?: number;
        };
      };
      interview_responses: {
        Row: {
          id: string;
          interview_id: string;
          question_id: string;
          answer_text: string;
          score: number;
          answered_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          question_id: string;
          answer_text: string;
          score?: number;
          answered_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          question_id?: string;
          answer_text?: string;
          score?: number;
          answered_at?: string;
        };
      };
    };
  };
};
