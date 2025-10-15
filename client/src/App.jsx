import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';
import './App.css';

// Conditionally import React Query DevTools for development
const ReactQueryDevtools = import.meta.env.DEV 
  ? lazy(() => import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools })))
  : null;

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrainingList = lazy(() => import('./pages/TrainingList'));
const TrainingDetails = lazy(() => import('./pages/TrainingDetails'));
const CreateTraining = lazy(() => import('./pages/CreateTraining'));
const Profile = lazy(() => import('./pages/Profile'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const TrainingMap = lazy(() => import('./components/maps/TrainingMap'));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard'));

// Enhanced QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: 'always',
      refetchInterval: false,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <ErrorBoundary fallback={<div className="p-4 text-red-600">Navigation error occurred</div>}>
                <Navbar />
              </ErrorBoundary>
              <main className="container mx-auto px-4 py-8">
                <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/trainings" element={<TrainingList />} />
                    <Route path="/trainings/:id" element={<TrainingDetails />} />
                    <Route path="/map" element={<TrainingMap />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/create-training"
                      element={
                        <PrivateRoute>
                          <CreateTraining />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <PrivateRoute>
                          <UserManagement />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <Toaster position="top-right" />
            </div>
          </Router>
        </AuthProvider>
        {import.meta.env.DEV && ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
