import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useIssues, Issue } from '@/context/IssueContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Trash2, CheckCircle, AlertTriangle, BarChart3, FileText, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ADMIN_PHONES = ['+918939202794'];

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { issues, refreshIssues, loading } = useIssues();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = isAuthenticated && user?.phoneNumber && ADMIN_PHONES.includes(user.phoneNumber);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalIssues = issues.length;
  const unsolvedCount = issues.filter(i => i.status === 'unsolved').length;
  const solvedCount = issues.filter(i => i.status === 'solved').length;
  const totalReports = issues.reduce((sum, i) => sum + i.reportCount, 0);

  const handleMarkSolved = async (issue: Issue) => {
    setActionLoading(issue.id);
    const { error } = await supabase
      .from('issues')
      .update({ status: 'solved' })
      .eq('id', issue.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`"${issue.type}" marked as solved`);
      await refreshIssues();
    }
    setActionLoading(null);
  };

  const handleMarkUnsolved = async (issue: Issue) => {
    setActionLoading(issue.id);
    const { error } = await supabase
      .from('issues')
      .update({ status: 'unsolved' })
      .eq('id', issue.id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`"${issue.type}" marked as unsolved`);
      await refreshIssues();
    }
    setActionLoading(null);
  };

  const handleDelete = async (issue: Issue) => {
    setActionLoading(issue.id);
    // Delete reports first, then the issue
    await supabase.from('issue_reports').delete().eq('issue_id', issue.id);
    const { error } = await supabase.from('issues').delete().eq('id', issue.id);

    if (error) {
      toast.error('Failed to delete issue');
    } else {
      toast.success('Issue deleted');
      await refreshIssues();
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container py-6 space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage issues and view analytics</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalIssues}</p>
                <p className="text-xs text-muted-foreground">Total Issues</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unsolvedCount}</p>
                <p className="text-xs text-muted-foreground">Unsolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'hsl(var(--solved) / 0.1)' }}>
                <CheckCircle className="h-5 w-5" style={{ color: 'hsl(var(--solved))' }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{solvedCount}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issue Type Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Issues by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(
                issues.reduce((acc, i) => {
                  acc[i.type] = (acc[i.type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(count / totalIssues) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Issues ({totalIssues})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {issues.map((issue) => (
                <div key={issue.id} className="p-4 flex items-start gap-3">
                  <img
                    src={issue.image}
                    alt={issue.type}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{issue.type}</span>
                      <Badge
                        variant={issue.status === 'unsolved' ? 'destructive' : 'default'}
                        className={issue.status === 'solved' ? 'bg-[hsl(var(--solved))] text-[hsl(var(--solved-foreground))]' : ''}
                      >
                        {issue.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {issue.reportCount} report{issue.reportCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{issue.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{issue.locationName}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {issue.status === 'unsolved' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        disabled={actionLoading === issue.id}
                        onClick={() => handleMarkSolved(issue)}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Solve
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs"
                        disabled={actionLoading === issue.id}
                        onClick={() => handleMarkUnsolved(issue)}
                      >
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        Reopen
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={actionLoading === issue.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this issue?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{issue.type}" issue at {issue.locationName} and all its reports. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(issue)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No issues reported yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
