import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Error</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
    </div>
  );
}
