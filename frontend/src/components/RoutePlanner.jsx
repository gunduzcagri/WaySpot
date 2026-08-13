import { useState, useEffect } from 'react';
import { Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const businessIcon = new L.Icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

export default function RoutePlanner() {
  const [start, setStart] = useState('Ankara');
  const [end, setEnd] = useState('Antalya');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);

  const geocode = async (city) => {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    if (res.data.length === 0) throw new Error(`${city} bulunamadi`);
    return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
  };

  const sampleRoutePoints = (coords, count = 5) => {
    const sampled = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i / (count - 1)) * (coords.length - 1));
      sampled.push(coords[idx]);
    }
    return sampled;
  };

  const fetchBusinessesAlongRoute = async (coords) => {
    const points = sampleRoutePoints(coords);
    try {
      const promises = points.map(p => axios.get(`${API_URL}/geo/nearby?latitude=${p[0]}&longitude=${p[1]}&radius=10000`));
      const results = await Promise.all(promises);
      const all = results.flatMap(r => r.data?.businesses || []);
      const unique = Array.from(new Map(all.map(b => [b.id, b])).values());
      setBusinesses(unique);
    } catch (err) {
      console.error('Rota uzerinde isletme bulma hatasi:', err);
    }
  };

  const calculateRoute = async () => {
    setLoading(true);
    try {
      const startCoords = await geocode(start);
      const endCoords = await geocode(end);

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
      const res = await axios.get(osrmUrl);

      if (res.data.routes && res.data.routes.length > 0) {
        const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const routeData = {
          coords,
          start: startCoords,
          end: endCoords,
          distance: (res.data.routes[0].distance / 1000).toFixed(1)
        };
        setRoute(routeData);
        fetchBusinessesAlongRoute(coords);
      }
    } catch (err) {
      alert('Rota hesaplanirken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 10, zIndex: 1000,
        background: 'var(--bg-card)', padding: '20px', borderRadius: '16px',
        boxShadow: 'var(--shadow-medium)', minWidth: '300px', border: '1px solid var(--border)'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Rota Planlayıcı</h3>
        <input value={start} onChange={e => setStart(e.target.value)} placeholder="Başlangıç" style={{ width: '100%', marginBottom: '10px', padding: '0 12px', height: '44px', borderRadius: '12px', border: '1.5px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }} />
        <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Bitiş" style={{ width: '100%', marginBottom: '12px', padding: '0 12px', height: '44px', borderRadius: '12px', border: '1.5px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }} />
        <button onClick={calculateRoute} disabled={loading} style={{ width: '100%', padding: '0 18px', height: '44px', borderRadius: '12px', background: 'var(--primary)', color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: 'var(--shadow-soft)' }}>
          {loading ? 'Hesaplanıyor...' : 'Rotayı Göster'}
        </button>
        {route && <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Mesafe: <strong style={{ color: 'var(--text-primary)' }}>{route.distance} km</strong></p>}
      </div>

      {route && (
        <>
          <Marker position={route.start} icon={startIcon}>
            <Popup>Başlangıç: {start}</Popup>
          </Marker>
          <Marker position={route.end} icon={endIcon}>
            <Popup>Bitiş: {end}</Popup>
          </Marker>
          <Polyline positions={route.coords} color="#2A6B6B" weight={4} />
        </>
      )}

      {businesses.map(b => (
        <Marker key={b.id} position={[b.latitude, b.longitude]} icon={businessIcon}>
          <Popup>
            <div style={{ minWidth: '180px', color: 'var(--text-primary)' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600 }}>{b.name}</h4>
              <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)' }}>{b.description}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
