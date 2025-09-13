"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useBackgroundSync } from '@/lib/background-sync';
import { 
  CloudArrowUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export function SyncStatus() {
  const { 
    getPendingCount, 
    forcSync, 
    clearPendingSync, 
    isOnline 
  } = useBackgroundSync();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingCount());
    };

    // Update count initially and then every few seconds
    updateCount();
    const interval = setInterval(updateCount, 3000);

    return () => clearInterval(interval);
  }, [getPendingCount]);

  const handleForceSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      await forcSync();
      setPendingCount(getPendingCount());
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearPending = () => {
    clearPendingSync();
    setPendingCount(0);
  };

  if (pendingCount === 0 && isOnline) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircleIcon className="h-4 w-4" />
        <span className="text-sm">All data synced</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Status Icon */}
      {!isOnline ? (
        <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
      ) : isSyncing ? (
        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      ) : (
        <CloudArrowUpIcon className="h-4 w-4 text-blue-500" />
      )}

      {/* Status Text */}
      <div className="flex items-center space-x-2">
        {!isOnline ? (
          <Badge variant="warning" className="text-xs">
            Offline
          </Badge>
        ) : (
          <Badge variant="info" className="text-xs">
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        )}

        {pendingCount > 0 && (
          <Badge variant="default" className="text-xs">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      {pendingCount > 0 && (
        <div className="flex space-x-1">
          {isOnline && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleForceSync}
              disabled={isSyncing}
              className="text-xs h-6 px-2"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearPending}
            className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/small spaces
export function SyncStatusCompact() {
  const { getPendingCount, isOnline } = useBackgroundSync();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setPendingCount(getPendingCount());
    };

    updateCount();
    const interval = setInterval(updateCount, 3000);
    return () => clearInterval(interval);
  }, [getPendingCount]);

  if (pendingCount === 0 && isOnline) {
    return (
      <CheckCircleIcon className="h-4 w-4 text-green-500" title="All data synced" />
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {!isOnline ? (
        <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" title="Offline" />
      ) : (
        <CloudArrowUpIcon className="h-4 w-4 text-blue-500" title="Pending sync" />
      )}
      
      {pendingCount > 0 && (
        <span className="text-xs bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center">
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </div>
  );
}
