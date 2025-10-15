// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import NDMALogo from '../components/common/NDMALogo';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* NDMA Logo */}
          <div className="flex justify-center mb-6">
            <NDMALogo size="xl" showText={false} />
          </div>
          
          {/* 404 Error */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* NDMA Branding */}
          <div className="mb-8">
            <p className="text-sm text-blue-600 font-medium mb-1">
              National Disaster Management Administration
            </p>
            <p className="text-xs text-gray-500">
              Training Monitor System
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Home className="mr-2" size={18} />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="mr-2" size={18} />
              Go Back
            </button>
          </div>
        </div>
        
        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Need help? Contact your system administrator or visit the{' '}
            <Link to="/trainings" className="text-blue-600 hover:underline">
              training programs
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;