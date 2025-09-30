import React, { useState, useEffect } from 'react';
import { Settings, Shield, Bell, Database, Key, Globe, Save, RefreshCw, AlertCircle, CheckCircle, Info, Eye, EyeOff, Copy, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const SystemSettingsTab = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    platform: {
      siteName: 'EngineerMaster',
      siteDescription: 'Master Engineering Skills with Interactive Learning',
      maintenanceMode: false,
      allowRegistration: true,
      requireEmailVerification: true
    },
    security: {
      sessionTimeout: 24,
      passwordMinLength: 8,
      requireMFA: false,
      allowPasswordReset: true,
      maxLoginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      marketingEmails: false,
      systemAlerts: true
    },
    content: {
      autoPublishLessons: false,
      moderateComments: true,
      allowUserGeneratedContent: true,
      contentBackups: true
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    database: 'Connected',
    storage: '2.4 GB used',
    uptime: '15 days, 6 hours'
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    navigator?.clipboard?.writeText('sk-1234567890abcdef...');
    alert('API key copied to clipboard');
  };

  const generateNewApiKey = () => {
    if (window?.confirm('Are you sure you want to generate a new API key? This will invalidate the current key.')) {
      alert('New API key generated successfully');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
          <p className="text-gray-600 text-sm">
            Configure platform settings, security parameters, and system preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {saved && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Settings Saved</span>
            </div>
          )}
          
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className={`
              flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white 
              rounded-lg hover:bg-blue-700 transition-colors
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-gray-500" />
          System Status
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Platform</span>
            </div>
            <p className="text-sm text-green-800 mt-1">Running v{systemInfo?.version}</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Database</span>
            </div>
            <p className="text-sm text-green-800 mt-1">{systemInfo?.database}</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Storage</span>
            </div>
            <p className="text-sm text-blue-800 mt-1">{systemInfo?.storage}</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Uptime</span>
            </div>
            <p className="text-sm text-purple-800 mt-1">{systemInfo?.uptime}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Platform Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-gray-500" />
            Platform Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings?.platform?.siteName}
                onChange={(e) => handleSettingChange('platform', 'siteName', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                value={settings?.platform?.siteDescription}
                onChange={(e) => handleSettingChange('platform', 'siteDescription', e?.target?.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                  <p className="text-xs text-gray-500">Temporarily disable public access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.platform?.maintenanceMode}
                    onChange={(e) => handleSettingChange('platform', 'maintenanceMode', e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Allow Registration</span>
                  <p className="text-xs text-gray-500">Let new users create accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.platform?.allowRegistration}
                    onChange={(e) => handleSettingChange('platform', 'allowRegistration', e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Email Verification</span>
                  <p className="text-xs text-gray-500">Require email verification for new accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.platform?.requireEmailVerification}
                    onChange={(e) => handleSettingChange('platform', 'requireEmailVerification', e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-gray-500" />
            Security Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={settings?.security?.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Password Length
              </label>
              <input
                type="number"
                min="6"
                max="20"
                value={settings?.security?.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={settings?.security?.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e?.target?.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Multi-Factor Auth</span>
                  <p className="text-xs text-gray-500">Require 2FA for admin accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.security?.requireMFA}
                    onChange={(e) => handleSettingChange('security', 'requireMFA', e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Password Reset</span>
                  <p className="text-xs text-gray-500">Allow users to reset passwords via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.security?.allowPasswordReset}
                    onChange={(e) => handleSettingChange('security', 'allowPasswordReset', e?.target?.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-gray-500" />
            Notification Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                <p className="text-xs text-gray-500">Send notifications via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.emailNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Push Notifications</span>
                <p className="text-xs text-gray-500">Send push notifications to browsers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.pushNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">Daily Digest</span>
                <p className="text-xs text-gray-500">Send daily activity summaries</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.dailyDigest}
                  onChange={(e) => handleSettingChange('notifications', 'dailyDigest', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">System Alerts</span>
                <p className="text-xs text-gray-500">Critical system notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.notifications?.systemAlerts}
                  onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e?.target?.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* API & Integration */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-gray-500" />
            API & Integration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value="sk-1234567890abcdef..."
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={copyApiKey}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={generateNewApiKey}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Generate New Key
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-500">
                  Last used: 2 hours ago
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Keep your API key secure and never share it publicly. 
                    Generate a new key if you suspect it has been compromised.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Maintenance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-gray-500" />
          Backup & Maintenance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Export Data</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Database className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Backup Database</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border border-red-300 rounded-lg hover:bg-red-50 text-red-600 transition-colors">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Clear Cache</span>
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Last Backup</span>
              <p className="text-xs text-gray-500">Database backup completed successfully</p>
            </div>
            <span className="text-sm text-green-600">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsTab;