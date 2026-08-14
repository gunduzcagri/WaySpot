import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle flying to user location
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const MapContainer = ({ businesses, userLocation }) => {
  const defaultCenter = [39.0, 35.0]; // Center of Turkey
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className="w-full h-[calc(100vh-64px)] z-0 relative">
      <LeafletMap center={center} zoom={6} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={userLocation ? [userLocation.lat, userLocation.lng] : null} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="font-semibold text-blue-600">Siz buradasınız</div>
            </Popup>
          </Marker>
        )}

        <MarkerClusterGroup>
          {businesses?.map((business) => (
            <Marker key={business.id} position={[business.latitude, business.longitude]}>
              <Popup className="rounded-lg shadow-xl overflow-hidden">
                <div className="w-48">
                  {business.coverImage && (
                    <img src={business.coverImage} alt={business.name} className="w-full h-24 object-cover rounded-t-lg -mt-3 -mx-3 mb-2 max-w-[calc(100%+24px)]" />
                  )}
                  <h3 className="font-bold text-gray-900">{business.name}</h3>
                  <div className="text-sm text-gray-600 mb-2">{business.type}</div>
                  <div className="flex items-center text-sm">
                    <span className="text-yellow-500 mr-1">★</span>
                    {business.averageRating?.toFixed(1) || '0.0'} ({business.totalReviews})
                  </div>
                  <a href={`/business/${business.id}`} className="mt-3 block w-full text-center bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                    Detaylar
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </LeafletMap>
    </div>
  );
};

export default MapContainer;
