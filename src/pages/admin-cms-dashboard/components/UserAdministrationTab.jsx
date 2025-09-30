import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, MoreVertical, Mail, Shield, Eye, Edit, CheckCircle, XCircle, Award, Activity, UserPlus, Download } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../../../services/adminService';

const UserAdministrationTab = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminService?.getUsers({
        limit: 100
      });
      
      if (error) {
        console.error('Error loading users:', error);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered?.filter(user =>
        user?.full_name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        user?.username?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered?.filter(user => user?.role === roleFilter);
    }

    // Status filter (active/inactive based on last activity)
    if (statusFilter !== 'all') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);
      
      filtered = filtered?.filter(user => {
        const isActive = user?.last_activity_date && 
          new Date(user?.last_activity_date) > thirtyDaysAgo;
        
        return statusFilter === 'active' ? isActive : !isActive;
      });
    }

    setFilteredUsers(filtered);
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      const { data, error } = await adminService?.updateUser(
        userId,
        { role: newRole },
        user?.id
      );

      if (error) {
        console.error('Error updating user role:', error);
        alert('Failed to update user role');
        return;
      }

      // Update local state
      setUsers(prevUsers =>
        prevUsers?.map(u =>
          u?.id === userId ? { ...u, role: newRole } : u
        )
      );

      alert('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'instructor': 'bg-purple-100 text-purple-800',
      'student': 'bg-blue-100 text-blue-800'
    };
    return colors?.[role] || 'bg-gray-100 text-gray-800';
  };

  const getSubscriptionStatus = (userSubs) => {
    if (!userSubs || userSubs?.length === 0) {
      return { status: 'Free', color: 'bg-gray-100 text-gray-800' };
    }
    
    const sub = userSubs?.[0];
    const colors = {
      'trial': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    
    return {
      status: sub?.tier?.charAt(0)?.toUpperCase() + sub?.tier?.slice(1),
      color: colors?.[sub?.status] || 'bg-gray-100 text-gray-800'
    };
  };

  const isActiveUser = (user) => {
    if (!user?.last_activity_date) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo?.setDate(thirtyDaysAgo?.getDate() - 30);
    return new Date(user?.last_activity_date) > thirtyDaysAgo;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          {[...Array(8)]?.map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 mb-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Administration</h2>
          <p className="text-gray-600 text-sm">
            Manage user accounts, roles, permissions, and subscription status
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Users</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{users?.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-xl font-bold text-gray-900">
                {users?.filter(u => isActiveUser(u))?.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-xl font-bold text-gray-900">
                {users?.filter(u => u?.role === 'admin')?.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Subscribers</p>
              <p className="text-xl font-bold text-gray-900">
                {users?.filter(u => u?.user_subscriptions?.length > 0)?.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e?.target?.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredUsers?.length} of {users?.length} users
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    No users match your current filters
                  </td>
                </tr>
              ) : (
                filteredUsers?.map((user) => {
                  const subStatus = getSubscriptionStatus(user?.user_subscriptions);
                  
                  return (
                    <tr key={user?.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user?.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user?.role}
                          onChange={(e) => handleUserRoleUpdate(user?.id, e?.target?.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-none ${getRoleColor(user?.role)}`}
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${subStatus?.color}`}>
                          {subStatus?.status}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {isActiveUser(user) ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <span>
                            {user?.last_activity_date 
                              ? new Date(user?.last_activity_date)?.toLocaleDateString()
                              : 'Never'
                            }
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>Level {user?.current_level || 1}</div>
                          <div>{user?.total_xp?.toLocaleString() || 0} XP</div>
                          <div>{user?.streak_days || 0} day streak</div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          <button className="text-gray-600 hover:text-gray-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          <button className="text-gray-600 hover:text-gray-900">
                            <Mail className="h-4 w-4" />
                          </button>
                          
                          <button className="text-gray-600 hover:text-gray-900">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredUsers?.length > 20 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to {Math?.min(20, filteredUsers?.length)} of {filteredUsers?.length} results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdministrationTab;