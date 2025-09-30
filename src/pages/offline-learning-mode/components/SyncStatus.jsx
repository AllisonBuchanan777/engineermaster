import React from 'react';
import Button from '../../../components/ui/Button';
import { RotateCcw, CheckCircle, AlertCircle, Clock, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const SyncStatus = ({ offlineProgress, connectivity, onSync, syncing }) => {
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    const now = new Date();
    const then = new Date(dateString);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-orange-100 text-orange-800 border-orange-200',
      expert: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors?.[difficulty] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getConnectionQuality = () => {
    if (!connectivity?.online) return { status: 'offline', color: 'text-red-600', icon: WifiOff };
    
    const effectiveType = connectivity?.effectiveType;
    if (effectiveType === '4g' || effectiveType === '5g') {
      return { status: 'excellent', color: 'text-green-600', icon: Wifi };
    }
    if (effectiveType === '3g') {
      return { status: 'good', color: 'text-yellow-600', icon: Wifi };
    }
    if (effectiveType === '2g') {
      return { status: 'slow', color: 'text-orange-600', icon: Wifi };
    }
    return { status: 'unknown', color: 'text-gray-600', icon: Wifi };
  };

  const connectionInfo = getConnectionQuality();
  const ConnectionIcon = connectionInfo?.icon;

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <ConnectionIcon className={`w-6 h-6 ${connectionInfo?.color}`} />
          <h3 className="text-xl font-semibold text-foreground">Connection Status</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className={`text-2xl font-bold ${connectionInfo?.color}`}>
              {connectivity?.online ? 'Online' : 'Offline'}
            </div>
            <div className="text-sm text-muted-foreground">Network Status</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {connectivity?.effectiveType?.toUpperCase() || 'Unknown'}
            </div>
            <div className="text-sm text-muted-foreground">Connection Type</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {connectivity?.downlink ? `${connectivity?.downlink} Mbps` : 'Unknown'}
            </div>
            <div className="text-sm text-muted-foreground">Download Speed</div>
          </div>
        </div>

        {!connectivity?.online && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">You're Offline</span>
            </div>
            <p className="text-amber-700 text-sm mt-1">
              Your progress is being saved locally and will sync when you're back online.
            </p>
          </div>
        )}
      </div>
      {/* Sync Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Sync Progress</h3>
          
          <Button
            onClick={onSync}
            disabled={!connectivity?.online || syncing || offlineProgress?.length === 0}
            className="flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {offlineProgress?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Lessons Completed Offline</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {offlineProgress?.filter(p => p?.completion_percentage === 100)?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Ready to Award XP</div>
          </div>
        </div>

        {offlineProgress?.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Synced Up!</h3>
            <p className="text-muted-foreground">
              No offline progress to sync. Your learning data is up to date.
            </p>
          </div>
        )}
      </div>
      {/* Offline Progress Details */}
      {offlineProgress?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">Pending Sync</h3>
          
          <div className="space-y-3">
            {offlineProgress?.map(progress => (
              <div key={progress?.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    {progress?.completion_percentage === 100 ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Clock className="w-6 h-6 text-orange-500" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {progress?.lessons?.title || 'Unknown Lesson'}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Progress: {progress?.completion_percentage || 0}%</span>
                    {progress?.time_spent_minutes && (
                      <span>Time: {progress?.time_spent_minutes} minutes</span>
                    )}
                    <span>Completed: {formatTimeAgo(progress?.offline_timestamp)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress?.completion_percentage === 100 ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${progress?.completion_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium text-foreground">
                    {progress?.completion_percentage === 100 ? 'Completed' : 'In Progress'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {progress?.sync_status === 'offline_only' ? 'Needs Sync' : 'Synced'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sync Benefits */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">When you sync:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your learning progress will be updated online</li>
              <li>• You'll earn XP and unlock achievements</li>
              <li>• Your learning streak will be maintained</li>
              <li>• Progress will be visible across all devices</li>
            </ul>
          </div>
        </div>
      )}
      {/* Sync History */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4">Sync Tips</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Wifi className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Best Connection</h4>
              <p className="text-sm text-muted-foreground">
                Sync works best on Wi-Fi or strong cellular connections for faster uploads.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Auto Sync</h4>
              <p className="text-sm text-muted-foreground">
                Progress automatically syncs when you come back online. Manual sync ensures immediate updates.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Data Safety</h4>
              <p className="text-sm text-muted-foreground">
                Your offline progress is safely stored locally and won't be lost if you close the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncStatus;