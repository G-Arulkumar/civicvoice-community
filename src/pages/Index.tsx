import IssueFeed from '@/components/IssueFeed';
import ReportFAB from '@/components/ReportFAB';

const Index = () => {
  return (
    <main className="container py-6 pb-24">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tighter text-foreground">Fix your street.</h1>
        <p className="text-muted-foreground text-base leading-relaxed">Track the progress.</p>
      </div>
      <IssueFeed />
      <ReportFAB />
    </main>
  );
};

export default Index;
