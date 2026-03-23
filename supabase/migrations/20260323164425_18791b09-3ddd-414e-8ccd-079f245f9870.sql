
-- Allow public delete on issues
CREATE POLICY "Anyone can delete issues"
ON public.issues
FOR DELETE
TO public
USING (true);

-- Allow public delete on issue_reports
CREATE POLICY "Anyone can delete reports"
ON public.issue_reports
FOR DELETE
TO public
USING (true);
