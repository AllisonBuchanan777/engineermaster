import React, { useState, useEffect } from 'react';
import { Clock, Target, Bell, BarChart3, BookOpen, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const LearningPreferencesTab = ({ profile, onUpdate, saving, showNotification }) => {
  const [preferences, setPreferences] = useState({
    daily_time_goal: 30,
    difficulty_progression: 'adaptive',
    notification_frequency: 'daily',
    preferred_content_types: [],
    study_reminders: true,
    weekend_learning: false,
    auto_advance: true,
    show_hints: true,
    track_time: true,
    preferred_study_times: []
  });

  const [learningGoals, setLearningGoals] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  const contentTypes = [
    { id: 'videos', name: 'Video Lessons', description: 'Interactive video content' },
    { id: 'simulations', name: 'Simulations', description: 'Hands-on virtual experiments' },
    { id: 'quizzes', name: 'Quizzes', description: 'Knowledge check questions' },
    { id: 'projects', name: 'Projects', description: 'Practical engineering projects' },
    { id: 'case_studies', name: 'Case Studies', description: 'Real-world engineering examples' },
    { id: 'calculations', name: 'Calculations', description: 'Mathematical problem solving' }
  ];

  const studyTimes = [
    { id: 'early_morning', name: 'Early Morning', time: '6-9 AM' },
    { id: 'morning', name: 'Morning', time: '9-12 PM' },
    { id: 'afternoon', name: 'Afternoon', time: '12-5 PM' },
    { id: 'evening', name: 'Evening', time: '5-8 PM' },
    { id: 'night', name: 'Night', time: '8-11 PM' }
  ];

  useEffect(() => {
    if (profile?.preferences) {
      setPreferences({
        daily_time_goal: profile?.preferences?.daily_time_goal || 30,
        difficulty_progression: profile?.preferences?.difficulty_progression || 'adaptive',
        notification_frequency: profile?.preferences?.notification_frequency || 'daily',
        preferred_content_types: profile?.preferences?.preferred_content_types || [],
        study_reminders: profile?.preferences?.study_reminders !== false,
        weekend_learning: profile?.preferences?.weekend_learning || false,
        auto_advance: profile?.preferences?.auto_advance !== false,
        show_hints: profile?.preferences?.show_hints !== false,
        track_time: profile?.preferences?.track_time !== false,
        preferred_study_times: profile?.preferences?.preferred_study_times || []
      });
    }
    loadLearningGoals();
  }, [profile]);

  const loadLearningGoals = async () => {
    if (!profile?.id) return;

    try {
      const { data, error } = await supabase?.from('user_learning_goals')?.select('*')?.eq('user_id', profile?.id)?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) throw error;
      setLearningGoals(data || []);
    } catch (error) {
      console.error('Failed to load learning goals:', error);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const toggleContentType = (typeId) => {
    const currentTypes = preferences?.preferred_content_types || [];
    const newTypes = currentTypes?.includes(typeId)
      ? currentTypes?.filter(id => id !== typeId)
      : [...currentTypes, typeId];
    
    handlePreferenceChange('preferred_content_types', newTypes);
  };

  const toggleStudyTime = (timeId) => {
    const currentTimes = preferences?.preferred_study_times || [];
    const newTimes = currentTimes?.includes(timeId)
      ? currentTimes?.filter(id => id !== timeId)
      : [...currentTimes, timeId];
    
    handlePreferenceChange('preferred_study_times', newTimes);
  };

  const savePreferences = async () => {
    try {
      const updatedPreferences = {
        ...profile?.preferences,
        ...preferences
      };

      await onUpdate({ preferences: updatedPreferences });
      setHasChanges(false);
      showNotification('Learning preferences updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to save preferences', 'error');
    }
  };

  const createLearningGoal = async (goalData) => {
    try {
      const { error } = await supabase?.from('user_learning_goals')?.insert([{
          user_id: profile?.id,
          ...goalData
        }]);

      if (error) throw error;
      
      await loadLearningGoals();
      showNotification('Learning goal created successfully', 'success');
    } catch (error) {
      console.error('Failed to create learning goal:', error);
      showNotification('Failed to create learning goal', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Learning Preferences</h2>
        {hasChanges && (
          <button
            onClick={savePreferences}
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        )}
      </div>
      {/* Study Schedule */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Study Schedule</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Time Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Time Goal: {preferences?.daily_time_goal} minutes
            </label>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={preferences?.daily_time_goal}
              onChange={(e) => handlePreferenceChange('daily_time_goal', parseInt(e?.target?.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>15 min</span>
              <span>3 hours</span>
            </div>
          </div>

          {/* Notification Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Reminders</label>
            <select
              value={preferences?.notification_frequency}
              onChange={(e) => handlePreferenceChange('notification_frequency', e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">No reminders</option>
              <option value="daily">Daily reminders</option>
              <option value="weekly">Weekly summary</option>
              <option value="custom">Custom schedule</option>
            </select>
          </div>
        </div>

        {/* Preferred Study Times */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            When do you prefer to study?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {studyTimes?.map((time) => (
              <button
                key={time?.id}
                onClick={() => toggleStudyTime(time?.id)}
                className={`
                  p-3 rounded-lg border-2 text-center transition-all
                  ${preferences?.preferred_study_times?.includes(time?.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700' :'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="font-medium text-sm">{time?.name}</div>
                <div className="text-xs text-gray-500">{time?.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Learning Style */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>Learning Style</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Progression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Progression</label>
            <select
              value={preferences?.difficulty_progression}
              onChange={(e) => handlePreferenceChange('difficulty_progression', e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="slow">Gradual (Take your time)</option>
              <option value="adaptive">Adaptive (Adjusts to performance)</option>
              <option value="fast">Accelerated (Challenge me)</option>
              <option value="manual">Manual (I'll choose difficulty)</option>
            </select>
          </div>

          {/* Learning Toggles */}
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences?.auto_advance}
                onChange={(e) => handlePreferenceChange('auto_advance', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Auto-advance lessons</span>
                <p className="text-sm text-gray-600">Automatically move to next lesson after completion</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences?.show_hints}
                onChange={(e) => handlePreferenceChange('show_hints', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Show hints</span>
                <p className="text-sm text-gray-600">Display helpful hints during lessons and quizzes</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences?.weekend_learning}
                onChange={(e) => handlePreferenceChange('weekend_learning', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Weekend learning</span>
                <p className="text-sm text-gray-600">Include weekends in your study schedule</p>
              </div>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences?.track_time}
                onChange={(e) => handlePreferenceChange('track_time', e?.target?.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-gray-900">Track study time</span>
                <p className="text-sm text-gray-600">Monitor time spent on lessons and activities</p>
              </div>
            </label>
          </div>
        </div>
      </div>
      {/* Content Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>Preferred Content Types</span>
        </h3>
        <p className="text-gray-600">Select the types of learning content you enjoy most</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentTypes?.map((type) => (
            <label
              key={type?.id}
              className={`
                flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all
                ${preferences?.preferred_content_types?.includes(type?.id)
                  ? 'border-blue-500 bg-blue-50' :'border-gray-200 hover:border-gray-300'}
              `}
            >
              <input
                type="checkbox"
                checked={preferences?.preferred_content_types?.includes(type?.id)}
                onChange={() => toggleContentType(type?.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <div>
                <span className="font-medium text-gray-900">{type?.name}</span>
                <p className="text-sm text-gray-600">{type?.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      {/* Learning Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Current Learning Goals</span>
        </h3>

        {learningGoals?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learningGoals?.map((goal) => (
              <div key={goal?.id} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{goal?.goal_type?.replace('_', ' ')?.toUpperCase()}</h4>
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{goal?.current_value || 0} / {goal?.target_value}</span>
                    <span>{goal?.target_date ? new Date(goal.target_date)?.toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (goal?.current_value || 0) / goal?.target_value * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No learning goals set yet</p>
            <p className="text-sm">Goals help track your progress and maintain motivation</p>
          </div>
        )}
      </div>
      {/* Notification Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium text-gray-900">Study reminders</span>
              <p className="text-sm text-gray-600">Get notified when it's time to study</p>
            </div>
            <input
              type="checkbox"
              checked={preferences?.study_reminders}
              onChange={(e) => handlePreferenceChange('study_reminders', e?.target?.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default LearningPreferencesTab;