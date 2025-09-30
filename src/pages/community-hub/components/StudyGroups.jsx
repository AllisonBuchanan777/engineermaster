import React, { useState } from 'react';
import { Users, Calendar, Clock, BookOpen, Plus, Filter, Star, User } from 'lucide-react';
import { studyGroupService } from '../../../services/communityService';

const StudyGroups = ({ studyGroups, searchQuery, selectedDiscipline, onRefresh }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);

  // Filter study groups based on search and discipline
  const filteredGroups = studyGroups?.filter(group => {
    const matchesSearch = !searchQuery || 
      group?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      group?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    
    const matchesDiscipline = !selectedDiscipline || 
      group?.discipline === selectedDiscipline;
    
    return matchesSearch && matchesDiscipline;
  }) || [];

  const handleJoinGroup = async (groupId) => {
    setJoinLoading(groupId);
    try {
      const { data, error } = await studyGroupService?.joinStudyGroup(groupId);
      if (data && !error) {
        onRefresh?.();
      }
    } catch (error) {
      console.error('Error joining study group:', error);
    } finally {
      setJoinLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'full':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisciplineIcon = (discipline) => {
    const icons = {
      mechanical: '🔧',
      electrical: '⚡',
      civil: '🏗️',
      chemical: '🧪',
      computer: '💻',
      aerospace: '✈️',
      biomedical: '🩺',
      environmental: '🌱',
      materials: '⚗️',
      industrial: '🏭'
    };
    return icons?.[discipline] || '📚';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Study Groups</h2>
        <button 
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </button>
      </div>

      {filteredGroups?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups found</h3>
          <p className="text-gray-600 mb-4">Create the first study group for your discipline</p>
          <button 
            onClick={() => setShowCreateGroup(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create Study Group
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups?.map(group => (
            <div key={group?.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Group Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getDisciplineIcon(group?.discipline)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{group?.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group?.status)}`}>
                      {group?.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Group Description */}
              <p className="text-gray-600 mb-4 line-clamp-2">{group?.description}</p>

              {/* Group Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{group?.current_members}/{group?.max_members}</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    <span className="capitalize">{group?.discipline}</span>
                  </div>
                </div>
              </div>

              {/* Meeting Schedule */}
              {group?.meeting_schedule && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-sm text-blue-800">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {group?.meeting_schedule?.day}s at {group?.meeting_schedule?.time}
                    </span>
                  </div>
                  {group?.meeting_schedule?.duration && (
                    <div className="flex items-center text-sm text-blue-700 mt-1">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{group?.meeting_schedule?.duration}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Group Creator */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={group?.created_by_user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(group?.created_by_user?.full_name || 'User')}&background=random`}
                    alt={group?.created_by_user?.full_name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600">
                    Created by {group?.created_by_user?.full_name}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-gray-100">
                {group?.status === 'open' ? (
                  <button
                    onClick={() => handleJoinGroup(group?.id)}
                    disabled={joinLoading === group?.id}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {joinLoading === group?.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Join Group
                      </>
                    )}
                  </button>
                ) : group?.status === 'full' ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Group Full
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                  >
                    Closed
                  </button>
                )}
              </div>

              {/* Member Count Progress */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Members</span>
                  <span>{group?.current_members}/{group?.max_members}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${((group?.current_members || 0) / (group?.max_members || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Featured Study Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <Star className="w-6 h-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Study Group Tips</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Regular Schedule</h4>
              <p className="text-sm text-gray-600">Set consistent meeting times that work for everyone</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <BookOpen className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Focused Topics</h4>
              <p className="text-sm text-gray-600">Prepare agenda and specific topics for each session</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-purple-100 rounded-full p-2 mr-3">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Active Participation</h4>
              <p className="text-sm text-gray-600">Encourage everyone to contribute and ask questions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;