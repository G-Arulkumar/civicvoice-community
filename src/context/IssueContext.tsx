import React, { createContext, useContext, useState, useCallback } from 'react';
import { Issue, IssueStatus } from '@/types/issue';
import { mockIssues } from '@/data/mockIssues';

interface IssueContextType {
  issues: Issue[];
  addReport: (issueId: string, userId: string) => boolean;
  addIssue: (issue: Omit<Issue, 'id' | 'reportCount' | 'lastReported' | 'createdAt' | 'reportedBy'> & { userId: string }) => Issue;
  findNearbyDuplicate: (type: Issue['type'], lat: number, lng: number) => Issue | undefined;
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
  const [issues, setIssues] = useState<Issue[]>(mockIssues);

  const findNearbyDuplicate = useCallback((type: Issue['type'], lat: number, lng: number) => {
    return issues.find(
      (issue) => issue.type === type && issue.status === 'unsolved' && haversineDistance(lat, lng, issue.lat, issue.lng) < NEARBY_RADIUS_KM
    );
  }, [issues]);

  const addReport = useCallback((issueId: string, userId: string): boolean => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue || issue.reportedBy.includes(userId)) return false;

    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? { ...i, reportCount: i.reportCount + 1, lastReported: new Date(), reportedBy: [...i.reportedBy, userId] }
          : i
      )
    );
    return true;
  }, [issues]);

  const addIssue = useCallback((data: Omit<Issue, 'id' | 'reportCount' | 'lastReported' | 'createdAt' | 'reportedBy'> & { userId: string }): Issue => {
    const newIssue: Issue = {
      ...data,
      id: crypto.randomUUID(),
      reportCount: 1,
      lastReported: new Date(),
      createdAt: new Date(),
      reportedBy: [data.userId],
    };
    setIssues((prev) => [newIssue, ...prev]);
    return newIssue;
  }, []);

  return (
    <IssueContext.Provider value={{ issues, addReport, addIssue, findNearbyDuplicate }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssueContext);
  if (!ctx) throw new Error('useIssues must be used within IssueProvider');
  return ctx;
}
