import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIssues } from '@/context/IssueContext';
import { sortIssues } from '@/lib/issueUtils';
import { IssueStatus } from '@/types/issue';
import IssueCard from './IssueCard';

type FilterTab = 'all' | IssueStatus;

const TABS: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unsolved', value: 'unsolved' },
  { label: 'Solved', value: 'solved' },
];

export default function IssueFeed() {
  const { issues } = useIssues();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filtered = activeTab === 'all' ? issues : issues.filter((i) => i.status === activeTab);
  const sorted = sortIssues(filtered);

  return (
    <div>
      {/* Tab Bar */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === tab.value
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-background rounded-md shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Issue Grid */}
      {sorted.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Your neighborhood is looking good.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">No active reports nearby.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
