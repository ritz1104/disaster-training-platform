// src/pages/TrainingList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, MapPin, Users, Filter, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { formatParticipants } from '../utils/formatters';
import NDMALogo from '../components/common/NDMALogo';

const fetchTrainings = async ({ theme, institution, status, page = 1 }) => {
  const params = new URLSearchParams();
  if (theme) params.append('theme', theme);
  if (institution) params.append('institution', institution);
  if (status) params.append('status', status);
  params.append('page', page);
  params.append('limit', '12');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { data } = await axios.get(`${apiUrl}/trainings?${params}`);
  return data.data;
};

const TrainingList = () => {
  const [filters, setFilters] = useState({
    theme: '',
    institution: '',
    status: '',
    search: ''
  });
  const [page, setPage] = useState(1);

  const { data: trainings, isLoading, error } = useQuery({
    queryKey: ['trainings', filters.theme, filters.institution, filters.status, page],
    queryFn: () => fetchTrainings({ ...filters, page }),
    keepPreviousData: true,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const themes = [
    'Flood Management',
    'Earthquake Safety',
    'Cyclone Management',
    'Fire Safety',
    'Landslide Prevention',
    'Drought Management',
    'Tsunami Preparedness',
    'Medical Emergency',
    'Search and Rescue',
    'Community Awareness'
  ];

  const statusOptions = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Ongoing':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrainings = trainings?.filter(training =>
    !filters.search || 
    training.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    training.institution.toLowerCase().includes(filters.search.toLowerCase())
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error loading trainings</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-4">
          <NDMALogo size="md" showText={false} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">NDMA Training Programs</h1>
            <p className="text-gray-600">
              Discover and join disaster preparedness training programs nationwide
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/create-training"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Training
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center mb-4">
          <Filter className="mr-2" size={20} />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search trainings..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Theme Filter */}
          <select
            value={filters.theme}
            onChange={(e) => handleFilterChange('theme', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Themes</option>
            {themes.map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>

          {/* Institution Filter */}
          <input
            type="text"
            placeholder="Institution"
            value={filters.institution}
            onChange={(e) => handleFilterChange('institution', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Training Cards */}
      {filteredTrainings && Array.isArray(filteredTrainings) && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings
            .filter(training => training && training._id)
            .map((training) => (
            <div key={training._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                    {training.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(training.status)}`}>
                    {training.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {training.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2" size={16} />
                    {format(new Date(training.date), 'PPP')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2" size={16} />
                    {training.location.name || training.location.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2" size={16} />
                    {formatParticipants(training.participants)} participants
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {training.theme}
                  </span>
                  <Link
                    to={`/trainings/${training._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredTrainings && filteredTrainings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No trainings found matching your criteria</div>
          <button
            onClick={() => setFilters({ theme: '', institution: '', status: '', search: '' })}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TrainingList;