import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { HardDrive, Trash2, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const StorageManagement = ({ 
  storageUsage, 
  offlineSettings, 
  offlineContent, 
  onRemoveContent, 
  onRefresh 
}) => {
  const [removing, setRemoving] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(null);

  const formatSize = (mb) => {
    if (!mb) return '0 MB';
    if (mb >= 1024) {
      return `${(mb / 1024)?.toFixed(1)} GB`;
    }
    return `${mb?.toFixed(0)} MB`;
  };

  const getStoragePercentage = () => {
    if (!storageUsage || !offlineSettings) return 0;
    return Math.min((storageUsage?.total_used_mb / offlineSettings?.max_storage_mb) * 100, 100);
  };

  const handleRemove = async (downloadId) => {
    setRemoving(prev => new Set(prev.add(downloadId)));
    try {
      await onRemoveContent?.(downloadId);
      setShowConfirm(null);
    } catch (error) {
      console.error('Error removing content:', error);
    } finally {
      setRemoving(prev => {
        const newSet = new Set(prev);
        newSet?.delete(downloadId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      downloaded: 'text-green-600',
      downloading: 'text-blue-600',
      failed: 'text-red-600',
      expired: 'text-orange-600',
      pending: 'text-gray-600'
    };
    return colors?.[status] || 'text-gray-600';
  };

  const getStatusIcon = (status) => {
    const icons = {
      downloaded: CheckCircle,
      downloading: RefreshCw,
      failed: AlertTriangle,
      expired: Clock,
      pending: Clock
    };
    const Icon = icons?.[status] || Clock;
    return <Icon className={`w-4 h-4 ${status === 'downloading' ? 'animate-spin' : ''}`} />;
  };

  const sortedContent = offlineContent?.slice()?.sort((a, b) => {
    // Sort by status (downloaded first), then by size (largest first)
    if (a?.status !== b?.status) {
      const statusOrder = { downloaded: 0, downloading: 1, failed: 2, expired: 3, pending: 4 };
      return (statusOrder?.[a?.status] || 5) - (statusOrder?.[b?.status] || 5);
    }
    return (b?.download_size_mb || 0) - (a?.download_size_mb || 0);
  });

  const storageBreakdown = {
    used: storageUsage?.total_used_mb || 0,
    available: Math.max(0, (offlineSettings?.max_storage_mb || 0) - (storageUsage?.total_used_mb || 0)),
    total: offlineSettings?.max_storage_mb || 0
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Storage Overview</h3>
        </div>

        {/* Storage Usage Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Storage Usage</span>
            <span className="text-sm text-muted-foreground">
              {formatSize(storageBreakdown?.used)} / {formatSize(storageBreakdown?.total)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-300 ${
                getStoragePercentage() > 90 ? 'bg-red-500' :
                getStoragePercentage() > 70 ? 'bg-amber-500': 'bg-primary'
              }`}
              style={{ width: `${getStoragePercentage()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{getStoragePercentage()?.toFixed(1)}% used</span>
            <span>{formatSize(storageBreakdown?.available)} available</span>
          </div>
        </div>

        {/* Storage Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {formatSize(storageUsage?.lesson_content_mb || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Lessons</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formatSize(storageUsage?.simulation_files_mb || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Simulations</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatSize(storageUsage?.reference_materials_mb || 0)}
            </div>
            <div className="text-sm text-muted-foreground">References</div>
          </div>
        </div>

        {/* Storage Warnings */}
        {getStoragePercentage() > 90 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Storage Almost Full</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              You're using {getStoragePercentage()?.toFixed(1)}% of your storage. 
              Consider removing some content to free up space.
            </p>
          </div>
        )}

        {getStoragePercentage() > 70 && getStoragePercentage() <= 90 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Storage Getting Full</span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              You're using {getStoragePercentage()?.toFixed(1)}% of your storage. 
              You may want to clean up some old content.
            </p>
          </div>
        )}
      </div>
      {/* Content Management */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Downloaded Content</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {sortedContent?.length > 0 ? (
          <div className="space-y-3">
            {sortedContent?.map(content => (
              <div key={content?.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`flex items-center gap-2 ${getStatusColor(content?.status)}`}>
                    {getStatusIcon(content?.status)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {content?.lessons?.title || 'Unknown Lesson'}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Size: {formatSize(content?.download_size_mb)}</span>
                    {content?.downloaded_at && (
                      <span>
                        Downloaded: {new Date(content.downloaded_at)?.toLocaleDateString()}
                      </span>
                    )}
                    {content?.expires_at && (
                      <span>
                        Expires: {new Date(content.expires_at)?.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {content?.status === 'downloading' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-blue-600">Downloading...</span>
                        <span className="text-xs font-medium">{content?.download_progress || 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${content?.download_progress || 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {content?.status === 'downloaded' || content?.status === 'failed' || content?.status === 'expired' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirm(content?.id)}
                      disabled={removing?.has(content?.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      {removing?.has(content?.id) ? 'Removing...' : 'Remove'}
                    </Button>
                  ) : (
                    <div className="text-xs text-muted-foreground px-3 py-1">
                      {content?.status === 'downloading' ? 'In Progress' :
                       content?.status === 'pending'? 'Queued' : 'Processing...'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HardDrive className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Downloaded Content</h3>
            <p className="text-muted-foreground">
              Visit the Content Library to download lessons for offline access.
            </p>
          </div>
        )}
      </div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-foreground">Remove Content</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this content from your device? 
              You can download it again later, but you'll lose any offline progress.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRemove(showConfirm)}
                disabled={removing?.has(showConfirm)}
              >
                {removing?.has(showConfirm) ? 'Removing...' : 'Remove Content'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageManagement;