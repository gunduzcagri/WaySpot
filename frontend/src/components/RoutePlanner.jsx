import { useState } from 'react';
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

export default function RoutePlanner() {
  const [start, setStart] = useState('Ankara');
  const [end, setEnd] = useState('Antalya');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const geocode = async (city) => {
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
    if (res.data.length === 0) throw new Error(`${city} bulunamadi`);
    return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
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
        setRoute({
          coords,
          start: startCoords,
          end: endCoords,
          distance: (res.data.routes[0].distance / 1000).toFixed(1)
        });
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
        position: 'absolute', top: 10, left: 50, zIndex: 1000,
        background: 'var(--bg-card)', padding: '24px', borderRadius: '16px',
        boxShadow: 'var(--shadow-medium)', minWidth: '320px', border: '1px solid var(--border)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Rota Planlayıcı</h3>
        <input value={start} onChange={e => setStart(e.target.value)} placeholder="Baslangic" style={{ width: '100%', marginBottom: '12px', padding: '0 16px', height: '56px', borderRadius: '16px', border: '1.5px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '16px', boxSizing: 'border-box' }} />
        <input value={end} onChange={e => setEnd(e.target.value)} placeholder="Bitis" style={{ width: '100%', marginBottom: '16px', padding: '0 16px', height: '56px', borderRadius: '16px', border: '1.5px solid var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '16px', boxSizing: 'border-box' }} />
        <button onClick={calculateRoute} disabled={loading} style={{ width: '100%', padding: '0 24px', height: '56px', borderRadius: '16px', background: 'var(--primary)', color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '16px', boxShadow: 'var(--shadow-soft)' }}>
          {loading ? 'Hesaplaniyor...' : 'Rotayi Goster'}
        </button>
        {route && <p style={{ margin: '16px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Mesafe: <strong style={{ color: 'var(--text-primary)' }}>{route.distance} km</strong></p>}
      </div>

      {route && (
        <>
          <Marker position={route.start} icon={startIcon}>
            <Popup>Baslangic: {start}</Popup>
          </Marker>
          <Marker position={route.end} icon={endIcon}>
            <Popup>Bitis: {end}</Popup>
          </Marker>
          <Polyline positions={route.coords} color="#2A6B6B" weight={4} />
        </>
      )}
    </>
  );
}
