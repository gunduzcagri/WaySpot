import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Navigation, Star, Search, Filter, 
  ExternalLink, Compass, Clock, CheckCircle2, Circle, 
  SlidersHorizontal, Milestone, Check, Share2, Printer, BookmarkCheck, Bookmark,
  Send, Users, Sparkles, ThumbsUp, ThumbsDown
} from 'lucide-react';
import axios from 'axios';
import { api } from '../services/api';
import ShareRouteModal from './ShareRouteModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

export default function RouteItineraryModal({ 
  isOpen, 
  onClose, 
  route, 
  startName, 
  endName, 
  confirmedStops,
  activeRouteName,
  initialSuggestions = [],
  onFocusLocation,
  onApplyConfirmedRoute 
}) {
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [maxDeviation, setMaxDeviation] = useState(25);
  const [totalRouteKm, setTotalRouteKm] = useState(0);

  // Stop Selection & Saving States
  const [selectedStopIds, setSelectedStopIds] = useState(new Set());
  const [customRouteName, setCustomRouteName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedRouteData, setSavedRouteData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Friend Suggestions & Collaboration States
  const [friendSuggestions, setFriendSuggestions] = useState(initialSuggestions || []);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [processingSuggestionId, setProcessingSuggestionId] = useState(null);

  const categories = [
    { id: 'all', label: 'Tümü' },
    { id: 'Cafe', label: '☕ Kafe' },
    { id: 'Restaurant', label: '🍽️ Restoran' },
    { id: 'Hotel', label: '🏨 Otel' },
    { id: 'Bar', label: '🍸 Bar' }
  ];

  const fetchStops = async () => {
    if (!route || !route.coords || route.coords.length < 2) return;
    setLoading(true);
    try {
      const maxPoints = 50;
      const sampled = [];
      const step = Math.max(1, Math.floor(route.coords.length / maxPoints));
      for (let i = 0; i < route.coords.length; i += step) {
        sampled.push({ lat: route.coords[i][0], lng: route.coords[i][1] });
      }
      const lastCoord = route.coords[route.coords.length - 1];
      if (sampled[sampled.length - 1].lat !== lastCoord[0] || sampled[sampled.length - 1].lng !== lastCoord[1]) {
        sampled.push({ lat: lastCoord[0], lng: lastCoord[1] });
      }

      const res = await axios.post(`${API_URL}/Route/stops-along-route`, {
        coordinates: sampled,
        maxDeviationKm: Number(maxDeviation),
        category: selectedCategory,
        minRating: minRating > 0 ? minRating : null,
        searchQuery: searchQuery || null
      });

      if (res.data) {
        const fetchedStops = res.data.stops || [];
        setTotalRouteKm(res.data.totalRouteKm || route.distance || 0);

        if (confirmedStops && confirmedStops.length > 0) {
          // Identify which stops match the saved/confirmed ones
          const matchedStopIds = new Set();
          
          fetchedStops.forEach(fs => {
            const isConfirmed = confirmedStops.some(cs => 
              (cs.businessId && cs.businessId.toString() === fs.id.toString()) ||
              (cs.id && cs.id.toString() === fs.id.toString()) ||
              (cs.name && cs.name.toLowerCase().trim() === fs.name.toLowerCase().trim()) ||
              (cs.stopName && cs.stopName.toLowerCase().trim() === fs.name.toLowerCase().trim())
            );
            if (isConfirmed) {
              matchedStopIds.add(fs.id);
            }
          });

          // Check if any confirmed stops were missing from fetchedStops (e.g. slight deviation or custom stop)
          const missingConfirmedStops = confirmedStops.filter(cs => 
            !fetchedStops.some(fs => 
              (cs.businessId || cs.id || '').toString() === fs.id.toString() || 
              (cs.name && cs.name.toLowerCase().trim() === fs.name.toLowerCase().trim())
            )
          ).map((cs, idx) => ({
            id: cs.businessId || cs.id || `confirmed-${idx}`,
            name: cs.name || cs.stopName || `Durak ${idx + 1}`,
            type: cs.type || cs.businessType || 'Mekan',
            latitude: Number(cs.latitude),
            longitude: Number(cs.longitude),
            coverImage: cs.coverImage || cs.businessCoverImage,
            averageRating: cs.averageRating || cs.businessRating || 5.0,
            totalReviews: cs.totalReviews || 1,
            address: cs.address || cs.businessAddress,
            distanceToRouteKm: 0.1,
            kmAlongRoute: cs.kmAlongRoute || 0
          }));

          missingConfirmedStops.forEach(ms => matchedStopIds.add(ms.id));
          const allStops = [...fetchedStops, ...missingConfirmedStops].sort((a, b) => (a.kmAlongRoute || 0) - (b.kmAlongRoute || 0));
          
          setStops(allStops);
          setSelectedStopIds(matchedStopIds);
        } else {
          setStops(fetchedStops);
          if (selectedStopIds.size === 0) {
            setSelectedStopIds(new Set(fetchedStops.map(s => s.id)));
          }
        }
      }
    } catch (err) {
      console.error('Güzergah durakları çekilirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && route) {
      setCustomRouteName(activeRouteName || `${startName || 'Başlangıç'} ➔ ${endName || 'Varış'} Gezi Rotası`);
      setSavedRouteData(null);
      setFriendSuggestions(initialSuggestions || []);
      setActionSuccessMsg(null);
      fetchStops();
    }
  }, [isOpen, confirmedStops, activeRouteName, initialSuggestions, selectedCategory, minRating, maxDeviation]);

  useEffect(() => {
    if (!isOpen || !route) return;
    const timeout = setTimeout(() => {
      fetchStops();
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const toggleStop = (id) => {
    setSelectedStopIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedStopIds(new Set(stops.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedStopIds(new Set());
  };

  const handleSuggestionDecision = async (suggestionId, action) => {
    setProcessingSuggestionId(suggestionId);
    try {
      const res = await api.post(`/routecollaboration/suggestion/${suggestionId}/decision`, { action });
      setActionSuccessMsg(res.data?.message || (action === 'accept' ? 'Tavsiye rotaya eklendi!' : 'Tavsiye reddedildi.'));

      if (action === 'accept' && res.data?.addedStop) {
        const added = res.data.addedStop;
        const newStopObj = {
          id: added.businessId || added.id,
          name: added.stopName,
          type: 'Tavsiye Edilen Mekan',
          latitude: Number(added.latitude),
          longitude: Number(added.longitude),
          distanceToRouteKm: 0.1,
          kmAlongRoute: stops.length > 0 ? (stops[stops.length - 1].kmAlongRoute || 10) + 2 : 5
        };

        setStops(prev => [...prev, newStopObj]);
        setSelectedStopIds(prev => new Set([...prev, newStopObj.id]));
      }

      // Update local suggestion status
      setFriendSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, status: action === 'accept' ? 'Accepted' : 'Rejected' } : s));

      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Tavsiye işleme hatası:', err);
    } finally {
      setProcessingSuggestionId(null);
    }
  };

  const handleSaveRoute = async () => {
    const selectedStopsList = stops
      .filter(s => selectedStopIds.has(s.id))
      .map((s, idx) => ({
        businessId: s.id,
        stopName: s.name,
        latitude: s.latitude,
        longitude: s.longitude,
        stopOrder: idx + 1,
        kmAlongRoute: s.kmAlongRoute,
        stayDurationMinutes: 30
      }));

    if (selectedStopsList.length === 0) {
      if (!window.confirm('Hiçbir ara durak seçmediniz. Rotayı duraksız olarak kaydetmek istiyor musunuz?')) {
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: customRouteName || `${startName} ➔ ${endName} Rotası`,
        startLocation: startName || 'Başlangıç',
        endLocation: endName || 'Varış',
        startLat: route?.start?.lat || 0,
        startLng: route?.start?.lng || 0,
        endLat: route?.end?.lat || 0,
        endLng: route?.end?.lng || 0,
        totalDistanceKm: parseFloat(route?.distance || totalRouteKm),
        estimatedDurationMinutes: route?.durationMinutes || 0,
        stops: selectedStopsList
      };

      const res = await api.post('/Route/save-custom-route', payload);
      setSavedRouteData(res.data?.route || payload);
    } catch (err) {
      console.error('Rota kaydedilirken hata:', err);
      alert('Rota kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToMap = () => {
    const chosenStops = stops.filter(s => selectedStopIds.has(s.id));
    if (onApplyConfirmedRoute) {
      onApplyConfirmedRoute(chosenStops, customRouteName, route?.start, route?.end);
    }
    onClose();
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handlePrintPdf = () => {
    const chosenStops = stops.filter(s => selectedStopIds.has(s.id));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stopsHtml = chosenStops.map((s, idx) => `
      <div style="margin-bottom: 12px; padding: 12px 14px; border-left: 4px solid #2A6B6B; background: #f8fafc; border-radius: 8px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="font-size: 15px; color: #1e293b;">${idx + 1}. Durak: ${s.name}</strong>
          <span style="font-size: 12px; color: #2A6B6B; font-weight: bold; background: #e6f4f1; padding: 2px 8px; border-radius: 4px;">📍 Yolun ${s.kmAlongRoute}. km'sinde</span>
        </div>
        <div style="font-size: 13px; color: #475569; margin-bottom: 4px;">${s.type} · ⭐ ${Number(s.averageRating || 5.0).toFixed(1)} (${s.totalReviews || 1} değerlendirme)</div>
        <div style="font-size: 12px; color: #64748b;">${s.address || 'Adres bilgisi'} ${s.phone ? `· 📞 ${s.phone}` : ''}</div>
        <div style="font-size: 11px; color: #d97706; margin-top: 4px;">🚗 Ana güzergahtan ${s.distanceToRouteKm < 1 ? `${Math.round(s.distanceToRouteKm * 1000)} m` : `${s.distanceToRouteKm} km`} içeride</div>
      </div>
    `).join('');

    const routeCoordsJson = JSON.stringify(route?.coords || []);
    const stopsJson = JSON.stringify(chosenStops.map((s, idx) => ({
      num: idx + 1,
      name: s.name,
      lat: s.latitude,
      lng: s.longitude,
      km: s.kmAlongRoute
    })));
    const startJson = JSON.stringify(route?.start || { lat: 36.8841, lng: 30.7042 });
    const endJson = JSON.stringify(route?.end || { lat: 39.9334, lng: 32.8597 });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${customRouteName} - WaySpot Gezi Rehberi</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            @media print {
              body { padding: 15px; }
              #map-container { height: 380px !important; }
              .no-print { display: none !important; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 28px; color: #1e293b; line-height: 1.5; }
            h1 { color: #2A6B6B; margin: 0 0 6px 0; font-size: 22px; }
            .header-box { background: #e6f4f1; padding: 14px 18px; border-radius: 10px; margin-bottom: 18px; border: 1px solid #b2dfdb; display: flex; flex-wrap: wrap; gap: 16px; }
            .meta-item { font-size: 13px; font-weight: 600; color: #134e4a; }
            #map-container { width: 100%; height: 360px; border-radius: 12px; border: 1.5px solid #cbd5e1; margin-bottom: 22px; }
            .custom-stop-div { background: #2A6B6B; color: #fff; font-weight: bold; font-size: 12px; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
          </style>
        </head>
        <body>
          <h1>🧭 ${customRouteName}</h1>
          <div class="header-box">
            <span class="meta-item">🟢 Başlangıç: ${startName || 'Konumunuz'}</span>
            <span class="meta-item">🔴 Varış: ${endName || 'Hedef'}</span>
            <span class="meta-item">📏 Toplam: ${route?.distance || totalRouteKm} km</span>
            <span class="meta-item">⏱️ Süre: ${route?.durationMinutes ? `${Math.floor(route.durationMinutes / 60)}s ${route.durationMinutes % 60}dk` : '--'}</span>
            <span class="meta-item">📍 Seçili Durak: ${chosenStops.length} Mekan</span>
          </div>

          <div id="map-container"></div>

          <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px;">
            Güzergah ve Durak Sıralaması
          </h3>
          ${stopsHtml || '<p>Seçili durak bulunmamaktadır.</p>'}

          <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            WaySpot Akıllı Rota ve Keşif Platformu ile oluşturulmuştur · ${new Date().toLocaleDateString('tr-TR')}
          </div>

          <script>
            window.addEventListener('DOMContentLoaded', () => {
              const map = L.map('map-container', { zoomControl: false, attributionControl: false });
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

              const rawCoords = ${routeCoordsJson};
              const stops = ${stopsJson};
              const start = ${startJson};
              const end = ${endJson};

              const latLngs = [];

              if (start && start.lat) {
                L.circleMarker([start.lat, start.lng], { radius: 8, fillColor: '#10b981', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map).bindPopup('🟢 Başlangıç');
                latLngs.push([start.lat, start.lng]);
              }

              if (rawCoords && rawCoords.length > 0) {
                L.polyline(rawCoords, { color: '#2A6B6B', weight: 4, opacity: 0.85 }).addTo(map);
                latLngs.push(...rawCoords);
              }

              stops.forEach(s => {
                const icon = L.divIcon({
                  className: 'custom-div-icon',
                  html: '<div class="custom-stop-div">' + s.num + '</div>',
                  iconSize: [26, 26],
                  iconAnchor: [13, 13]
                });
                L.marker([s.lat, s.lng], { icon: icon }).addTo(map).bindPopup('<b>' + s.num + '. ' + s.name + '</b><br>Km ' + s.km);
                latLngs.push([s.lat, s.lng]);
              });

              if (end && end.lat) {
                L.circleMarker([end.lat, end.lng], { radius: 8, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map).bindPopup('🔴 Varış');
                latLngs.push([end.lat, end.lng]);
              }

              if (latLngs.length > 0) {
                map.fitBounds(L.latLngBounds(latLngs), { padding: [25, 25] });
              }

              setTimeout(() => {
                window.print();
              }, 750);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  const totalDistanceNum = parseFloat(route?.distance || totalRouteKm) || 1;
  const selectedCount = stops.filter(s => selectedStopIds.has(s.id)).length;

  return (
    <div className="itinerary-modal-overlay">
      <div className="itinerary-modal-content">
        {/* Modal Header */}
        <div className="itinerary-modal-header">
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="itinerary-header-badge">
                <Compass size={14} /> ROTA REHBERİ
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {stops.length} Mekan Bulundu
              </span>
            </div>
            
            {/* Inline Custom Route Name Editor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={customRouteName}
                onChange={(e) => setCustomRouteName(e.target.value)}
                placeholder="Rotaya özel bir isim verin..."
                className="route-name-input"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  border: '1px dashed #94a3b8',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  background: '#f8fafc',
                  width: '90%'
                }}
              />
            </div>
          </div>
          <button onClick={onClose} className="itinerary-close-btn" title="Kapat">
            <X size={20} />
          </button>
        </div>

        {actionSuccessMsg && (
          <div style={{
            margin: '0 24px 12px',
            padding: '10px 16px',
            borderRadius: '8px',
            background: '#dcfce7',
            color: '#15803d',
            fontWeight: 600,
            fontSize: '0.9rem',
            border: '1px solid #86efac'
          }}>
            {actionSuccessMsg}
          </div>
        )}

        {/* Route Quick Stats */}
        <div className="itinerary-stats-row">
          <div className="itinerary-stat-box">
            <Navigation size={18} color="var(--primary)" />
            <div>
              <div className="stat-label">Toplam Mesafe</div>
              <div className="stat-value">{route?.distance || totalRouteKm} km</div>
            </div>
          </div>
          <div className="itinerary-stat-box">
            <Clock size={18} color="#f59e0b" />
            <div>
              <div className="stat-label">Tahmini Süre</div>
              <div className="stat-value">
                {route?.durationMinutes ? `${Math.floor(route.durationMinutes / 60)}s ${route.durationMinutes % 60}dk` : '--'}
              </div>
            </div>
          </div>
          <div className="itinerary-stat-box">
            <CheckCircle2 size={18} color="#10b981" />
            <div>
              <div className="stat-label">Seçilen Duraklar</div>
              <div className="stat-value" style={{ color: '#10b981' }}>{selectedCount} / {stops.length} Mekan</div>
            </div>
          </div>
        </div>

        {/* Filter & Selection Controls Bar */}
        <div className="itinerary-filter-bar">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="itinerary-search-box" style={{ flex: 1 }}>
              <Search size={16} color="var(--text-secondary)" />
              <input
                type="text"
                placeholder="Durak adı, lezzet veya etiket ara..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Select All / Deselect Toggle */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                onClick={selectAll}
                className="filter-pill-btn"
                style={{ fontSize: 11, padding: '6px 10px' }}
              >
                Tümünü Seç
              </button>
              <button 
                onClick={deselectAll}
                className="filter-pill-btn"
                style={{ fontSize: 11, padding: '6px 10px' }}
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="itinerary-filter-pills">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`filter-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
              <select
                value={minRating}
                onChange={e => setMinRating(Number(e.target.value))}
                className="itinerary-select"
              >
                <option value={0}>⭐ Tüm Puanlar</option>
                <option value={4.5}>⭐ 4.5 ve Üzeri</option>
                <option value={4.8}>⭐ 4.8+ En İyiler</option>
              </select>

              <select
                value={maxDeviation}
                onChange={e => setMaxDeviation(Number(e.target.value))}
                className="itinerary-select"
              >
                <option value={10}>Maks 10 km Sapma</option>
                <option value={25}>Maks 25 km Sapma</option>
                <option value={50}>Maks 50 km Sapma</option>
              </select>
            </div>
          </div>
        </div>

        {/* Timeline Itinerary Content */}
        <div className="itinerary-body">
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div className="spinner" style={{ margin: '0 auto 12px auto' }} />
              <span>Güzergah üzerindeki duraklar sıralanıyor...</span>
            </div>
          ) : (
            <div className="itinerary-timeline">
              {/* Start Point */}
              <div className="timeline-point start-point">
                <div className="timeline-marker start">
                  <div className="marker-dot" />
                </div>
                <div className="timeline-point-card">
                  <div className="timeline-point-header">
                    <span className="point-badge start">🟢 BAŞLANGIÇ NOKTASI</span>
                    <span className="prominent-km-badge start-badge">
                      🏁 0.0. Kilometre
                    </span>
                  </div>
                  <h4 className="point-title">{startName || 'Başlangıç Konumu'}</h4>
                  <p className="point-desc">Yolculuğun başlangıç noktası</p>
                </div>
              </div>

              {/* Friend Suggestions Banner & Cards (if any) */}
              {friendSuggestions && friendSuggestions.length > 0 && (
                <div style={{ margin: '14px 0 20px 32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 14px',
                    background: '#fffbeb',
                    borderRadius: '8px',
                    border: '1px solid #fde68a',
                    marginBottom: '10px'
                  }}>
                    <Sparkles size={16} color="#d97706" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                      Arkadaşınızdan Gelen Mekan Tavsiyeleri ({friendSuggestions.length})
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {friendSuggestions.map(sug => (
                      <div
                        key={sug.id}
                        style={{
                          background: '#fff',
                          border: sug.status === 'Accepted' ? '2px solid #10b981' : '2px solid #f59e0b',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                💡 ARKADAŞ TAVSİYESİ
                              </span>
                              {sug.status === 'Accepted' && (
                                <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                  ✓ Rotaya Dahil Edildi
                                </span>
                              )}
                              {sug.status === 'Rejected' && (
                                <span style={{ fontSize: '0.75rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                                  ✕ Reddedildi
                                </span>
                              )}
                            </div>
                            <h4 style={{ margin: '2px 0 6px', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>
                              {sug.stopName || sug.businessName}
                            </h4>
                            {sug.note && (
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', fontStyle: 'italic', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px' }}>
                                "{sug.note}"
                              </p>
                            )}
                          </div>

                          {sug.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleSuggestionDecision(sug.id, 'accept')}
                                disabled={processingSuggestionId === sug.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: '#10b981',
                                  color: '#fff',
                                  fontWeight: 700,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <ThumbsUp size={13} /> Rotaya Dahil Et
                              </button>
                              <button
                                onClick={() => handleSuggestionDecision(sug.id, 'reject')}
                                disabled={processingSuggestionId === sug.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#fff',
                                  color: '#64748b',
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <ThumbsDown size={13} /> Reddet
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sequential Stops */}
              {stops.map((stop, idx) => {
                const progressPercent = Math.min(100, Math.round((stop.kmAlongRoute / totalDistanceNum) * 100));
                const isSelected = selectedStopIds.has(stop.id);

                return (
                  <div key={stop.id} className="timeline-point stop-point">
                    <div 
                      className={`timeline-marker stop ${isSelected ? 'marker-selected' : 'marker-deselected'}`}
                      onClick={() => toggleStop(stop.id)}
                      style={{ cursor: 'pointer' }}
                      title={isSelected ? 'Rotadan Çıkar' : 'Rotaya Ekle'}
                    >
                      {isSelected ? (
                        <span className="stop-num">{idx + 1}</span>
                      ) : (
                        <Circle size={16} color="var(--text-muted)" />
                      )}
                    </div>

                    <div 
                      className={`timeline-point-card stop-card ${isSelected ? 'card-selected' : 'card-deselected'}`}
                      style={{
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        opacity: isSelected ? 1 : 0.65
                      }}
                    >
                      {/* Milestone Bar */}
                      <div className="stop-milestone-bar">
                        <div className="stop-milestone-left">
                          <Milestone size={15} color="var(--primary)" />
                          <span className="stop-milestone-text">
                            Yolun <strong>{stop.kmAlongRoute}. km</strong>'sinde
                          </span>
                        </div>
                        <div className="stop-milestone-right">
                          <span className="stop-km-tag">
                            📍 {stop.kmAlongRoute} km
                          </span>
                          <span className="stop-progress-percent">
                            (Güzergahın %{progressPercent}'i)
                          </span>
                        </div>
                      </div>

                      <div className="stop-card-main">
                        {stop.coverImage && (
                          <div className="stop-image-wrap">
                            <img src={stop.coverImage} alt={stop.name} />
                            <span className="stop-type-badge">{stop.type}</span>
                          </div>
                        )}
                        <div className="stop-info-wrap">
                          <div className="stop-top-row">
                            <h4 className="stop-name">{stop.name}</h4>
                            <div className="stop-rating-badge">
                              <Star size={13} fill="#f59e0b" color="#f59e0b" />
                              <span>{Number(stop.averageRating || 5.0).toFixed(1)}</span>
                              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({stop.totalReviews || 1})</span>
                            </div>
                          </div>

                          <p className="stop-desc">{stop.description}</p>
                          
                          <div className="stop-meta-row">
                            <span className="stop-address">
                              <MapPin size={13} /> {stop.address || 'Adres bilgisi mevcut'}
                            </span>
                            <span className="stop-deviation">
                              🚗 Yoldan {stop.distanceToRouteKm < 1 ? `${Math.round(stop.distanceToRouteKm * 1000)} m` : `${stop.distanceToRouteKm} km`} içeride
                            </span>
                          </div>

                          {stop.tags && stop.tags.length > 0 && (
                            <div className="stop-tags">
                              {stop.tags.slice(0, 4).map(t => (
                                <span key={t} className="stop-tag">#{t}</span>
                              ))}
                            </div>
                          )}

                          <div className="stop-actions-row">
                            <button
                              onClick={() => toggleStop(stop.id)}
                              className={isSelected ? 'stop-select-btn selected' : 'stop-select-btn'}
                            >
                              {isSelected ? (
                                <>
                                  <Check size={14} color="#ffffff" /> Seçildi
                                </>
                              ) : (
                                <>
                                  <Circle size={14} /> Rotaya Ekle
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => {
                                if (onFocusLocation) {
                                  onFocusLocation(stop.latitude, stop.longitude);
                                } else {
                                  window.dispatchEvent(new CustomEvent('wayspot-focus-map', {
                                    detail: { lat: stop.latitude, lng: stop.longitude }
                                  }));
                                }
                              }}
                              className="stop-btn-secondary"
                            >
                              <Navigation size={14} /> Haritada Odaklan
                            </button>

                            <a
                              href={`/business/${stop.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="stop-btn-secondary"
                            >
                              <ExternalLink size={14} /> İşletme
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {stops.length === 0 && (
                <div className="itinerary-empty-state">
                  <SlidersHorizontal size={36} color="var(--text-secondary)" />
                  <h4>Seçilen filtrelere uygun durak bulunamadı</h4>
                  <p>Sapma mesafesini artırabilir veya kategori filtrelerini temizleyebilirsiniz.</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setMinRating(0);
                      setMaxDeviation(50);
                      setSearchQuery('');
                    }}
                    className="filter-reset-btn"
                  >
                    Filtreleri Sıfırla
                  </button>
                </div>
              )}

              {/* End Point */}
              <div className="timeline-point end-point">
                <div className="timeline-marker end">
                  <div className="marker-dot" />
                </div>
                <div className="timeline-point-card">
                  <div className="timeline-point-header">
                    <span className="point-badge end">🏁 HEDEF VARIŞ NOKTASI</span>
                    <span className="prominent-km-badge end-badge">
                      🏆 {route?.distance || totalRouteKm}. Kilometre
                    </span>
                  </div>
                  <h4 className="point-title">{endName || 'Varış Noktası'}</h4>
                  <p className="point-desc">Rota güzergahının tamamlandığı hedef nokta</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Confirmation & Action Bar */}
        <div className="itinerary-modal-footer">
          {savedRouteData ? (
            <div className="itinerary-success-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 700, fontSize: 14 }}>
                <BookmarkCheck size={18} />
                <span>Güzergahınız {selectedCount} seçili durak ile hesabınıza kaydedildi!</span>
              </div>
              <div className="itinerary-post-save-actions">
                <button
                  onClick={handleApplyToMap}
                  className="post-save-btn map-btn"
                  title="Haritada sadece seçtiğiniz duraklarla rotayı gösterir"
                >
                  <Navigation size={15} /> Güzergahı Haritada Göster
                </button>
                <button
                  onClick={handlePrintPdf}
                  className="post-save-btn pdf-btn"
                  title="Güzergahı şık bir gezi rehberi formatında yazdır / PDF olarak kaydet"
                >
                  <Printer size={15} /> PDF Olarak Kaydet (Haritalı)
                </button>
                <button
                  onClick={handleShare}
                  className="post-save-btn share-btn"
                  title="Arkadaşına onaya/tavsiyeye gönder veya takipçilerine yayınla"
                >
                  <Share2 size={15} />
                  <span>Paylaş & Ortak Planla</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="itinerary-save-row">
              <div style={{ display: 'flex', gap: 10, width: '100%', flexWrap: 'wrap' }}>
                <button
                  onClick={handleApplyToMap}
                  className="stop-btn-secondary"
                  style={{ height: 42, padding: '0 16px', fontSize: 13 }}
                  title="Kaydetmeden sadece haritada seçilenleri göster"
                >
                  <Navigation size={14} /> Sadece Haritada Göster
                </button>

                <button
                  onClick={handleShare}
                  className="stop-btn-secondary"
                  style={{ height: 42, padding: '0 16px', fontSize: 13, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}
                  title="Arkadaşına onaya/tavsiyeye gönder veya takipçilere yayınla"
                >
                  <Share2 size={14} /> Arkadaşa Gönder / Paylaş
                </button>

                <button
                  onClick={handleSaveRoute}
                  disabled={saving}
                  className="save-route-primary-btn"
                  style={{ marginLeft: 'auto' }}
                >
                  <Bookmark size={15} />
                  <span>{saving ? 'Kaydediliyor...' : `Güzergahı Onayla & Kaydet (${selectedCount} Durak)`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share & Collaboration Modal */}
      <ShareRouteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        routeData={{
          id: savedRouteData?.id || null,
          startLocation: startName || 'Başlangıç',
          endLocation: endName || 'Varış',
          startCoords: [route?.start?.lat || 0, route?.start?.lng || 0],
          endCoords: [route?.end?.lat || 0, route?.end?.lng || 0],
          totalDistanceKm: parseFloat(route?.distance || totalRouteKm),
          durationMinutes: route?.durationMinutes || 0,
          stops: stops.filter(s => selectedStopIds.has(s.id))
        }}
        defaultRouteName={customRouteName}
        onSuccess={() => {
          setActionSuccessMsg('Rota başarıyla paylaşıldı!');
          setTimeout(() => setActionSuccessMsg(null), 3000);
        }}
      />
    </div>
  );
}
