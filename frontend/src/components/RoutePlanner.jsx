import { useState, useEffect } from 'react';
import { Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Navigation, MapPin, Compass, Bookmark, CheckCircle2, RotateCcw, X, Search, ChevronRight } from 'lucide-react';
import RouteItineraryModal from './RouteItineraryModal';
import SavedRoutesModal from './SavedRoutesModal';

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const createStopNumberedIcon = (num) => {
  return L.divIcon({
    className: 'custom-stop-div-icon',
    html: `<div style="
      background: #2A6B6B; 
      color: #ffffff; 
      font-weight: 800; 
      font-size: 13px; 
      width: 28px; 
      height: 28px; 
      border-radius: 50%; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      border: 2.5px solid #ffffff; 
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const defaultBusinessIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

export default function RoutePlanner({ mobileTab = 'map', setMobileTab }) {
  const map = useMap();
  const [start, setStart] = useState('Konumum');
  const [end, setEnd] = useState('Antalya');
  const [userCoords, setUserCoords] = useState({ lat: 36.8841, lng: 30.7042 });
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  
  // Custom Confirmed Stops Mode
  const [confirmedStops, setConfirmedStops] = useState(null);
  const [activeRouteName, setActiveRouteName] = useState('');

  // Modals State
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isSavedRoutesOpen, setIsSavedRoutesOpen] = useState(false);

  // Detect user geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          setStart('Konumum');
        },
        () => {
          const c = map.getCenter();
          setUserCoords({ lat: c.lat, lng: c.lng });
          setStart('Konumum');
        }
      );
    }
  }, [map]);

  const geocode = async (query) => {
    const trimmed = (query || '').trim();
    if (
      trimmed.toLowerCase() === 'konumum' || 
      trimmed.toLowerCase() === 'mevcut konumum' || 
      trimmed.toLowerCase() === 'my location' ||
      !trimmed
    ) {
      return userCoords;
    }

    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}`);
    if (!res.data || res.data.length === 0) {
      throw new Error(`"${trimmed}" konumu bulunamadı.`);
    }
    return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
  };

  const sampleRoutePoints = (coords, count = 6) => {
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
      const promises = points.map(p => axios.get(`${API_URL}/geo/nearby?latitude=${p[0]}&longitude=${p[1]}&radius=20000`));
      const results = await Promise.all(promises);
      const all = results.flatMap(r => r.data?.businesses || []);
      const unique = Array.from(new Map(all.map(b => [b.id, b])).values());
      setBusinesses(unique);
    } catch (err) {
      console.error('Rota üzerindeki işletmeleri bulma hatası:', err);
    }
  };

  const calculateRoute = async () => {
    setLoading(true);
    setConfirmedStops(null);
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
          distance: (res.data.routes[0].distance / 1000).toFixed(1),
          durationMinutes: Math.round(res.data.routes[0].duration / 60)
        };
        setRoute(routeData);
        fetchBusinessesAlongRoute(coords);

        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50] });

        // On mobile, automatically switch to map tab to show the calculated route!
        if (setMobileTab && window.innerWidth <= 768) {
          setMobileTab('map');
        }
      }
    } catch (err) {
      alert('Rota hesaplanırken hata: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-calculate route passing strictly through the chosen stops!
  const handleApplyConfirmedRoute = async (selectedStops, routeTitle, overrideStart = null, overrideEnd = null) => {
    setLoading(true);
    try {
      let sPoint = overrideStart || route?.start;
      if (!sPoint || (!sPoint.lat && !sPoint.latitude)) {
        sPoint = await geocode(start);
      } else {
        sPoint = { lat: sPoint.lat ?? sPoint.latitude, lng: sPoint.lng ?? sPoint.longitude };
      }

      let ePoint = overrideEnd || route?.end;
      if (!ePoint || (!ePoint.lat && !ePoint.latitude)) {
        ePoint = await geocode(end);
      } else {
        ePoint = { lat: ePoint.lat ?? ePoint.latitude, lng: ePoint.lng ?? ePoint.longitude };
      }

      const allPoints = [
        sPoint,
        ...(selectedStops || []).map(s => ({ lat: s.latitude ?? s.lat, lng: s.longitude ?? s.lng })),
        ePoint
      ];

      const osrmWaypoints = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmWaypoints}?overview=full&geometries=geojson`;
      const res = await axios.get(osrmUrl);

      if (res.data.routes && res.data.routes.length > 0) {
        const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        const routeData = {
          coords,
          start: sPoint,
          end: ePoint,
          distance: (res.data.routes[0].distance / 1000).toFixed(1),
          durationMinutes: Math.round(res.data.routes[0].duration / 60)
        };

        setRoute(routeData);
        setConfirmedStops(selectedStops);
        setActiveRouteName(routeTitle || `${start} ➔ ${end}`);

        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50] });

        if (setMobileTab && window.innerWidth <= 768) {
          setMobileTab('map');
        }
      }
    } catch (err) {
      console.error('Özel güzergah çizilirken hata:', err);
      setConfirmedStops(selectedStops);
    } finally {
      setLoading(false);
    }
  };

  // Load a saved route from the database
  const handleLoadSavedRoute = async (savedRoute) => {
    setStart(savedRoute.startLocation || 'Başlangıç');
    setEnd(savedRoute.endLocation || 'Varış');
    setActiveRouteName(savedRoute.name);

    let startCoords = { lat: Number(savedRoute.startLat), lng: Number(savedRoute.startLng) };
    let endCoords = { lat: Number(savedRoute.endLat), lng: Number(savedRoute.endLng) };

    if (!startCoords.lat || !startCoords.lng) {
      try {
        startCoords = await geocode(savedRoute.startLocation);
      } catch {
        startCoords = userCoords;
      }
    }

    if (!endCoords.lat || !endCoords.lng) {
      try {
        endCoords = await geocode(savedRoute.endLocation);
      } catch {
        endCoords = { lat: 39.9334, lng: 32.8597 };
      }
    }

    const stops = (savedRoute.stops || []).map((s, idx) => ({
      id: s.businessId || s.id || `stop-${idx}`,
      name: s.businessName || s.stopName || `Durak ${idx + 1}`,
      type: s.businessType || 'Mekan',
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      coverImage: s.businessCoverImage,
      averageRating: s.businessRating || 5.0,
      address: s.businessAddress,
      kmAlongRoute: s.kmAlongRoute || 0
    }));

    await handleApplyConfirmedRoute(stops, savedRoute.name, startCoords, endCoords);
  };

  const isMobile = window.innerWidth <= 768;
  const showFullPlanner = !isMobile || mobileTab === 'route';

  return (
    <>
      {/* Mobile Floating Quickbar on Map Tab */}
      {isMobile && mobileTab === 'map' && (
        <div className="mobile-floating-top-bar">
          <div 
            className="mobile-search-pill"
            onClick={() => setMobileTab && setMobileTab('route')}
          >
            <Search size={16} color="var(--primary)" />
            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {route ? (
                <span>🟢 {start} ➔ 🔴 {end}</span>
              ) : (
                <span>Nereye gitmek istiyorsunuz?</span>
              )}
            </div>
            <ChevronRight size={16} color="var(--text-secondary)" />
          </div>

          {route && (
            <button 
              onClick={() => setIsItineraryOpen(true)}
              className="mobile-itinerary-shortcut-btn"
              title="Rota Tarifi & Duraklar"
            >
              <Compass size={16} />
              <span>Duraklar {confirmedStops ? `(${confirmedStops.length})` : ''}</span>
            </button>
          )}
        </div>
      )}

      {/* Main Route Planner Card */}
      {showFullPlanner && (
        <div className="route-planner-card">
          {/* Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Navigation size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', fontWeight: 800 }}>
                Rota Planlayıcı
              </h3>
            </div>

            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                onClick={() => setIsSavedRoutesOpen(true)}
                className="saved-routes-trigger-btn"
                title="Kayıtlı Güzergahlarımı Göster"
              >
                <Bookmark size={13} color="#f59e0b" />
                <span>Kayıtlı</span>
              </button>

              {isMobile && (
                <button
                  onClick={() => setMobileTab && setMobileTab('map')}
                  className="mobile-close-sheet-btn"
                  title="Haritaya Dön"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Start Location Input */}
          <div style={{ marginBottom: '10px' }}>
            <label className="input-label-sm">
              Başlangıç Noktası
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                value={start} 
                onChange={e => setStart(e.target.value)} 
                placeholder="Başlangıç (örn: Konumum veya İstanbul)" 
                className="route-input-field"
                style={{ fontWeight: start === 'Konumum' ? 600 : 400 }}
              />
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                      setStart('Konumum');
                    });
                  } else {
                    setStart('Konumum');
                  }
                }}
                title="Mevcut Konumumu Kullan"
                className="gps-locator-btn"
              >
                <MapPin size={16} />
              </button>
            </div>
          </div>

          {/* End Location Input */}
          <div style={{ marginBottom: '14px' }}>
            <label className="input-label-sm">
              Varış Noktası
            </label>
            <input 
              value={end} 
              onChange={e => setEnd(e.target.value)} 
              placeholder="Varış (örn: Antalya, Konya, İzmir)" 
              className="route-input-field"
            />
          </div>

          {/* Popular Cities Quick Select Pills on Mobile */}
          {isMobile && (
            <div className="quick-cities-row">
              {['Antalya', 'Konya', 'İzmir', 'Ankara', 'İstanbul'].map(city => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setEnd(city)}
                  className={`quick-city-pill ${end === city ? 'active' : ''}`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          <button 
            onClick={calculateRoute} 
            disabled={loading} 
            className="calculate-route-main-btn"
          >
            {loading ? 'Hesaplanıyor...' : 'Rotayı Göster'}
          </button>

          {route && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border)' }}>
              {confirmedStops ? (
                <div className="active-itinerary-banner">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 700, fontSize: 12 }}>
                    <CheckCircle2 size={15} />
                    <span>Onaylı Gezi Güzergahı Aktif</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {confirmedStops.length} seçili durak sırayla haritada gösteriliyor.
                  </div>
                </div>
              ) : null}

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span>Mesafe: <strong style={{ color: 'var(--text-primary)' }}>{route.distance} km</strong></span>
                {route.durationMinutes && (
                  <span>Süre: <strong style={{ color: 'var(--text-primary)' }}>{Math.floor(route.durationMinutes / 60)}s {route.durationMinutes % 60}dk</strong></span>
                )}
              </div>

              {/* "Rota Tarifi Oluştur" Button */}
              <button
                onClick={() => setIsItineraryOpen(true)}
                className="itinerary-open-trigger-btn"
              >
                <Compass size={16} /> Rota Tarifi & Durak Seçimi
              </button>
            </div>
          )}
        </div>
      )}

      {/* Map Polyline and Markers */}
      {route && (
        <>
          <Marker position={route.start} icon={startIcon}>
            <Popup>
              <div style={{ fontWeight: 600, color: '#16a34a' }}>
                🟢 Başlangıç: {start}
              </div>
            </Popup>
          </Marker>
          <Marker position={route.end} icon={endIcon}>
            <Popup>
              <div style={{ fontWeight: 600, color: '#dc2626' }}>
                🔴 Bitiş: {end}
              </div>
            </Popup>
          </Marker>
          {route.coords && route.coords.length > 0 && (
            <Polyline positions={route.coords} color="#2A6B6B" weight={5} opacity={0.85} />
          )}
        </>
      )}

      {/* Render only confirmed stops if active, otherwise render general along-route businesses */}
      {confirmedStops ? (
        confirmedStops.map((stop, idx) => (
          <Marker 
            key={stop.id || idx} 
            position={[stop.latitude, stop.longitude]} 
            icon={createStopNumberedIcon(idx + 1)}
          >
            <Popup>
              <div style={{ minWidth: '180px', color: 'var(--text-primary)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>
                  📍 {idx + 1}. Rota Durağı
                </div>
                {stop.coverImage && (
                  <img src={stop.coverImage} alt={stop.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} />
                )}
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700 }}>{stop.name}</h4>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{stop.type || stop.address}</p>
                <a 
                  href={`/business/${stop.id}`} 
                  style={{ display: 'block', textAlign: 'center', padding: '5px 8px', background: 'var(--primary)', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 11, fontWeight: 600 }}
                >
                  İşletme Detayı
                </a>
              </div>
            </Popup>
          </Marker>
        ))
      ) : (
        businesses.map(b => (
          <Marker key={b.id} position={[b.latitude, b.longitude]} icon={defaultBusinessIcon}>
            <Popup>
              <div style={{ minWidth: '160px', color: 'var(--text-primary)' }}>
                {b.coverImage && (
                  <img src={b.coverImage} alt={b.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} />
                )}
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 700 }}>{b.name}</h4>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>{b.type}</p>
                <a 
                  href={`/business/${b.id}`} 
                  style={{ display: 'block', textAlign: 'center', padding: '4px 8px', background: 'var(--primary)', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 11, fontWeight: 600 }}
                >
                  İşletmeyi Gör
                </a>
              </div>
            </Popup>
          </Marker>
        ))
      )}

      {/* Itinerary & Guide Modal */}
      <RouteItineraryModal
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        route={route}
        startName={start}
        endName={end}
        confirmedStops={confirmedStops}
        activeRouteName={activeRouteName}
        onFocusLocation={(lat, lng) => {
          setIsItineraryOpen(false);
          map.flyTo([lat, lng], 16, { duration: 1.2 });
        }}
        onApplyConfirmedRoute={handleApplyConfirmedRoute}
      />

      {/* Saved Routes Modal */}
      <SavedRoutesModal
        isOpen={isSavedRoutesOpen}
        onClose={() => setIsSavedRoutesOpen(false)}
        onLoadRoute={handleLoadSavedRoute}
        onOpenItinerary={async (savedRoute) => {
          await handleLoadSavedRoute(savedRoute);
          setIsItineraryOpen(true);
        }}
      />
    </>
  );
}
