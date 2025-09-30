import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import { Download, Wifi, WifiOff, Settings, RefreshCw, HardDrive, Clock, AlertCircle } from 'lucide-react';
import { offlineService } from '../../services/offlineService';

import OfflineContentLibrary from './components/OfflineContentLibrary';
import OfflineSettings from './components/OfflineSettings';
import StorageManagement from './components/StorageManagement';
import SyncStatus from './components/SyncStatus';
import Icon from '../../components/AppIcon';


const OfflineLearningMode = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [offlineContent, setOfflineContent] = useState([]);
  const [offlineSettings, setOfflineSettings] = useState(null);
  const [storageUsage, setStorageUsage] = useState(null);
  const [offlineProgress, setOfflineProgress] = useState([]);
  const [connectivity, setConnectivity] = useState({ online: true });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Check connectivity status
  useEffect(() => {
    const checkConnectivity = () => {
      const status = offlineService?.checkConnectivity();
      setConnectivity(status);
    };

    checkConnectivity();
    window?.addEventListener?.('online', checkConnectivity);
    window?.addEventListener?.('offline', checkConnectivity);

    return () => {
      window?.removeEventListener?.('online', checkConnectivity);
      window?.removeEventListener?.('offline', checkConnectivity);
    };
  }, []);

  // Load initial data
  useEffect(() => {
    if (user?.id) {
      loadOfflineData();
    }
  }, [user?.id]);

  const loadOfflineData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [content, settings, usage, progress] = await Promise.all([
        offlineService?.getUserOfflineContent(user?.id),
        offlineService?.getUserOfflineSettings(user?.id),
        offlineService?.getStorageUsage(user?.id),
        offlineService?.getOfflineProgressCache(user?.id)
      ]);

      setOfflineContent(content || []);
      setOfflineSettings(settings);
      setStorageUsage(usage);
      setOfflineProgress(progress || []);
    } catch (error) {
      console.error('Error loading offline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!user?.id || !connectivity?.online) return;
    
    setSyncing(true);
    try {
      const syncedCount = await offlineService?.syncOfflineProgress(user?.id);
      
      // Refresh data after sync
      await loadOfflineData();
      
      // Show success message (you might want to use a toast notification)
      console.log(`Successfully synced ${syncedCount} progress records`);
    } catch (error) {
      console.error('Error syncing progress:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveContent = async (downloadId) => {
    if (!user?.id) return;
    
    try {
      await offlineService?.removeOfflineContent(user?.id, downloadId);
      await loadOfflineData(); // Refresh data
    } catch (error) {
      console.error('Error removing content:', error);
    }
  };

  const getStoragePercentage = () => {
    if (!storageUsage || !offlineSettings) return 0;
    return Math.min((storageUsage?.total_used_mb / offlineSettings?.max_storage_mb) * 100, 100);
  };

  const formatSize = (mb) => {
    if (!mb) return '0 MB';
    if (mb >= 1024) {
      return `${(mb / 1024)?.toFixed(1)} GB`;
    }
    return `${mb?.toFixed(0)} MB`;
  };

  const tabs = [
    { id: 'library', label: 'Content Library', icon: Download },
    { id: 'storage', label: 'Storage', icon: HardDrive },
    { id: 'sync', label: 'Sync Status', icon: RefreshCw },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Loading offline content...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-8 pb-20 md:pb-8">
        <Breadcrumb />
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Offline Learning Mode
              </h1>
              <p className="text-muted-foreground">
                Download content and learn without an internet connection
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connectivity Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                connectivity?.online 
                  ? 'bg-green-100 text-green-800 border border-green-200' :'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {connectivity?.online ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
                {connectivity?.online ? 'Online' : 'Offline'}
              </div>

              {/* Sync Button */}
              <Button
                onClick={handleSync}
                disabled={!connectivity?.online || syncing || offlineProgress?.length === 0}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Progress'}
              </Button>
            </div>
          </div>

          {/* Storage Overview */}
          {storageUsage && offlineSettings && (
            <div className="mt-6 bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Storage Usage</span>
                <span className="text-sm text-muted-foreground">
                  {formatSize(storageUsage?.total_used_mb)} / {formatSize(offlineSettings?.max_storage_mb)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getStoragePercentage()}%` }}
                />
              </div>
              {getStoragePercentage() > 80 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Storage is getting full. Consider removing some content.
                </p>
              )}
            </div>
          )}

          {/* Offline Progress Alert */}
          {offlineProgress?.length > 0 && connectivity?.online && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <span className="font-medium">
                  You have {offlineProgress?.length} lesson{offlineProgress?.length !== 1 ? 's' : ''} completed offline
                </span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Click "Sync Progress" to update your online progress and earn XP.
              </p>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 bg-muted rounded-lg p-1 mb-8">
          {tabs?.map(tab => {
            const Icon = tab?.icon;
            return (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab?.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab?.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'library' && (
            <OfflineContentLibrary
              user={user}
              offlineContent={offlineContent}
              onRemoveContent={handleRemoveContent}
              onRefresh={loadOfflineData}
            />
          )}

          {activeTab === 'storage' && (
            <StorageManagement
              storageUsage={storageUsage}
              offlineSettings={offlineSettings}
              offlineContent={offlineContent}
              onRemoveContent={handleRemoveContent}
              onRefresh={loadOfflineData}
            />
          )}

          {activeTab === 'sync' && (
            <SyncStatus
              offlineProgress={offlineProgress}
              connectivity={connectivity}
              onSync={handleSync}
              syncing={syncing}
            />
          )}

          {activeTab === 'settings' && (
            <OfflineSettings
              settings={offlineSettings}
              onSettingsUpdate={(newSettings) => {
                setOfflineSettings(newSettings);
                loadOfflineData();
              }}
              userId={user?.id}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default OfflineLearningMode;