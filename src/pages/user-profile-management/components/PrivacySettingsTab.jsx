import React, { useState } from 'react';
import { Shield, Eye, Lock, AlertTriangle, Download, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const PrivacySettingsTab = ({ profile, user, onUpdate, saving, showNotification }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: profile?.preferences?.profile_visibility || 'public',
    show_progress: profile?.preferences?.show_progress !== false,
    show_achievements: profile?.preferences?.show_achievements !== false,
    allow_messaging: profile?.preferences?.allow_messaging !== false,
    show_in_leaderboard: profile?.preferences?.show_in_leaderboard !== false,
    data_sharing: profile?.preferences?.data_sharing !== false,
    marketing_emails: profile?.preferences?.marketing_emails !== false,
    study_reminders: profile?.preferences?.study_reminders !== false
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const savePrivacySettings = async () => {
    try {
      const updatedPreferences = {
        ...profile?.preferences,
        ...privacySettings
      };

      await onUpdate({ preferences: updatedPreferences });
      setHasChanges(false);
      showNotification('Privacy settings updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to save privacy settings', 'error');
    }
  };

  const exportUserData = async () => {
    try {
      // Export user profile data
      const { data: profileData, error: profileError } = await supabase?.from('user_profiles')?.select('*')?.eq('id', user?.id)?.single();

      if (profileError) throw profileError;

      // Export user achievements
      const { data: achievementsData, error: achievementsError } = await supabase?.from('user_achievements')?.select(`
          *,
          achievement_types(*)
        `)?.eq('user_id', user?.id);

      if (achievementsError) throw achievementsError;

      // Export learning progress
      const { data: progressData, error: progressError } = await supabase?.from('user_lesson_progress')?.select('*')?.eq('user_id', user?.id);

      if (progressError) throw progressError;

      // Export XP transactions
      const { data: xpData, error: xpError } = await supabase?.from('xp_transactions')?.select('*')?.eq('user_id', user?.id);

      if (xpError) throw xpError;

      const exportData = {
        exported_at: new Date()?.toISOString(),
        profile: profileData,
        achievements: achievementsData,
        learning_progress: progressData,
        xp_transactions: xpData
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engineermaster-data-${Date.now()}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('User data exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export user data:', error);
      showNotification('Failed to export user data', 'error');
    }
  };

  const deleteUserAccount = async () => {
    if (deleteConfirmText !== 'DELETE MY ACCOUNT') {
      showNotification('Please type "DELETE MY ACCOUNT" to confirm', 'error');
      return;
    }

    try {
      // Delete user data in correct order (children first)
      await supabase?.from('user_achievements')?.delete()?.eq('user_id', user?.id);
      await supabase?.from('user_lesson_progress')?.delete()?.eq('user_id', user?.id);
      await supabase?.from('xp_transactions')?.delete()?.eq('user_id', user?.id);
      await supabase?.from('user_learning_goals')?.delete()?.eq('user_id', user?.id);
      await supabase?.from('user_skill_progress')?.delete()?.eq('user_id', user?.id);
      await supabase?.from('user_onboarding')?.delete()?.eq('user_id', user?.id);
      await supabase?.from('user_profiles')?.delete()?.eq('id', user?.id);

      // Sign out user
      await supabase?.auth?.signOut();
      
      showNotification('Account deleted successfully', 'success');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      showNotification('Failed to delete account', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Privacy & Security</h2>
        {hasChanges && (
          <button
            onClick={savePrivacySettings}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        )}
      </div>
      {/* Profile Visibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Profile Visibility</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who can see your profile?</label>
            <select
              value={privacySettings?.profile_visibility}
              onChange={(e) => handlePrivacyChange('profile_visibility', e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="public">Public - Anyone can see my profile</option>
              <option value="community">Community - Only EngineerMaster users</option>
              <option value="connections">Connections - Only people I connect with</option>
              <option value="private">Private - Only me</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Show learning progress</span>
                <p className="text-sm text-gray-600">Display your XP, level, and completion stats</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings?.show_progress}
                onChange={(e) => handlePrivacyChange('show_progress', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Show achievements</span>
                <p className="text-sm text-gray-600">Display your badges and certifications</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings?.show_achievements}
                onChange={(e) => handlePrivacyChange('show_achievements', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Allow messaging</span>
                <p className="text-sm text-gray-600">Let other users send you messages</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings?.allow_messaging}
                onChange={(e) => handlePrivacyChange('allow_messaging', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">Show in leaderboard</span>
                <p className="text-sm text-gray-600">Appear in public rankings and competitions</p>
              </div>
              <input
                type="checkbox"
                checked={privacySettings?.show_in_leaderboard}
                onChange={(e) => handlePrivacyChange('show_in_leaderboard', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>
      </div>
      {/* Data & Communication */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Lock className="w-5 h-5" />
          <span>Data & Communication</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Anonymous data sharing</span>
              <p className="text-sm text-gray-600">Help improve the platform with anonymized usage data</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings?.data_sharing}
              onChange={(e) => handlePrivacyChange('data_sharing', e?.target?.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Marketing emails</span>
              <p className="text-sm text-gray-600">Receive updates about new features and courses</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings?.marketing_emails}
              onChange={(e) => handlePrivacyChange('marketing_emails', e?.target?.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Study reminder notifications</span>
              <p className="text-sm text-gray-600">Get helpful reminders to maintain your learning streak</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings?.study_reminders}
              onChange={(e) => handlePrivacyChange('study_reminders', e?.target?.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
      {/* Account Security */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Account Security</span>
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Password Security</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your password is encrypted and secure. We recommend using a strong, unique password.
              </p>
              <button 
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                onClick={() => showNotification('Password reset email would be sent in production', 'success')}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Data Management */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Data Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportUserData}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Export My Data</div>
              <div className="text-sm text-gray-600">Download all your data in JSON format</div>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center space-x-2 p-4 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Delete Account</div>
              <div className="text-sm">Permanently remove your account and data</div>
            </div>
          </button>
        </div>
      </div>
      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your progress, achievements, and account data will be permanently deleted.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type "DELETE MY ACCOUNT" to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="DELETE MY ACCOUNT"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteUserAccount}
                disabled={deleteConfirmText !== 'DELETE MY ACCOUNT'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacySettingsTab;