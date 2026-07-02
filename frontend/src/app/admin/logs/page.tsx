'use client';

import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { formatDateTime } from '@/lib/utils';

export default function AdminLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500">Track admin actions</p>
        </div>
        {error ? <ErrorState message={error} /> :
         loading ? <TableSkeleton rows={5} cols={4} /> :
         <EmptyState title="No logs yet" description="Activity logs will appear here as admins perform actions" />}
      </div>
  );
}
