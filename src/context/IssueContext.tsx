import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { IssueType } from '@/types/issue';

export type DbIssue = Tables<'issues'>;

export interface Issue {
  id: string;
  type: IssueType;
  description: string;
  image: string;
  status: 'unsolved' | 'solved';
  reportCount: number;
  lastReported: Date;
  createdAt: Date;
  locationName: string;
  lat: number;
  lng: number;
  reportedBy: string[];
}

function dbToIssue(row: DbIssue, reporters: string[]): Issue {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    image: row.image_url,
    status: row.status,
    reportCount: row.report_count,
    lastReported: new Date(row.last_reported),
    createdAt: new Date(row.created_at),
    locationName: row.location_name,
    lat: row.lat,
    lng: row.lng,
    reportedBy: reporters,
  };
}

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  addReport: (issueId: string, userId: string) => Promise<boolean>;
  addIssue: (data: {
    type: string;
    description: string;
    imageFile: File;
    status: 'unsolved';
    locationName: string;
    lat: number;
    lng: number;
    userId: string;
  }) => Promise<Issue | null>;
  findNearbyDuplicate: (type: string, lat: number, lng: number) => Issue | undefined;
  refreshIssues: () => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

const NEARBY_RADIUS_KM = 0.5;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = useCallback(async () => {
    const { data: issueRows, error } = await supabase
      .from('issues')
      .select('*')
      .order('last_reported', { ascending: false });

    if (error || !issueRows) {
      console.error('Error fetching issues:', error);
      setLoading(false);
      return;
    }

    // Fetch all reports
    const { data: reports } = await supabase.from('issue_reports').select('issue_id, user_id');
    const reportMap = new Map<string, string[]>();
    (reports || []).forEach((r) => {
      const list = reportMap.get(r.issue_id) || [];
      list.push(r.user_id);
      reportMap.set(r.issue_id, list);
    });

    setIssues(issueRows.map((row) => dbToIssue(row, reportMap.get(row.id) || [])));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const findNearbyDuplicate = useCallback((type: string, lat: number, lng: number) => {
    return issues.find(
      (issue) => issue.type === type && issue.status === 'unsolved' && haversineDistance(lat, lng, issue.lat, issue.lng) < NEARBY_RADIUS_KM
    );
  }, [issues]);

  const addReport = useCallback(async (issueId: string, userId: string): Promise<boolean> => {
    // Insert report (will fail if duplicate due to unique constraint)
    const { error: reportError } = await supabase
      .from('issue_reports')
      .insert({ issue_id: issueId, user_id: userId });

    if (reportError) return false;

    // Increment report count
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      await supabase
        .from('issues')
        .update({ report_count: issue.reportCount + 1, last_reported: new Date().toISOString() })
        .eq('id', issueId);
    }

    await fetchIssues();
    return true;
  }, [issues, fetchIssues]);

  const addIssue = useCallback(async (data: {
    type: string;
    description: string;
    imageFile: File;
    status: 'unsolved';
    locationName: string;
    lat: number;
    lng: number;
    userId: string;
  }): Promise<Issue | null> => {
    // Upload image
    const fileExt = data.imageFile.name.split('.').pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('issue-images')
      .upload(filePath, data.imageFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: publicUrl } = supabase.storage.from('issue-images').getPublicUrl(filePath);

    // Insert issue
    const { data: newIssue, error: issueError } = await supabase
      .from('issues')
      .insert({
        type: data.type as any,
        description: data.description,
        image_url: publicUrl.publicUrl,
        status: 'unsolved',
        location_name: data.locationName,
        lat: data.lat,
        lng: data.lng,
      })
      .select()
      .single();

    if (issueError || !newIssue) {
      console.error('Issue insert error:', issueError);
      return null;
    }

    // Insert report for this user
    await supabase.from('issue_reports').insert({ issue_id: newIssue.id, user_id: data.userId });

    await fetchIssues();
    return issues.find((i) => i.id === newIssue.id) || null;
  }, [fetchIssues, issues]);

  return (
    <IssueContext.Provider value={{ issues, loading, addReport, addIssue, findNearbyDuplicate, refreshIssues: fetchIssues }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssueContext);
  if (!ctx) throw new Error('useIssues must be used within IssueProvider');
  return ctx;
}
