// src/components/analytics/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { Calendar, Users, MapPin, TrendingUp, Download, Filter } from 'lucide-react';
import { format, startOfYear, endOfYear } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fetchAnalytics = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const { data } = await axios.get(`/analytics/dashboard?${params}`);
  return data.data;
};

const AnalyticsDashboard = () => {
  const [filters, setFilters] = useState({
    startDate: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfYear(new Date()), 'yyyy-MM-dd'),
    state: '',
    theme: ''
  });

  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => fetchAnalytics(filters),
    refetchInterval: 60000, // Refresh every minute
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportData = async (format) => {
    try {
      const response = await axios.get(`/reports/${format}`, {
        params: filters,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ndma-training-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>Error loading analytics data</p>
        <button onClick={refetch} className="mt-2 bg-red-600 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const stateWise = analytics?.stateWise || [];
  const themeWise = analytics?.themeWise || [];
  const monthlyTrend = analytics?.monthlyTrend || [];

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // State-wise training data
  const stateChartData = {
    labels: stateWise.slice(0, 10).map(item => item._id),
    datasets: [
      {
        label: 'Number of Trainings',
        data: stateWise.slice(0, 10).map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Participants',
        data: stateWise.slice(0, 10).map(item => item.actualParticipants),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        yAxisID: 'y1',
      }
    ],
  };

  const stateChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Number of Trainings'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Participants'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Theme-wise data
  const themeChartData = {
    labels: themeWise.map(item => item._id),
    datasets: [{
      data: themeWise.map(item => item.count),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  // Monthly trend data
  const monthlyChartData = {
    labels: monthlyTrend.map(item => `${item._id.year}-${String(item._id.month).padStart(2, '0')}`),
    datasets: [
      {
        label: 'Trainings',
        data: monthlyTrend.map(item => item.count),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Participants',
        data: monthlyTrend.map(item => item.actualParticipants),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1',
      }
    ],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">NDMA Training Analytics</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics and insights for disaster management training programs
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 lg:mt-0">
          <button
            onClick={() => exportData('pdf')}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <Download className="mr-2" size={16} />
            Export PDF
          </button>
          <button
            onClick={() => exportData('csv')}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download className="mr-2" size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center mb-4">
          <Filter className="mr-2" size={20} />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {stateWise.map(state => (
                <option key={state._id} value={state._id}>{state._id}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={filters.theme}
              onChange={(e) => handleFilterChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Themes</option>
              {themeWise.map(theme => (
                <option key={theme._id} value={theme._id}>{theme._id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Trainings</p>
              <p className="text-3xl font-bold text-blue-600">
                {overview.totalTrainings?.toLocaleString() || 0}
              </p>
            </div>
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Avg Duration: {Math.round(overview.avgDuration || 0)} hours
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Participants</p>
              <p className="text-3xl font-bold text-green-600">
                {overview.totalActualParticipants?.toLocaleString() || 0}
              </p>
            </div>
            <Users className="h-12 w-12 text-green-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Participation Rate: {overview.participationRate || 0}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Coverage</p>
              <p className="text-3xl font-bold text-purple-600">
                {stateWise.length} States
              </p>
            </div>
            <MapPin className="h-12 w-12 text-purple-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Themes: {themeWise.length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Gender Ratio</p>
              <p className="text-lg font-bold text-orange-600">
                M: {overview.genderRatio?.male || 0}% | F: {overview.genderRatio?.female || 0}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-600" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Total Hours: {overview.totalTrainingHours?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* State-wise Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Top 10 States - Trainings & Participants</h3>
          <div style={{ height: '400px' }}>
            <Bar data={stateChartData} options={stateChartOptions} />
          </div>
        </div>

        {/* Theme Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Training Distribution by Theme</h3>
          <div style={{ height: '400px' }}>
            <Doughnut data={themeChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Monthly Training & Participation Trends</h3>
        <div style={{ height: '400px' }}>
          <Line data={monthlyChartData} options={stateChartOptions} />
        </div>
      </div>

      {/* Recent Trainings */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Recent Training Programs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.recentTrainings?.slice(0, 5).map((training) => (
                <tr key={training._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{training.title}</div>
                      <div className="text-sm text-gray-500">{training.theme}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{training.state}</div>
                    <div className="text-sm text-gray-500">{training.location?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(training.date), 'PP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {training.participants?.actual || 0} / {training.participants?.planned || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      training.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      training.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                      training.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {training.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;