/*
  # Create Resume Storage Bucket

  ## Overview
  Sets up Supabase Storage bucket for storing candidate resume files with proper security policies.

  ## Changes
  1. Storage Bucket
    - Creates 'resumes' bucket for storing resume files (PDF, DOCX, TXT)
    - Public bucket set to false for privacy
    - File size limit: 5MB
    - Allowed MIME types: PDF, Word documents, plain text

  2. Security Policies
    - Candidates can upload their own resumes
    - Candidates can read their own resumes
    - Candidates can update their own resumes
    - Candidates can delete their own resumes
    - All policies check authentication and ownership
*/

-- Create the resumes storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  5242880,
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Candidates can upload their own resumes
CREATE POLICY "Candidates can upload own resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Candidates can read their own resumes
CREATE POLICY "Candidates can read own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Candidates can update their own resumes
CREATE POLICY "Candidates can update own resumes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Candidates can delete their own resumes
CREATE POLICY "Candidates can delete own resumes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
