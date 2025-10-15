// src/components/common/NDMALogo.jsx
import React from 'react';
import PropTypes from 'prop-types';

const NDMALogo = ({ 
  size = 'md', 
  showText = true, 
  variant = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const LogoImage = () => (
    <img 
      src="/ndma-logo.svg" 
      alt="NDMA Logo" 
      className={`${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // Fallback to favicon if custom logo fails
        e.target.src = "/favicon.svg";
      }}
    />
  );

  const LogoSVG = () => (
    <svg 
      viewBox="0 0 32 32" 
      className={`${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#87ceeb" />
          <stop offset="100%" stopColor="#4682b4" />
        </linearGradient>
        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#2c5f87" />
        </linearGradient>
      </defs>
      
      {/* Outer Circle */}
      <circle cx="16" cy="16" r="16" fill="url(#backgroundGradient)" />
      <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="0.5" />
      
      {/* Inner Background */}
      <circle cx="16" cy="16" r="12" fill="white" />
      
      {/* Shield */}
      <path 
        d="M16 6 L10 9 L10 18 Q10 22 16 26 Q22 22 22 18 L22 9 Z" 
        fill="url(#shieldGradient)"
        stroke="#1e3a5f" 
        strokeWidth="0.5"
      />
      
      {/* Compass */}
      <g transform="translate(16, 11)">
        <circle r="2" fill="none" stroke="#1e3a5f" strokeWidth="0.3" />
        <path d="M0,-1.5 L0.5,0 L0,1.5 L-0.5,0 Z" fill="#1e3a5f" />
        <text x="0" y="-3" textAnchor="middle" fontSize="2" fill="#1e3a5f">N</text>
      </g>
      
      {/* Hand */}
      <ellipse cx="16" cy="17" rx="4" ry="1.5" fill="#d2b48c" />
      
      {/* House */}
      <g transform="translate(16, 15)">
        <rect x="-1.5" y="-1" width="3" height="2.5" fill="#ff6b35" />
        <path d="M-2,-1 L0,-2.5 L2,-1 Z" fill="#1e3a5f" />
        <rect x="0.5" y="0" width="0.8" height="0.8" fill="#4682b4" />
      </g>
      
      {/* Leaves */}
      <ellipse cx="12" cy="16" rx="1" ry="0.5" fill="#90ee90" transform="rotate(-30 12 16)" />
      <ellipse cx="20" cy="16" rx="1" ry="0.5" fill="#90ee90" transform="rotate(30 20 16)" />
      
      {/* Water Waves */}
      <path d="M10 20 Q13 19 16 20 T22 20" fill="none" stroke="#4682b4" strokeWidth="0.5" />
      <path d="M10 22 Q13 21 16 22 T22 22" fill="none" stroke="#4682b4" strokeWidth="0.5" />
      
      {/* NDMA Text */}
      {variant === 'compact' && (
        <text x="16" y="28" textAnchor="middle" fontSize="3" fill="#1e3a5f" fontWeight="bold">
          NDMA
        </text>
      )}
    </svg>
  );

  if (!showText) {
    return <LogoImage />;
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoImage />
      {showText && (
        <div>
          <div className={`font-bold text-gray-900 ${textSizes[size]}`}>
            NDMA
          </div>
          {size !== 'sm' && (
            <div className="text-xs text-blue-600 font-medium">
              Training Monitor
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NDMALogo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showText: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string
};

export default NDMALogo;