// src/pages/CreateTraining.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Users, FileText, Building, Globe } from 'lucide-react';
import NDMALogo from '../components/common/NDMALogo';

const CreateTraining = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const createTrainingMutation = useMutation({
    mutationFn: (trainingData) => axios.post('/trainings', trainingData),
    onSuccess: (data) => {
      toast.success('Training created successfully!');
      navigate(`/trainings/${data.data.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create training');
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Format the data
      const trainingData = {
        ...data,
        participants: parseInt(data.participants),
        location: {
          type: 'Point',
          coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)],
          name: data.locationName,
          address: data.locationAddress
        }
      };

      // Remove the separate location fields
      delete trainingData.longitude;
      delete trainingData.latitude;
      delete trainingData.locationName;
      delete trainingData.locationAddress;

      createTrainingMutation.mutate(trainingData);
    } catch (error) {
      toast.error('Failed to create training');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <NDMALogo size="md" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Create NDMA Training</h1>
              <p className="text-gray-600">
                Set up a new disaster preparedness training program
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-8">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  autoComplete="off"
                  {...register('title', {
                    required: 'Title is required',
                    maxLength: { value: 200, message: 'Title must not exceed 200 characters' }
                  })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter training title"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme *
              </label>
              <select
                {...register('theme', { required: 'Theme is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.theme ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a theme</option>
                {themes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>
              {errors.theme && (
                <p className="mt-1 text-sm text-red-600">{errors.theme.message}</p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  autoComplete="off"
                  {...register('institution', { required: 'Institution is required' })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.institution ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter organizing institution"
                />
              </div>
              {errors.institution && (
                <p className="mt-1 text-sm text-red-600">{errors.institution.message}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="datetime-local"
                  autoComplete="off"
                  {...register('date', { required: 'Date is required' })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Participants *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  min="1"
                  max="10000"
                  autoComplete="off"
                  {...register('participants', {
                    required: 'Number of participants is required',
                    min: { value: 1, message: 'Must have at least 1 participant' },
                    max: { value: 10000, message: 'Cannot exceed 10000 participants' }
                  })}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.participants ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Expected number of participants"
                />
              </div>
              {errors.participants && (
                <p className="mt-1 text-sm text-red-600">{errors.participants.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              autoComplete="off"
              {...register('description', {
                required: 'Description is required',
                maxLength: { value: 1000, message: 'Description must not exceed 1000 characters' }
              })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Describe the training objectives, agenda, and what participants will learn"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Location Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="mr-2" size={20} />
              Location Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Location Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register('locationName')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Community Center, School Hall"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register('locationAddress')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Full address"
                />
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    step="any"
                    autoComplete="off"
                    {...register('longitude', {
                      required: 'Longitude is required',
                      min: { value: -180, message: 'Longitude must be between -180 and 180' },
                      max: { value: 180, message: 'Longitude must be between -180 and 180' }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.longitude ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 77.2090"
                  />
                </div>
                {errors.longitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    step="any"
                    autoComplete="off"
                    {...register('latitude', {
                      required: 'Latitude is required',
                      min: { value: -90, message: 'Latitude must be between -90 and 90' },
                      max: { value: 90, message: 'Latitude must be between -90 and 90' }
                    })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.latitude ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 28.6139"
                  />
                </div>
                {errors.latitude && (
                  <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/trainings')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || createTrainingMutation.isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                loading || createTrainingMutation.isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {loading || createTrainingMutation.isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Training'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTraining;