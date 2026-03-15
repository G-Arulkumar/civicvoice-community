export type IssueStatus = 'unsolved' | 'solved';

export type IssueType = 
  | 'Pothole' 
  | 'Garbage' 
  | 'Drainage' 
  | 'Street Light' 
  | 'Water Leakage' 
  | 'Road Damage' 
  | 'Other';

export interface Issue {
  id: string;
  type: IssueType;
  description: string;
  image: string;
  status: IssueStatus;
  reportCount: number;
  lastReported: Date;
  createdAt: Date;
  locationName: string;
  lat: number;
  lng: number;
  reportedBy: string[];
}

export const ISSUE_TYPES: IssueType[] = [
  'Pothole', 'Garbage', 'Drainage', 'Street Light', 'Water Leakage', 'Road Damage', 'Other'
];
