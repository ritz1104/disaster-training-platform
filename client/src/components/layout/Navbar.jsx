// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NDMALogo from '../common/NDMALogo';
import { 
  User, 
  LogOut, 
  Menu, 
  Shield, 
  Calendar, 
  MapPin, 
  TrendingUp,
  Users,
  CheckCircle,
  Settings,
  FileText,
  Bell,
  UserCheck,
  Plus,
  X
} from 'lucide-react';

const Navbar = () => {
  const { 
    user, 
    isAuthenticated, 
    logout, 
    hasRole, 
    hasAnyRole, 
    hasPermission,
    socket 
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Navigation menu items based on roles and permissions
  const getNavigationItems = () => {
    const items = [];

    if (isAuthenticated) {
      items.push({
        name: 'Dashboard',
        href: '/dashboard',
        icon: TrendingUp,
      });

      // Training Management
      if (hasPermission('trainings.view')) {
        items.push({
          name: 'Trainings',
          href: '/trainings',
          icon: Calendar,
        });
      }

      if (hasPermission('trainings.create') || hasPermission('trainings.manage')) {
        items.push({
          name: 'Create Training',
          href: '/create-training',
          icon: Plus,
        });
      }

      // Map View
      if (hasPermission('maps.view')) {
        items.push({
          name: 'Training Map',
          href: '/map',
          icon: MapPin,
        });
      }

      // User Management (Admin and SuperAdmin only)
      if (hasAnyRole(['Admin', 'SuperAdmin'])) {
        items.push({
          name: 'User Management',
          href: '/users',
          icon: Users,
        });
      }

      // Approvals (Admin and SuperAdmin only)
      if (hasPermission('users.approve')) {
        items.push({
          name: 'Approvals',
          href: '/approvals',
          icon: UserCheck,
        });
      }

      // Reports
      if (hasPermission('reports.view')) {
        items.push({
          name: 'Reports',
          href: '/reports',
          icon: FileText,
        });
      }

      // Analytics (Admin and SuperAdmin only)
      if (hasAnyRole(['Admin', 'SuperAdmin'])) {
        items.push({
          name: 'Analytics',
          href: '/analytics',
          icon: TrendingUp,
        });
      }
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  const getRoleColor = (role) => {
    const colors = {
      SuperAdmin: 'bg-red-500',
      Admin: 'bg-purple-500',
      ATI: 'bg-blue-500',
      NGO: 'bg-green-500',
      Volunteer: 'bg-yellow-500'
    };
    return colors[role] || 'bg-gray-500';
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <NDMALogo size="md" showText={true} />
              {user?.state && (
                <div className="text-xs text-gray-500 ml-2">
                  {user.state} Operations
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu and Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 relative"
                    onClick={() => setNotifications([])}
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                  
                  {notifications.length > 0 && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification, index) => (
                          <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getRoleColor(user?.role)}`}></div>
                      <User className="h-4 w-4" />
                      <span>{user?.name}</span>
                      <div className="text-xs text-gray-500">({user?.role})</div>
                    </div>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full text-white ${getRoleColor(user?.role)}`}>
                          {user?.role}
                        </span>
                        {user?.state && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {user.state}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user?.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user?.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Profile Settings
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {isAuthenticated && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;