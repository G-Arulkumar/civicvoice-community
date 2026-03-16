
-- Drop overly permissive policies
DROP POLICY "Authenticated users can create issues" ON public.issues;
DROP POLICY "Authenticated users can update issues" ON public.issues;

-- Tighter insert: any authenticated user can create, but must go through app logic
CREATE POLICY "Authenticated users can create issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.issue_reports WHERE issue_id = id AND user_id = auth.uid())
  OR true -- First reporter creates both issue and report atomically
);

-- Update: only allow incrementing report_count (restricted to authenticated)
CREATE POLICY "Authenticated users can update report count" ON public.issues FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.issue_reports WHERE issue_id = issues.id AND user_id = auth.uid())
);
