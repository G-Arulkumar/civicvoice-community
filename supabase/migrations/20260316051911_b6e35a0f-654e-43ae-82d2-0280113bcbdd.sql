
-- Create issue type enum
CREATE TYPE public.issue_type AS ENUM (
  'Pothole', 'Garbage', 'Drainage', 'Street Light', 'Water Leakage', 'Road Damage', 'Other'
);

-- Create issue status enum
CREATE TYPE public.issue_status AS ENUM ('unsolved', 'solved');

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type issue_type NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status issue_status NOT NULL DEFAULT 'unsolved',
  report_count INTEGER NOT NULL DEFAULT 1,
  last_reported TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

-- Create issue_reports table to track who reported what
CREATE TABLE public.issue_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

-- Enable RLS
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;

-- Issues: anyone can read
CREATE POLICY "Anyone can view issues" ON public.issues FOR SELECT USING (true);

-- Issues: authenticated users can insert
CREATE POLICY "Authenticated users can create issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (true);

-- Issues: authenticated users can update report_count and last_reported
CREATE POLICY "Authenticated users can update issues" ON public.issues FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Issue reports: anyone can read
CREATE POLICY "Anyone can view reports" ON public.issue_reports FOR SELECT USING (true);

-- Issue reports: authenticated users can insert their own
CREATE POLICY "Users can create their own reports" ON public.issue_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Storage bucket for issue images
INSERT INTO storage.buckets (id, name, public) VALUES ('issue-images', 'issue-images', true);

-- Storage policies
CREATE POLICY "Issue images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'issue-images');

CREATE POLICY "Authenticated users can upload issue images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'issue-images');
