// src/components/maps/TrainingMap.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import L from 'leaflet';
import { Calendar, MapPin, Users, User, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons based on training status
const getMarkerIcon = (status) => {
  const colors = {
    'Scheduled': '#3B82F6', // Blue
    'Ongoing': '#10B981',   // Green
    'Completed': '#6B7280', // Gray
    'Cancelled': '#EF4444'  // Red
  };

  return new L.DivIcon({
    html: `
      <div style="
        background-color: ${colors[status] || '#6B7280'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const fetchMapData = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const { data } = await axios.get(`/analytics/map-data?${params}`);
  return data.data;
};

const TrainingMap = ({ filters = {}, onMarkerClick }) => {
  const [selectedTraining, setSelectedTraining] = useState(null);

  const { data: mapData, isLoading, error } = useQuery({
    queryKey: ['mapData', filters],
    queryFn: () => fetchMapData(filters),
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  const handleMarkerClick = (training) => {
    setSelectedTraining(training);
    if (onMarkerClick) {
      onMarkerClick(training);
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-red-600">
          <p className="mb-2">Error loading map data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const trainings = mapData?.geoJson?.features || [];
  const centerLat = 20.5937; // Center of India
  const centerLng = 78.9629;

  return (
    <div className="relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={5}
        style={{ height: '500px', width: '100%' }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {trainings.map((training) => {
          const { geometry, properties } = training;
          const [lng, lat] = geometry.coordinates;
          
          return (
            <Marker
              key={properties.id}
              position={[lat, lng]}
              icon={getMarkerIcon(properties.status)}
              eventHandlers={{
                click: () => handleMarkerClick(properties)
              }}
            >
              <Popup maxWidth={300} className="custom-popup">
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">
                    {properties.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-2" size={14} />
                      {format(new Date(properties.date), 'PPP')}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-2" size={14} />
                      {properties.district}, {properties.state}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <Users className="mr-2" size={14} />
                      Planned: {properties.participants.planned}, 
                      Actual: {properties.participants.actual}
                    </div>
                    
                    {properties.trainer && (
                      <div className="flex items-center text-gray-600">
                        <User className="mr-2" size={14} />
                        {properties.trainer.name}
                      </div>
                    )}
                    
                    <div className="flex items-center text-gray-600">
                      <Building className="mr-2" size={14} />
                      {properties.trainingType}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      properties.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      properties.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                      properties.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {properties.status}
                    </span>
                    
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {properties.theme}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <button 
                      onClick={() => window.open(`/trainings/${properties.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Training Status</h4>
        <div className="space-y-1">
          {[
            { status: 'Scheduled', color: '#3B82F6', label: 'Scheduled' },
            { status: 'Ongoing', color: '#10B981', label: 'Ongoing' },
            { status: 'Completed', color: '#6B7280', label: 'Completed' },
            { status: 'Cancelled', color: '#EF4444', label: 'Cancelled' }
          ].map(({ status, color, label }) => (
            <div key={status} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: color }}
              ></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-gray-500">
            Total Trainings: {trainings.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrainingMap;