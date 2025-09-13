"use client";

import { useEffect, useCallback } from 'react';
import { useOnlineStatus } from '@/lib/offline-storage';
import type { PantryItem } from '@/lib/types';

type SyncData = PantryItem | Partial<PantryItem> | { id: string };

interface PendingSyncItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: SyncData;
  timestamp: number;
  retryCount: number;
}

export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private syncQueue: PendingSyncItem[] = [];
  private issyncing = false;
  private maxRetries = 3;

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  // Add item to sync queue
  addToSyncQueue(id: string, action: 'create' | 'update' | 'delete', data: SyncData) {
    const item: PendingSyncItem = {
      id,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.syncQueue.push(item);
    this.saveSyncQueue();

    // Register for background sync if service worker is available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Note: Background Sync API is not widely supported yet
        // This is a fallback approach using service worker messaging
        if (registration.active) {
          registration.active.postMessage({
            type: 'BACKGROUND_SYNC',
            tag: 'pantry-sync'
          });
        }
      }).catch((error) => {
        console.warn('Background sync registration failed:', error);
      });
    }
  }

  // Process sync queue
  async processSyncQueue(): Promise<void> {
    if (this.issyncing || this.syncQueue.length === 0) {
      return;
    }

    this.issyncing = true;

    try {
      const itemsToSync = [...this.syncQueue];
      
      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          // Remove successful item from queue
          this.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Failed to sync item:', error);
          
          // Increment retry count
          item.retryCount++;
          
          if (item.retryCount >= this.maxRetries) {
            console.warn('Max retries reached for item:', item.id);
            this.removeFromSyncQueue(item.id);
          }
        }
      }
      
      this.saveSyncQueue();
    } finally {
      this.issyncing = false;
    }
  }

  private async syncItem(item: PendingSyncItem): Promise<void> {
    const endpoint = '/api/pantry/sync';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: item.action,
        data: item.data,
        id: item.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status: ${response.status}`);
    }
  }

  private removeFromSyncQueue(id: string) {
    this.syncQueue = this.syncQueue.filter(item => item.id !== id);
  }

  private saveSyncQueue() {
    try {
      localStorage.setItem('pantry-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  private loadSyncQueue() {
    try {
      const stored = localStorage.getItem('pantry-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Initialize the sync manager
  init() {
    this.loadSyncQueue();
  }

  // Get pending sync count
  getPendingCount(): number {
    return this.syncQueue.length;
  }

  // Clear all pending syncs
  clearSyncQueue() {
    this.syncQueue = [];
    this.saveSyncQueue();
  }
}

// React hook for background sync
export function useBackgroundSync() {
  const isOnline = useOnlineStatus();
  const syncManager = BackgroundSyncManager.getInstance();

  useEffect(() => {
    syncManager.init();
  }, [syncManager]);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncManager.processSyncQueue();
    }
  }, [isOnline, syncManager]);

  const addToSyncQueue = useCallback((
    id: string, 
    action: 'create' | 'update' | 'delete', 
    data: SyncData
  ) => {
    syncManager.addToSyncQueue(id, action, data);
  }, [syncManager]);

  const forcSync = useCallback(async () => {
    await syncManager.processSyncQueue();
  }, [syncManager]);

  const getPendingCount = useCallback(() => {
    return syncManager.getPendingCount();
  }, [syncManager]);

  const clearPendingSync = useCallback(() => {
    syncManager.clearSyncQueue();
  }, [syncManager]);

  return {
    addToSyncQueue,
    forcSync,
    getPendingCount,
    clearPendingSync,
    isOnline,
  };
}

// Pantry-specific sync hooks
export function usePantrySync() {
  const { addToSyncQueue, ...syncUtils } = useBackgroundSync();

  const syncPantryItem = useCallback((
    action: 'create' | 'update' | 'delete',
    item: PantryItem | Partial<PantryItem>
  ) => {
    const syncId = `pantry-${item.id || 'new'}-${Date.now()}`;
    addToSyncQueue(syncId, action, item);
  }, [addToSyncQueue]);

  return {
    syncPantryItem,
    ...syncUtils,
  };
}
