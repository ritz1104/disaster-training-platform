// src/pages/TrainingDetails.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Building, 
  Star,
  Edit,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { formatParticipants } from '../utils/formatters';
import NDMALogo from '../components/common/NDMALogo';

const fetchTraining = async (id) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const { data } = await axios.get(`${apiUrl}/trainings/${id}`);
  return data.data;
};

const TrainingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

  const { data: training, isLoading, error } = useQuery({
    queryKey: ['training', id],
    queryFn: () => fetchTraining(id)
  });

  const feedbackMutation = useMutation({
    mutationFn: (feedbackData) => axios.post(`/trainings/${id}/feedback`, feedbackData),
    onSuccess: () => {
      queryClient.invalidateQueries(['training', id]);
      toast.success('Feedback submitted successfully!');
      setShowFeedbackForm(false);
      setFeedback({ rating: 5, comment: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/trainings/${id}`),
    onSuccess: () => {
      toast.success('Training deleted successfully!');
      navigate('/trainings');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete training');
    }
  });

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit feedback');
      return;
    }
    feedbackMutation.mutate(feedback);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this training?')) {
      deleteMutation.mutate();
    }
  };

  const canEdit = user && (
    user.role === 'Admin' || 
    (training?.organizer?._id === user.id)
  );

  const canDelete = user && (
    user.role === 'Admin' || 
    (training?.organizer?._id === user.id)
  );

  const hasSubmittedFeedback = training?.feedback?.some(
    f => f.user._id === user?.id
  );

  const averageRating = training?.feedback?.length > 0 
    ? training.feedback.reduce((sum, f) => sum + f.rating, 0) / training.feedback.length 
    : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Training not found</div>
        <button 
          onClick={() => navigate('/trainings')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Trainings
        </button>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex items-start space-x-4 flex-1">
              <NDMALogo size="md" showText={false} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  {training.title}
                </h1>
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(training.status)}`}>
                    {training.status}
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {training.theme}
                  </span>
                </div>
              </div>
            </div>
            
            {(canEdit || canDelete) && (
              <div className="flex gap-2 mt-4 md:mt-0">
                {canEdit && (
                  <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <Edit className="mr-2" size={16} />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={handleDelete}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="mr-2" size={16} />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="text-gray-700 text-lg leading-relaxed">
            {training.description}
          </p>
        </div>
      </div>

      {/* Training Details */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Training Information</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-3 text-blue-600" size={20} />
              <div>
                <div className="font-medium">Date & Time</div>
                <div className="text-gray-600">
                  {format(new Date(training.date), 'PPP p')}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="mr-3 text-red-600" size={20} />
              <div>
                <div className="font-medium">Location</div>
                <div className="text-gray-600">
                  {training.location.name && <div>{training.location.name}</div>}
                  {training.location.address && <div>{training.location.address}</div>}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Users className="mr-3 text-green-600" size={20} />
              <div>
                <div className="font-medium">Participants</div>
                <div className="text-gray-600">
                  {formatParticipants(training.participants)} people
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Building className="mr-3 text-purple-600" size={20} />
              <div>
                <div className="font-medium">Institution</div>
                <div className="text-gray-600">{training.institution}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Organizer</h3>
          <div className="space-y-3">
            <div>
              <div className="font-medium">{training.organizer?.name}</div>
              <div className="text-gray-600">{training.organizer?.email}</div>
            </div>
            {training.organizer?.organization && (
              <div>
                <div className="text-sm text-gray-500">Organization</div>
                <div className="text-gray-700">{training.organizer.organization}</div>
              </div>
            )}
            <div>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                {training.organizer?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      {training.resources && training.resources.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Resources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {training.resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <div className="font-medium">{resource.name}</div>
                <div className="text-sm text-gray-600 mb-2">{resource.type}</div>
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  View Resource
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Feedback & Reviews</h3>
            {training.feedback?.length > 0 && (
              <div className="flex items-center mt-2">
                <Star className="text-yellow-500 mr-1" size={16} />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-gray-600 ml-2">
                  ({training.feedback.length} reviews)
                </span>
              </div>
            )}
          </div>
          
          {isAuthenticated && training.status === 'Completed' && !hasSubmittedFeedback && (
            <button 
              onClick={() => setShowFeedbackForm(true)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <MessageCircle className="mr-2" size={16} />
              Add Feedback
            </button>
          )}
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && (
          <form onSubmit={handleFeedbackSubmit} autoComplete="off" className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={feedback.rating}
                onChange={(e) => setFeedback(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} Star{rating > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Share your experience..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={feedbackMutation.isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {feedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button
                type="button"
                onClick={() => setShowFeedbackForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Feedback List */}
        <div className="space-y-4">
          {training.feedback?.map((feedback, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{feedback.user?.name}</div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}
                      fill={i < feedback.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
              {feedback.comment && (
                <p className="text-gray-700">{feedback.comment}</p>
              )}
              <div className="text-sm text-gray-500 mt-2">
                {format(new Date(feedback.createdAt), 'PPp')}
              </div>
            </div>
          ))}
        </div>

        {training.feedback?.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No feedback yet. Be the first to share your experience!
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingDetails;