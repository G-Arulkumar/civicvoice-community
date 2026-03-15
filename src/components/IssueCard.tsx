import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Issue } from '@/types/issue';
import { timeAgo } from '@/lib/issueUtils';
import StatusBadge from './StatusBadge';

interface IssueCardProps {
  issue: Issue;
  index: number;
}

export default function IssueCard({ issue, index }: IssueCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-card rounded-2xl shadow-card overflow-hidden border border-border/50"
    >
      <div className="aspect-video w-full bg-muted relative overflow-hidden">
        <img
          src={issue.image}
          alt={issue.type}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-foreground/5" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground text-lg leading-tight">{issue.type}</h3>
          <div className="flex items-center gap-1 text-primary font-bold tabular-nums text-sm">
            <Users className="h-3.5 w-3.5" />
            {issue.reportCount}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {issue.description}
        </p>
        <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
          <span className="truncate mr-2">📍 {issue.locationName}</span>
          <span className="shrink-0">{timeAgo(issue.lastReported)}</span>
        </div>
      </div>
    </motion.div>
  );
}
