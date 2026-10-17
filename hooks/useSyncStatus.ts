import { useSyncExternalStore } from 'react';
import { getSyncStatus, onSyncStatus, SyncStatus } from '../lib/sync';

/** How the cloud copy is doing (lib/sync.ts), for the sign-in controls. */
export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(onSyncStatus, getSyncStatus);
}
