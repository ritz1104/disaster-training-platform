// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import NDMALogo from '../components/common/NDMALogo';

const Home = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: 'Training Management',
      description: 'Organize and manage disaster preparedness training programs across different themes and locations.'
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: 'Multi-Role Support',
      description: 'Support for Admin, SDMA, NGO, and Volunteer roles with appropriate permissions and access levels.'
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: 'Analytics & Reports',
      description: 'Comprehensive analytics and reporting to track training effectiveness and participant engagement.'
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      title: 'Emergency Preparedness',
      description: 'Focus on various disaster types including floods, earthquakes, cyclones, and more.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white rounded-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <NDMALogo size="xl" showText={false} />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-2">
            NDMA Training Monitor
          </h1>
          <h2 className="text-2xl font-semibold mb-6 text-blue-200">
            National Disaster Management Administration
          </h2>
          <p className="text-xl mb-8 leading-relaxed">
            Empowering communities through comprehensive disaster preparedness training.
            Building resilient India through systematic capacity building and monitoring.
          </p>
          <div className="space-x-4">
            <Link
              to="/trainings"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              View Trainings
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Platform Features
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform provides comprehensive tools for disaster preparedness training
            management and community engagement.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-gray-100 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Our Impact
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
            <div className="text-gray-600">Training Sessions</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-600 mb-2">50,000+</div>
            <div className="text-gray-600">People Trained</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
            <div className="text-gray-600">Organizations</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our platform to access comprehensive disaster training programs
          and connect with your community.
        </p>
        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Join Now
        </Link>
      </section>
    </div>
  );
};

export default Home;