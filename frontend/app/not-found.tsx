import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <span className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <span className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}