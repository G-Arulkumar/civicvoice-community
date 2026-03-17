
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own reports" ON public.issue_reports;
DROP POLICY IF EXISTS "Authenticated users can create issues" ON public.issues;
DROP POLICY IF EXISTS "Authenticated users can update report count" ON public.issues;

-- Allow anyone to insert issues (Firebase auth is handled client-side)
CREATE POLICY "Anyone can create issues"
ON public.issues
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update issues
CREATE POLICY "Anyone can update issues"
ON public.issues
FOR UPDATE
TO public
USING (true);

-- Allow anyone to create reports
CREATE POLICY "Anyone can create reports"
ON public.issue_reports
FOR INSERT
TO public
WITH CHECK (true);
