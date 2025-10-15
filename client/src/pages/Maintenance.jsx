// src/pages/Maintenance.jsx
import React from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import NDMALogo from '../components/common/NDMALogo';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* NDMA Logo */}
          <div className="flex justify-center mb-6">
            <NDMALogo size="xl" showText={true} />
          </div>
          
          {/* Maintenance Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          
          {/* Maintenance Message */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">System Maintenance</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The NDMA Training Monitor system is currently undergoing scheduled maintenance 
              to improve your experience. We'll be back online shortly.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-blue-700">
                <Clock className="mr-2" size={18} />
                <span className="font-medium">Estimated downtime: 30 minutes</span>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mx-auto"
          >
            <RefreshCw className="mr-2" size={18} />
            Refresh Page
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            For urgent matters, please contact your regional NDMA office.
          </p>
          <p className="text-white/60 text-xs mt-2">
            National Disaster Management Administration - Government of India
          </p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;