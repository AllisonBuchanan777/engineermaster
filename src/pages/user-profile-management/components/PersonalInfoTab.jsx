import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Briefcase, Edit3, Check, X } from 'lucide-react';

const PersonalInfoTab = ({ profile, onUpdate, saving, showNotification }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    bio: '',
    specialization: '',
    location: '',
    company: '',
    position: '',
    experience_years: '',
    linkedin_url: '',
    github_url: '',
    website_url: ''
  });

  const disciplines = [
    'mechanical', 'electrical', 'civil', 'chemical', 'computer',
    'aerospace', 'biomedical', 'environmental', 'materials', 'industrial'
  ];

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        bio: profile?.bio || '',
        specialization: profile?.specialization || '',
        location: profile?.preferences?.location || '',
        company: profile?.preferences?.company || '',
        position: profile?.preferences?.position || '',
        experience_years: profile?.preferences?.experience_years || '',
        linkedin_url: profile?.preferences?.linkedin_url || '',
        github_url: profile?.preferences?.github_url || '',
        website_url: profile?.preferences?.website_url || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const updates = {
        full_name: formData?.full_name,
        bio: formData?.bio,
        specialization: formData?.specialization,
        preferences: {
          ...profile?.preferences,
          location: formData?.location,
          company: formData?.company,
          position: formData?.position,
          experience_years: formData?.experience_years,
          linkedin_url: formData?.linkedin_url,
          github_url: formData?.github_url,
          website_url: formData?.website_url
        }
      };

      await onUpdate(updates);
      setEditMode(false);
    } catch (error) {
      showNotification('Failed to save changes', 'error');
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile values
    if (profile) {
      setFormData({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        bio: profile?.bio || '',
        specialization: profile?.specialization || '',
        location: profile?.preferences?.location || '',
        company: profile?.preferences?.company || '',
        position: profile?.preferences?.position || '',
        experience_years: profile?.preferences?.experience_years || '',
        linkedin_url: profile?.preferences?.linkedin_url || '',
        github_url: profile?.preferences?.github_url || '',
        website_url: profile?.preferences?.website_url || ''
      });
    }
    setEditMode(false);
  };

  const formatDisciplineName = (discipline) => {
    return discipline?.charAt(0)?.toUpperCase() + discipline?.slice(1)?.replace('_', ' ') + ' Engineering';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Basic Details</span>
          </h3>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {editMode ? (
              <input
                type="text"
                value={formData?.full_name}
                onChange={(e) => handleInputChange('full_name', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900">{profile?.full_name || 'Not specified'}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </span>
            </label>
            <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
              {profile?.email}
              <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
            </p>
          </div>

          {/* Engineering Discipline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Engineering Discipline</label>
            {editMode ? (
              <select
                value={formData?.specialization}
                onChange={(e) => handleInputChange('specialization', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a discipline...</option>
                {disciplines?.map(discipline => (
                  <option key={discipline} value={discipline}>
                    {formatDisciplineName(discipline)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900">
                {profile?.specialization ? formatDisciplineName(profile?.specialization) : 'Not specified'}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {editMode ? (
              <textarea
                value={formData?.bio}
                onChange={(e) => handleInputChange('bio', e?.target?.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-900">{profile?.bio || 'No bio provided'}</p>
            )}
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Professional Details</span>
          </h3>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            {editMode ? (
              <input
                type="text"
                value={formData?.company}
                onChange={(e) => handleInputChange('company', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your current company"
              />
            ) : (
              <p className="text-gray-900">{formData?.company || 'Not specified'}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            {editMode ? (
              <input
                type="text"
                value={formData?.position}
                onChange={(e) => handleInputChange('position', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your job title"
              />
            ) : (
              <p className="text-gray-900">{formData?.position || 'Not specified'}</p>
            )}
          </div>

          {/* Experience Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            {editMode ? (
              <select
                value={formData?.experience_years}
                onChange={(e) => handleInputChange('experience_years', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select experience level...</option>
                <option value="0-1">0-1 years</option>
                <option value="2-5">2-5 years</option>
                <option value="5-10">5-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            ) : (
              <p className="text-gray-900">{formData?.experience_years || 'Not specified'}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Location</span>
              </span>
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData?.location}
                onChange={(e) => handleInputChange('location', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            ) : (
              <p className="text-gray-900">{formData?.location || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>
      {/* Social Links */}
      {editMode && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={formData?.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={formData?.github_url}
                onChange={(e) => handleInputChange('github_url', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input
                type="url"
                value={formData?.website_url}
                onChange={(e) => handleInputChange('website_url', e?.target?.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </div>
      )}
      {/* Account Stats */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Account Information</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{profile?.current_level || 1}</div>
            <div className="text-sm text-gray-600">Current Level</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{profile?.total_xp || 0}</div>
            <div className="text-sm text-gray-600">Total XP</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{profile?.streak_days || 0}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {profile?.created_at ? new Date(profile.created_at)?.toLocaleDateString() : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Member Since</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoTab;