import LoadingSpinner from '@/components/ui/loading-spinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}