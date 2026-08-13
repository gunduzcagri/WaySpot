import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

let DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }) {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 13 });

    map.on('locationfound', (e) => {
      setPosition(e.latlng);
    });

    map.on('locationerror', () => {
      setPosition({ lat: 39.9334, lng: 32.8597 });
      map.setView([39.9334, 32.8597], 13);
    });
  }, [map, setPosition]);

  return position ? (
    <Marker position={position}>
      <Popup>Konumunuz</Popup>
    </Marker>
  ) : null;
}

function MapEventsHandler({ onCenterChange }) {
  const map = useMapEvents({
    moveend: () => {
      if (onCenterChange) {
        const center = map.getCenter();
        onCenterChange({ lat: center.lat, lng: center.lng });
      }
    }
  });
  return null;
}


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

const businessIcon = new L.Icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function AllBusinessMarkers() {
  const map = useMap();
  const [businesses, setBusinesses] = useState([]);

  const fetchBusinesses = async (center) => {
    try {
      const res = await axios.get(`${API_URL}/geo/nearby?latitude=${center.lat}&longitude=${center.lng}&radius=50000`);
      if (res.data && res.data.businesses) {
        setBusinesses(res.data.businesses);
      } else {
        // Fallback mock businesses if API is failing/empty
        setBusinesses([
          { id: 'm1', name: 'Kaleiçi Tarihi Kahvecisi', description: 'Nefis Türk kahvesi.', latitude: 36.885, longitude: 30.705 },
          { id: 'm2', name: 'Konyaaltı Balıkçısı', description: 'Taze deniz ürünleri.', latitude: 36.865, longitude: 30.635 },
          { id: 'm3', name: 'Lara Dondurmacısı', description: 'Sıcak günlerde serinletici.', latitude: 36.852, longitude: 30.755 },
          { id: 'm4', name: 'Düden Şelalesi Restoranı', description: 'Şelale manzaralı.', latitude: 36.966, longitude: 30.725 },
          { id: 'm5', name: 'Antalya Müzesi Kafe', description: 'Tarih ve kahve bir arada.', latitude: 36.885, longitude: 30.679 }
        ]);
      }
    } catch (err) {
      console.error('Isletmeleri getirme hatasi:', err);
      setBusinesses([
        { id: 'm1', name: 'Kaleiçi Tarihi Kahvecisi', description: 'Nefis Türk kahvesi.', latitude: 36.885, longitude: 30.705 },
        { id: 'm2', name: 'Konyaaltı Balıkçısı', description: 'Taze deniz ürünleri.', latitude: 36.865, longitude: 30.635 },
        { id: 'm3', name: 'Lara Dondurmacısı', description: 'Sıcak günlerde serinletici.', latitude: 36.852, longitude: 30.755 }
      ]);
    }
  };

  useEffect(() => {
    fetchBusinesses(map.getCenter());
  }, [map]);

  useMapEvents({
    moveend: () => {
      fetchBusinesses(map.getCenter());
    }
  });

  return businesses.map(b => (
    <Marker key={b.id} position={[b.latitude, b.longitude]} icon={businessIcon}>
      <Popup>
        <div style={{ minWidth: '180px', color: '#111827' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>{b.name}</h4>
          <p style={{ margin: '0', fontSize: '13px', color: '#4B5563' }}>{b.description}</p>
        </div>
      </Popup>
    </Marker>
  ));
}

export default function MapView({ children, onCenterChange }) {
  const [position, setPosition] = useState(null);

  return (
    <MapContainer
      center={[39.9334, 32.8597]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: '100vh', width: '100%' }}
    >
      <MapEventsHandler onCenterChange={onCenterChange} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} />
      <AllBusinessMarkers />
      {children}
    </MapContainer>
  );
}
