import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { Settings, Save, RefreshCw, AlertCircle, CheckCircle, Wifi, HardDrive } from 'lucide-react';
import { offlineService } from '../../../services/offlineService';

const OfflineSettings = ({ settings, onSettingsUpdate, userId }) => {
  const [formData, setFormData] = useState({
    auto_download_enabled: false,
    max_storage_mb: 1024,
    download_on_wifi_only: true,
    content_expiry_days: 30,
    preferred_quality: 'standard',
    sync_frequency_hours: 24
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        auto_download_enabled: settings?.auto_download_enabled ?? false,
        max_storage_mb: settings?.max_storage_mb ?? 1024,
        download_on_wifi_only: settings?.download_on_wifi_only ?? true,
        content_expiry_days: settings?.content_expiry_days ?? 30,
        preferred_quality: settings?.preferred_quality ?? 'standard',
        sync_frequency_hours: settings?.sync_frequency_hours ?? 24
      });
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const updatedSettings = await offlineService?.updateOfflineSettings(userId, formData);
      onSettingsUpdate?.(updatedSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatStorageSize = (mb) => {
    if (mb >= 1024) {
      return `${(mb / 1024)?.toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const getQualityDescription = (quality) => {
    const descriptions = {
      low: 'Smaller file sizes, basic quality (recommended for limited data)',
      standard: 'Balanced quality and file size (recommended for most users)',
      high: 'Best quality, larger file sizes (recommended for unlimited data)'
    };
    return descriptions?.[quality] || descriptions?.standard;
  };

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Offline Learning Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Auto Download */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Auto Download</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically download new lessons when they become available
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData?.auto_download_enabled}
                  onChange={(e) => handleChange('auto_download_enabled', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>

          {/* WiFi Only Downloads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Wifi className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground">Download on Wi-Fi Only</h4>
                  <p className="text-sm text-muted-foreground">
                    Prevent cellular data usage for downloads
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData?.download_on_wifi_only}
                  onChange={(e) => handleChange('download_on_wifi_only', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>

          {/* Storage Limit */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <HardDrive className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Maximum Storage</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Limit how much device storage can be used for offline content
                </p>
                
                <div className="space-y-3">
                  <input
                    type="range"
                    min="512"
                    max="8192"
                    step="512"
                    value={formData?.max_storage_mb}
                    onChange={(e) => handleChange('max_storage_mb', parseInt(e?.target?.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">512 MB</span>
                    <span className="font-medium text-primary">
                      {formatStorageSize(formData?.max_storage_mb)}
                    </span>
                    <span className="text-muted-foreground">8 GB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Quality */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Content Quality</h4>
            <p className="text-sm text-muted-foreground">
              Choose quality level for downloaded content
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['low', 'standard', 'high']?.map(quality => (
                <label
                  key={quality}
                  className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                    formData?.preferred_quality === quality
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="quality"
                    value={quality}
                    checked={formData?.preferred_quality === quality}
                    onChange={(e) => handleChange('preferred_quality', e?.target?.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-foreground capitalize">
                      {quality} Quality
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {quality === 'low' && 'Faster downloads'}
                      {quality === 'standard' && 'Recommended'}
                      {quality === 'high' && 'Best experience'}
                    </div>
                  </div>
                  {formData?.preferred_quality === quality && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </label>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground">
              {getQualityDescription(formData?.preferred_quality)}
            </p>
          </div>

          {/* Content Expiry */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Content Expiry</h4>
            <p className="text-sm text-muted-foreground">
              Automatically remove downloaded content after this many days
            </p>
            
            <select
              value={formData?.content_expiry_days}
              onChange={(e) => handleChange('content_expiry_days', parseInt(e?.target?.value))}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={0}>Never expire</option>
            </select>
          </div>

          {/* Sync Frequency */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Auto Sync Frequency</h4>
            <p className="text-sm text-muted-foreground">
              How often to automatically sync progress when online
            </p>
            
            <select
              value={formData?.sync_frequency_hours}
              onChange={(e) => handleChange('sync_frequency_hours', parseInt(e?.target?.value))}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={1}>Every hour</option>
              <option value={6}>Every 6 hours</option>
              <option value={12}>Every 12 hours</option>
              <option value={24}>Once daily</option>
              <option value={72}>Every 3 days</option>
              <option value={0}>Manual only</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
          {hasChanges && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 ml-auto"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
      {/* Storage Recommendations */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Storage Recommendations</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Light Usage</h4>
            <p className="text-sm text-blue-700 mb-2">
              5-10 lessons at a time
            </p>
            <p className="text-xs text-blue-600">
              Recommended: 1-2 GB storage
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Heavy Usage</h4>
            <p className="text-sm text-green-700 mb-2">
              Multiple courses with simulations
            </p>
            <p className="text-xs text-green-600">
              Recommended: 4-8 GB storage
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Storage Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Lower quality settings use less storage but may affect learning experience</li>
                <li>• Wi-Fi only downloads help preserve cellular data</li>
                <li>• Auto-expiry keeps storage usage manageable</li>
                <li>• You can always manually remove content you no longer need</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineSettings;