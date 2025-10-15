// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NDMALogo from '../components/common/NDMALogo';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Award, 
  MapPin, 
  UserCheck,
  AlertCircle,
  CheckCircle,
  FileText,
  Plus,
  Eye,
  Settings,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Bell,
  Shield
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const fetchDashboardData = async (role, state) => {
  try {
    // Fetch different data based on role and permissions
    const endpoints = [
      '/trainings/stats/analytics',
      '/trainings?limit=5&sort=-createdAt',
    ];

    // Add role-specific endpoints
    if (['Admin', 'SuperAdmin'].includes(role)) {
      endpoints.push('/auth/pending-approvals');
      endpoints.push('/auth/user-stats');
    }

    if (state) {
      endpoints.push(`/trainings/stats/state/${state}`);
    }

    const responses = await Promise.all(
      endpoints.map(endpoint => 
        axios.get(endpoint).catch(err => ({ data: { data: null } }))
      )
    );

    return {
      analytics: responses[0]?.data?.data || {},
      recentTrainings: responses[1]?.data?.data || [],
      pendingApprovals: responses[2]?.data?.data || [],
      userStats: responses[3]?.data?.data || {},
      stateStats: responses[4]?.data?.data || {}
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

const Dashboard = () => {
  const { 
    user, 
    hasRole, 
    hasAnyRole, 
    hasPermission, 
    socket 
  } = useAuth();
  const navigate = useNavigate();
  const [realTimeStats, setRealTimeStats] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [liveTrainings, setLiveTrainings] = useState([]);

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-data', user?.role, user?.state],
    queryFn: () => fetchDashboardData(user?.role, user?.state),
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Socket.IO real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('stats-update', (stats) => {
        setRealTimeStats(stats);
      });

      socket.on('online-users-count', (count) => {
        setOnlineUsers(count);
      });

      socket.on('live-trainings-update', (trainings) => {
        setLiveTrainings(trainings);
      });

      socket.on('training-update', () => {
        refetch();
      });

      socket.on('user-approval-update', () => {
        refetch();
      });

      // Request initial real-time data
      socket.emit('request-dashboard-data');

      return () => {
        socket.off('stats-update');
        socket.off('online-users-count');
        socket.off('live-trainings-update');
        socket.off('training-update');
        socket.off('user-approval-update');
      };
    }
  }, [socket, refetch]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Memoized data calculations for better performance
  const memoizedData = useMemo(() => {
    const stats = { ...dashboardData?.analytics, ...realTimeStats };
    const recentTrainings = dashboardData?.recentTrainings || [];
    const pendingApprovals = dashboardData?.pendingApprovals || [];
    const userStats = dashboardData?.userStats || {};
    const userStatsByRole = userStats?.byRole || {};
    const stateStats = dashboardData?.stateStats || {};

    return {
      stats,
      recentTrainings,
      pendingApprovals,
      userStats,
      userStatsByRole,
      stateStats
    };
  }, [dashboardData, realTimeStats]);

  const { stats, recentTrainings, pendingApprovals, userStats, userStatsByRole, stateStats } = memoizedData;

  const getRoleColor = (role) => {
    const colors = {
      SuperAdmin: 'from-red-500 to-red-700',
      Admin: 'from-purple-500 to-purple-700',
      ATI: 'from-blue-500 to-blue-700',
      NGO: 'from-green-500 to-green-700',
      Volunteer: 'from-yellow-500 to-yellow-700'
    };
    return colors[role] || 'from-gray-500 to-gray-700';
  };

  // Memoized StatCard component for better performance
  const StatCard = React.memo(({ icon: Icon, title, value, subtitle, color = 'blue', trend, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg bg-${color}-100 mr-4`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <p className="text-2xl font-bold text-gray-900">{value || 0}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.increase ? 'text-green-600' : 'text-red-600'}`}>
            {trend.increase ? '↑' : '↓'} {trend.percentage}%
          </div>
        )}
      </div>
    </div>
  ));

  StatCard.propTypes = {
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subtitle: PropTypes.string,
    color: PropTypes.string,
    trend: PropTypes.shape({
      increase: PropTypes.bool,
      percentage: PropTypes.number
    }),
    onClick: PropTypes.func
  };

  const getRolePermissions = () => {
    const permissions = {
      canCreateTraining: hasPermission('trainings.create'),
      canManageUsers: hasAnyRole(['Admin', 'SuperAdmin']),
      canApproveUsers: hasPermission('users.approve'),
      canViewAnalytics: hasAnyRole(['Admin', 'SuperAdmin']),
      canViewReports: hasPermission('reports.view'),
      canManageTrainings: hasPermission('trainings.manage')
    };
    return permissions;
  };

  const permissions = getRolePermissions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className={`bg-gradient-to-r ${getRoleColor(user?.role)} text-white p-8 rounded-xl shadow-lg`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="filter brightness-0 invert opacity-20">
              <NDMALogo size="lg" showText={false} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-white/80 mb-1">
                NDMA Training Monitor - {user?.role} Dashboard
              </p>
              <p className="text-white/60 mb-4 text-sm">
                {user?.state ? `${user.state} Operations` : 'National Operations'}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {user?.role}
                </span>
                {user?.state && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {user.state}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (user?.isApproved || user?.role === 'SuperAdmin') ? 'bg-green-500/20' : 'bg-yellow-500/20'
                }`}>
                  {(user?.isApproved || user?.role === 'SuperAdmin') ? 'Approved' : 'Pending Approval'}
                </span>
                {onlineUsers > 0 && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    {onlineUsers} online
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="text-white/80">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert (Admin/SuperAdmin only) */}
      {permissions.canApproveUsers && pendingApprovals?.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have <strong>{pendingApprovals.length}</strong> pending user approvals.
                <button 
                  onClick={() => navigate('/approvals')}
                  className="ml-2 text-yellow-800 underline hover:no-underline"
                >
                  Review now →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Training Sessions */}
      {liveTrainings.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 animate-pulse" />
              Live Training Sessions ({liveTrainings.length})
            </h3>
            <button
              onClick={() => navigate('/trainings')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveTrainings.map((training) => (
              <div key={training._id} className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-gray-900 mb-2">{training.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {training.liveParticipants || 0} live
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    In Progress
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Statistics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Trainings</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.totalTrainings?.toLocaleString() || 0}
              </p>
              {user?.state && stateStats?.totalTrainings && (
                <p className="text-xs text-gray-500 mt-1">
                  {stateStats.totalTrainings} in {user.state}
                </p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Participants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.totalParticipants?.toLocaleString() || 0}
              </p>
              {onlineUsers > 0 && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Activity className="w-3 h-3 mr-1" />
                  {onlineUsers} online now
                </p>
              )}
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Programs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats?.trainingsByStatus?.find(s => s._id === 'Ongoing')?.count || 0}
              </p>
              {liveTrainings.length > 0 && (
                <p className="text-xs text-yellow-600 mt-1 flex items-center">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  {liveTrainings.length} live sessions
                </p>
              )}
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                {permissions.canApproveUsers ? 'Pending Approvals' : 'Completed'}
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {permissions.canApproveUsers 
                  ? pendingApprovals?.length || 0
                  : stats?.trainingsByStatus?.find(s => s._id === 'Completed')?.count || 0
                }
              </p>
              {permissions.canApproveUsers && pendingApprovals?.length > 0 && (
                <button
                  onClick={() => navigate('/approvals')}
                  className="text-xs text-purple-600 mt-1 hover:underline"
                >
                  Review approvals →
                </button>
              )}
            </div>
            <div className={`${
              permissions.canApproveUsers ? 'bg-purple-100' : 'bg-emerald-100'
            } p-3 rounded-full`}>
              {permissions.canApproveUsers ? 
                <UserCheck className="h-8 w-8 text-purple-600" /> :
                <Award className="h-8 w-8 text-emerald-600" />
              }
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Training by Theme Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Trainings by Theme
            </h3>
            {permissions.canViewAnalytics && (
              <button
                onClick={() => navigate('/analytics')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details →
              </button>
            )}
          </div>
          {stats?.trainingsByTheme && stats.trainingsByTheme.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.trainingsByTheme}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="_id" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  className="text-sm"
                />
                <YAxis className="text-sm" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No training data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
              Status Distribution
            </h3>
            {permissions.canViewReports && (
              <button
                onClick={() => navigate('/reports')}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                View Reports →
              </button>
            )}
          </div>
          {stats?.trainingsByStatus && stats.trainingsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.trainingsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats.trainingsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No status data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Statistics (Admin/SuperAdmin only) */}
      {permissions.canManageUsers && userStatsByRole && Object.keys(userStatsByRole).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            User Statistics by Role
          </h3>
          
          {/* Overall User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-900">{userStats?.total || 0}</div>
              <div className="text-sm text-blue-600">Total Users</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-900">{userStats?.approved || 0}</div>
              <div className="text-sm text-green-600">Approved</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-900">{userStats?.pending || 0}</div>
              <div className="text-sm text-orange-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-900">{userStats?.active || 0}</div>
              <div className="text-sm text-purple-600">Active</div>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(userStatsByRole).map(([role, stats]) => (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                  role === 'SuperAdmin' ? 'bg-red-100' :
                  role === 'Admin' ? 'bg-purple-100' :
                  role === 'ATI' ? 'bg-blue-100' :
                  role === 'NGO' ? 'bg-green-100' :
                  'bg-yellow-100'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    role === 'SuperAdmin' ? 'text-red-600' :
                    role === 'Admin' ? 'text-purple-600' :
                    role === 'ATI' ? 'text-blue-600' :
                    role === 'NGO' ? 'text-green-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats?.count || 0}</div>
                <div className="text-sm text-gray-600">{role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Recent Trainings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Recent Trainings
            </h3>
            <button
              onClick={() => navigate('/trainings')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTrainings?.length > 0 ? recentTrainings.slice(0, 5).map((training) => (
            <div key={training._id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                 onClick={() => navigate(`/trainings/${training._id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {training.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="mr-1" size={14} />
                      {new Date(training.date || training.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1" size={14} />
                      {training.location?.name || training.location?.address || 'Location TBD'}
                    </div>
                    <div className="flex items-center">
                      <Users className="mr-1" size={14} />
                      {training.registeredParticipants?.length || 
                       (typeof training.participants === 'object' ? training.participants?.actual || training.participants?.planned || 0 : training.participants) || 0} participants
                    </div>
                    {training.maxParticipants && (
                      <div className="flex items-center">
                        <Target className="mr-1" size={14} />
                        Max: {training.maxParticipants}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {training.theme}
                    </span>
                    {training.skillLevel && (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {training.skillLevel}
                      </span>
                    )}
                    {training.isApproved !== undefined && (
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                        training.isApproved 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {training.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    training.status === 'Scheduled' || training.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                    training.status === 'Ongoing' || training.status === 'InProgress' ? 'bg-green-100 text-green-800' :
                    training.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    training.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {training.status}
                  </span>
                  {permissions.canManageTrainings && (
                    <div className="mt-2 flex space-x-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trainings/${training._id}/edit`);
                        }}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No trainings yet</p>
              <p className="text-sm">
                {permissions.canCreateTraining 
                  ? "Create your first training to get started!" 
                  : "Trainings will appear here once they're created."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Role-based Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {permissions.canCreateTraining && (
              <button 
                onClick={() => navigate('/create-training')}
                className="flex items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-3" />
                Create New Training
              </button>
            )}
            {permissions.canViewAnalytics && (
              <button 
                onClick={() => navigate('/analytics')}
                className="flex items-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <TrendingUp className="w-5 h-5 mr-3" />
                View Analytics
              </button>
            )}
            {permissions.canManageUsers && (
              <button 
                onClick={() => navigate('/users')}
                className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </button>
            )}
            {permissions.canViewReports && (
              <button 
                onClick={() => navigate('/reports')}
                className="flex items-center p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FileText className="w-5 h-5 mr-3" />
                Generate Reports
              </button>
            )}
            <button 
              onClick={() => navigate('/trainings')}
              className="flex items-center p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Eye className="w-5 h-5 mr-3" />
              Browse Trainings
            </button>
            <button 
              onClick={() => navigate('/map')}
              className="flex items-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <MapPin className="w-5 h-5 mr-3" />
              Training Map
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Platform Status</span>
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Online Users</span>
              <span className="font-semibold text-gray-900">{onlineUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Live Sessions</span>
              <span className="font-semibold text-gray-900">{liveTrainings.length}</span>
            </div>
            {user?.state && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">State Operations</span>
                <span className="font-semibold text-gray-900">{user.state}</span>
              </div>
            )}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Account Status</span>
                <span className={`flex items-center ${user?.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {user?.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;