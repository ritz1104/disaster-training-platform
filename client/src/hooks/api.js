import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, queryKeys } from '../services/api';
import toast from 'react-hot-toast';

// Auth hooks
export const useAuth = () => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: apiService.auth.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.auth.login,
    onSuccess: (data) => {
      // Store auth data
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Update auth cache
      queryClient.setQueryData(queryKeys.auth.me, data.data.user);
      
      toast.success('Login successful!');
    },
    onError: (error) => {
      console.error('Login error:', error);
      // Error toast is handled by axios interceptor
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: apiService.auth.register,
    onSuccess: (data) => {
      if (data.data.needsApproval) {
        toast.success('Registration successful! Your account is pending approval.');
      } else {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        toast.success('Registration successful!');
      }
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.auth.updateProfile,
    onSuccess: (data) => {
      // Update user cache
      queryClient.setQueryData(queryKeys.auth.me, data.data);
      toast.success('Profile updated successfully!');
    },
    onSettled: () => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: apiService.auth.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
    },
  });
};

// User management hooks
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.auth.users(params),
    queryFn: () => apiService.auth.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }) => apiService.auth.updateUser(userId, userData),
    onSuccess: () => {
      toast.success('User updated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user-stats'] });
    },
  });
};

export const useApproveUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, approvalData }) => apiService.auth.approveUser(userId, approvalData),
    onSuccess: () => {
      toast.success('User approval status updated!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const usePendingUsers = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.auth.pendingUsers(params),
    queryFn: () => apiService.auth.getPendingUsers(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: queryKeys.auth.userStats,
    queryFn: apiService.auth.getUserStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Training hooks
export const useTrainings = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.trainings.all(params),
    queryFn: () => apiService.trainings.getAll(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTraining = (id) => {
  return useQuery({
    queryKey: queryKeys.trainings.detail(id),
    queryFn: () => apiService.trainings.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.trainings.create,
    onSuccess: () => {
      toast.success('Training created successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useUpdateTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, trainingData }) => apiService.trainings.update(id, trainingData),
    onSuccess: () => {
      toast.success('Training updated successfully!');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.detail(variables.id) });
    },
  });
};

export const useDeleteTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.trainings.delete,
    onSuccess: () => {
      toast.success('Training deleted successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useJoinTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.trainings.join,
    onSuccess: () => {
      toast.success('Successfully joined training!');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.detail(variables) });
    },
  });
};

export const useLeaveTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiService.trainings.leave,
    onSuccess: () => {
      toast.success('Successfully left training!');
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.trainings.detail(variables) });
    },
  });
};

export const useApproveTraining = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, approvalData }) => apiService.trainings.approve(id, approvalData),
    onSuccess: () => {
      toast.success('Training approval status updated!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });
};

export const useTrainingStats = () => {
  return useQuery({
    queryKey: queryKeys.trainings.stats,
    queryFn: apiService.trainings.getStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStateTrainingStats = (state) => {
  return useQuery({
    queryKey: queryKeys.trainings.stateStats(state),
    queryFn: () => apiService.trainings.getStateStats(state),
    enabled: !!state,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Analytics hooks
export const useAnalyticsDashboard = () => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: apiService.analytics.getDashboard,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

export const useAnalyticsTrainingStats = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.analytics.trainingStats(params),
    queryFn: () => apiService.analytics.getTrainingStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalyticsUserStats = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.analytics.userStats(params),
    queryFn: () => apiService.analytics.getUserStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Reports hooks
export const useReports = (params = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.all(params),
    queryFn: () => apiService.reports.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportType, params }) => apiService.reports.generate(reportType, params),
    onSuccess: () => {
      toast.success('Report generated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};