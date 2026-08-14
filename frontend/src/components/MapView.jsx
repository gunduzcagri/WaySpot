import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../services/api';

// Reliable Leaflet Icon configurations using unpkg CDN
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const businessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-teal.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapController({ center, onCenterChange }) {
  const map = useMap();

  useEffect(() => {
    const handleFocus = (e) => {
      if (e.detail?.lat && e.detail?.lng) {
        map.flyTo([e.detail.lat, e.detail.lng], 16, { duration: 1.2 });
      }
    };
    window.addEventListener('wayspot-focus-map', handleFocus);
    return () => window.removeEventListener('wayspot-focus-map', handleFocus);
  }, [map]);

  useMapEvents({
    moveend: () => {
      if (onCenterChange) {
        const c = map.getCenter();
        onCenterChange({ lat: c.lat, lng: c.lng });
      }
    }
  });

  return null;
}

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: false, maxZoom: 14 });

    const handleFound = (e) => {
      setPosition(e.latlng);
    };

    const handleError = () => {
      setPosition({ lat: 39.9334, lng: 32.8597 });
    };

    map.on('locationfound', handleFound);
    map.on('locationerror', handleError);

    return () => {
      map.off('locationfound', handleFound);
      map.off('locationerror', handleError);
    };
  }, [map, setPosition]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
          📍 Konumunuz
        </div>
      </Popup>
    </Marker>
  ) : null;
}

function BusinessMarkers() {
  const [businesses, setBusinesses] = useState([]);

  const loadBusinesses = async () => {
    try {
      const res = await api.get('/Feed?pageSize=50&filter=popular');
      if (res.data?.data) {
        setBusinesses(res.data.data);
      }
    } catch (err) {
      console.error('Harita işletme yükleme hatası:', err);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, []);

  return (
    <>
      {businesses.map((b) => {
        if (!b.latitude || !b.longitude) return null;
        return (
          <Marker key={b.id} position={[b.latitude, b.longitude]} icon={businessIcon}>
            <Popup>
              <div className="custom-map-popup" style={{ minWidth: 160 }}>
                {b.coverImage && (
                  <img
                    src={b.coverImage}
                    alt={b.name}
                    style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                  />
                )}
                <h4>{b.name}</h4>
                <p>{b.type} · ⭐ {b.averageRating ? Number(b.averageRating).toFixed(1) : '5.0'}</p>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                  {b.address || ''}
                </div>
                <a
                  href={`/business/${b.id}`}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'var(--primary, #2A6B6B)',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Detayları Gör
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function MapView({ children, onCenterChange }) {
  const [position, setPosition] = useState({ lat: 39.9334, lng: 32.8597 });

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MapContainer
        center={[39.9334, 32.8597]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <MapController onCenterChange={onCenterChange} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <BusinessMarkers />
        {children}
      </MapContainer>
    </div>
  );
}
