/**
 * DatabaseSync Component
 * 
 * A component that displays the current database connection status
 * and provides manual sync functionality for debugging and development.
 */

import { useDatabase } from '@/contexts/DatabaseContext';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DataSourceStatus {
  azure: boolean;
  sqlite: boolean;
  mock: boolean;
}

interface SyncStatus {
  loading: boolean;
  lastSync: Date | null;
  error?: string;
}

export const DatabaseSync: React.FC = () => {
  const { syncWithRemote, getDataSourceStatus, getLastSyncTime } = useDatabase();
  
  const [sourceStatus, setSourceStatus] = useState<DataSourceStatus>({
    azure: false,
    sqlite: false,
    mock: true
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    loading: false,
    lastSync: null
  });

  // Check data source status
  const checkStatus = useCallback(async () => {
    try {
      const status = await getDataSourceStatus();
      setSourceStatus(status);
      
      const lastSync = getLastSyncTime();
      setSyncStatus(prev => ({ ...prev, lastSync }));
    } catch (error) {
      console.error('Failed to check data source status:', error);
    }
  }, [getDataSourceStatus, getLastSyncTime]);

  // Manual sync function
  const handleManualSync = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, loading: true, error: undefined }));
    
    try {
      const result = await syncWithRemote();
      
      if (result.success) {
        const lastSync = getLastSyncTime();
        setSyncStatus({
          loading: false,
          lastSync,
          error: undefined
        });
        
        Alert.alert('Sync Complete', 'Data synchronized successfully with remote server.');
        
        // Refresh status
        await checkStatus();
      } else {
        setSyncStatus(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Sync failed'
        }));
        
        Alert.alert('Sync Failed', result.error || 'Unknown error occurred during sync.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      setSyncStatus(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      
      Alert.alert('Sync Error', errorMessage);
    }
  }, [syncWithRemote, getLastSyncTime, checkStatus]);

  // Check status on mount and periodically
  useEffect(() => {
    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Status</Text>
      
      {/* Data Source Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sources</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Azure API:</Text>
          <View style={[styles.statusIndicator, sourceStatus.azure ? styles.online : styles.offline]} />
          <Text style={[styles.statusText, sourceStatus.azure ? styles.onlineText : styles.offlineText]}>
            {sourceStatus.azure ? 'Online' : 'Offline'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Local SQLite:</Text>
          <View style={[styles.statusIndicator, sourceStatus.sqlite ? styles.online : styles.offline]} />
          <Text style={[styles.statusText, sourceStatus.sqlite ? styles.onlineText : styles.offlineText]}>
            {sourceStatus.sqlite ? 'Available' : 'Unavailable'}
          </Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Mock Data:</Text>
          <View style={[styles.statusIndicator, sourceStatus.mock ? styles.online : styles.offline]} />
          <Text style={[styles.statusText, sourceStatus.mock ? styles.onlineText : styles.offlineText]}>
            {sourceStatus.mock ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
      
      {/* Sync Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Synchronization</Text>
        
        <View style={styles.syncRow}>
          <Text style={styles.statusLabel}>Last Sync:</Text>
          <Text style={styles.syncTime}>{formatLastSync(syncStatus.lastSync)}</Text>
        </View>
        
        {syncStatus.error && (
          <Text style={styles.errorText}>Error: {syncStatus.error}</Text>
        )}
        
        <TouchableOpacity
          style={[styles.syncButton, syncStatus.loading && styles.syncButtonDisabled]}
          onPress={handleManualSync}
          disabled={syncStatus.loading}
        >
          <Text style={styles.syncButtonText}>
            {syncStatus.loading ? 'Syncing...' : 'Manual Sync'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Refresh Status Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={checkStatus}>
        <Text style={styles.refreshButtonText}>Refresh Status</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    minWidth: 100,
    color: '#666',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  onlineText: {
    color: '#4CAF50',
  },
  offlineText: {
    color: '#F44336',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncTime: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  syncButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  syncButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  syncButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});