import React, { useState, useEffect } from 'react';
import { User, Settings, Trophy, Shield, Download, Camera, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PersonalInfoTab from './components/PersonalInfoTab';
import LearningPreferencesTab from './components/LearningPreferencesTab';
import PrivacySettingsTab from './components/PrivacySettingsTab';
import AchievementShowcaseTab from './components/AchievementShowcaseTab';

const UserProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [notification, setNotification] = useState(null);

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'preferences', name: 'Learning Preferences', icon: Settings },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'achievements', name: 'Achievements', icon: Trophy }
  ];

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase?.auth?.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.user) {
        showNotification('Please sign in to access your profile', 'error');
        return;
      }

      setUser(session?.user);

      // Load user profile
      await Promise.all([
        loadUserProfile(session?.user?.id),
        loadUserAchievements(session?.user?.id)
      ]);

    } catch (error) {
      console.error('Failed to initialize profile data:', error);
      showNotification('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select(`
          *,
          user_learning_goals(*)
        `)?.eq('id', userId)?.single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      throw error;
    }
  };

  const loadUserAchievements = async (userId) => {
    try {
      const { data, error } = await supabase?.from('user_achievements')?.select(`
          *,
          achievement_types(*)
        `)?.eq('user_id', userId)?.order('earned_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Failed to load achievements:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase?.from('user_profiles')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!user?.id || !file) return;

    setSaving(true);
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${user?.id}/avatar.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase?.storage?.from('avatars')?.upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase?.storage?.from('avatars')?.getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: data?.publicUrl });

    } catch (error) {
      console.error('Failed to upload avatar:', error);
      showNotification('Failed to upload avatar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportProfileData = async () => {
    if (!profile) return;

    try {
      const exportData = {
        profile: profile,
        achievements: achievements,
        exported_at: new Date()?.toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engineermaster-profile-${Date.now()}.json`;
      document.body?.appendChild(a);
      a?.click();
      document.body?.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification('Profile data exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export profile data:', error);
      showNotification('Failed to export profile data', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-gray-900">Profile Not Found</div>
          <p className="text-gray-600">Unable to load your profile information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`
          fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2
          ${notification?.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
        `}>
          <span>{notification?.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/10 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile?.avatar_url} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e?.target?.files?.[0] && handleAvatarUpload(e?.target?.files?.[0])}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h1>
                <p className="text-gray-600">{profile?.email}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">Level {profile?.current_level}</span>
                  <span className="text-sm text-gray-500">{profile?.total_xp} XP</span>
                  {profile?.specialization && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {profile?.specialization?.charAt(0)?.toUpperCase() + profile?.specialization?.slice(1)} Engineer
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={exportProfileData}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button
                onClick={() => updateProfile({})}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs?.map((tab) => {
                const TabIcon = tab?.icon;
                const isActive = activeTab === tab?.id;
                
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                      ${isActive 
                        ? 'border-blue-500 text-blue-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    `}
                  >
                    <TabIcon className="w-5 h-5" />
                    <span>{tab?.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'personal' && (
              <PersonalInfoTab
                profile={profile}
                onUpdate={updateProfile}
                saving={saving}
                showNotification={showNotification}
              />
            )}
            {activeTab === 'preferences' && (
              <LearningPreferencesTab
                profile={profile}
                onUpdate={updateProfile}
                saving={saving}
                showNotification={showNotification}
              />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettingsTab
                profile={profile}
                user={user}
                onUpdate={updateProfile}
                saving={saving}
                showNotification={showNotification}
              />
            )}
            {activeTab === 'achievements' && (
              <AchievementShowcaseTab
                achievements={achievements}
                profile={profile}
                showNotification={showNotification}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileManagement;