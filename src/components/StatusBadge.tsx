import { IssueStatus } from '@/types/issue';

interface StatusBadgeProps {
  status: IssueStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isUnsolved = status === 'unsolved';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
        isUnsolved
          ? 'bg-unsolved-muted text-unsolved-muted-foreground'
          : 'bg-solved-muted text-solved-muted-foreground'
      }`}
    >
      {status}
    </span>
  );
}
