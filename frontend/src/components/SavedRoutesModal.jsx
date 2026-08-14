import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Navigation, Clock, Trash2, 
  Share2, Printer, ExternalLink, Bookmark, Compass, Check 
} from 'lucide-react';
import { api } from '../services/api';

export default function SavedRoutesModal({ isOpen, onClose, onLoadRoute, onOpenItinerary }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchSavedRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Route/my-routes');
      setRoutes(res.data || []);
    } catch (err) {
      console.error('Kayıtlı rotalar yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSavedRoutes();
    }
  }, [isOpen]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Bu rotayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/Route/${id}`);
      setRoutes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Rota silinirken hata oluştu.');
    }
  };

  const handleShare = (route, e) => {
    e.stopPropagation();
    const shareText = `WaySpot Rota Rehberi: ${route.name} (${route.totalDistanceKm} km, ${route.stopCount} durak)`;
    if (navigator.share) {
      navigator.share({
        title: route.name,
        text: shareText,
        url: window.location.origin
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} - ${window.location.origin}`);
      setCopiedId(route.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handlePrint = (route, e) => {
    e.stopPropagation();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const stops = route.stops || [];
    const stopsHtml = stops.map((s, idx) => `
      <div style="margin-bottom: 12px; padding: 12px 14px; border-left: 4px solid #2A6B6B; background: #f8fafc; border-radius: 8px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="font-size: 15px; color: #1e293b;">${idx + 1}. Durak: ${s.businessName || s.stopName}</strong>
          <span style="font-size: 12px; color: #2A6B6B; font-weight: bold; background: #e6f4f1; padding: 2px 8px; border-radius: 4px;">📍 ${s.businessType || 'Mekan'}</span>
        </div>
        <div style="font-size: 12px; color: #64748b;">${s.businessAddress || 'Adres bilgisi'}</div>
      </div>
    `).join('');

    const startJson = JSON.stringify({ lat: Number(route.startLat), lng: Number(route.startLng) });
    const endJson = JSON.stringify({ lat: Number(route.endLat), lng: Number(route.endLng) });
    const stopsJson = JSON.stringify(stops.map((s, idx) => ({
      num: idx + 1,
      name: s.businessName || s.stopName,
      lat: Number(s.latitude),
      lng: Number(s.longitude)
    })));

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${route.name} - WaySpot Rota Rehberi</title>
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
          <h1>🧭 ${route.name}</h1>
          <div class="header-box">
            <span class="meta-item">🟢 Başlangıç: ${route.startLocation}</span>
            <span class="meta-item">🔴 Varış: ${route.endLocation}</span>
            <span class="meta-item">📏 Toplam: ${route.totalDistanceKm} km</span>
            <span class="meta-item">⏱️ Süre: ${Math.floor(route.estimatedDurationMinutes / 60)}s ${route.estimatedDurationMinutes % 60}dk</span>
            <span class="meta-item">📍 Seçili Durak: ${stops.length} Mekan</span>
          </div>

          <div id="map-container"></div>

          <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 14px;">
            Güzergah ve Durak Sıralaması
          </h3>
          ${stopsHtml || '<p>Kayıtlı durak yok.</p>'}

          <div style="margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            WaySpot Akıllı Rota ve Keşif Platformu ile oluşturulmuştur · ${new Date().toLocaleDateString('tr-TR')}
          </div>

          <script>
            window.addEventListener('DOMContentLoaded', () => {
              const map = L.map('map-container', { zoomControl: false, attributionControl: false });
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

              const stops = ${stopsJson};
              const start = ${startJson};
              const end = ${endJson};
              const latLngs = [];

              if (start && start.lat) {
                L.circleMarker([start.lat, start.lng], { radius: 8, fillColor: '#10b981', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map).bindPopup('🟢 Başlangıç');
                latLngs.push([start.lat, start.lng]);
              }

              stops.forEach(s => {
                const icon = L.divIcon({
                  className: 'custom-div-icon',
                  html: '<div class="custom-stop-div">' + s.num + '</div>',
                  iconSize: [26, 26],
                  iconAnchor: [13, 13]
                });
                L.marker([s.lat, s.lng], { icon: icon }).addTo(map).bindPopup('<b>' + s.num + '. ' + s.name + '</b>');
                latLngs.push([s.lat, s.lng]);
              });

              if (end && end.lat) {
                L.circleMarker([end.lat, end.lng], { radius: 8, fillColor: '#ef4444', color: '#fff', weight: 2, fillOpacity: 1 }).addTo(map).bindPopup('🔴 Varış');
                latLngs.push([end.lat, end.lng]);
              }

              if (latLngs.length > 1) {
                L.polyline(latLngs, { color: '#2A6B6B', weight: 4, opacity: 0.85, dashArray: '6, 8' }).addTo(map);
                map.fitBounds(L.latLngBounds(latLngs), { padding: [25, 25] });
              }

              setTimeout(() => { window.print(); }, 750);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="itinerary-modal-overlay">
      <div className="itinerary-modal-content" style={{ width: 680 }}>
        {/* Header */}
        <div className="itinerary-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 12, color: 'var(--primary)' }}>
              <Bookmark size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)', fontWeight: 800 }}>
                Kayıtlı Güzergahlarım
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Hesabınızda saklanan {routes.length} rota
              </span>
            </div>
          </div>
          <button onClick={onClose} className="itinerary-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="itinerary-body" style={{ padding: '16px 20px' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
              Yükleniyor...
            </div>
          ) : routes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <Compass size={40} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)' }}>Henüz kayıtlı rotanız yok</h4>
              <p style={{ fontSize: 13, margin: 0 }}>
                Harita üzerinde bir rota çizip "Rota Tarifi Oluştur" adımından duraklarınızı seçerek kaydedebilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {routes.map(r => (
                <div 
                  key={r.id}
                  className="saved-route-card"
                  style={{
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 16,
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {r.name}
                      </h4>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>🟢 {r.startLocation}</span>
                        <span>➔</span>
                        <span>🔴 {r.endLocation}</span>
                      </div>
                    </div>
                    <span style={{ 
                      fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, 
                      background: 'var(--primary-light)', color: 'var(--primary)' 
                    }}>
                      {r.stopCount} Seçili Durak
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span>📏 <strong>{r.totalDistanceKm} km</strong></span>
                    <span>⏱️ <strong>{Math.floor(r.estimatedDurationMinutes / 60)}s {r.estimatedDurationMinutes % 60}dk</strong></span>
                    <span>📅 {new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>

                  {/* Stops preview pills */}
                  {r.stops && r.stops.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                      {r.stops.map((s, idx) => (
                        <span key={s.id || idx} style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 4,
                          background: 'var(--bg-card)', border: '1px solid var(--border)',
                          color: 'var(--text-primary)', fontWeight: 500
                        }}>
                          {idx + 1}. {s.businessName || s.stopName}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={(e) => handleShare(r, e)}
                        className="stop-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        title="Paylaş"
                      >
                        {copiedId === r.id ? <Check size={13} color="#10b981" /> : <Share2 size={13} />}
                        <span>{copiedId === r.id ? 'Kopyalandı!' : 'Paylaş'}</span>
                      </button>
                      <button
                        onClick={(e) => handlePrint(r, e)}
                        className="stop-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 11 }}
                        title="PDF Yazdır"
                      >
                        <Printer size={13} />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={(e) => handleDelete(r.id, e)}
                        className="stop-btn-secondary"
                        style={{ padding: '5px 10px', fontSize: 11, color: '#ef4444' }}
                        title="Rotayı Sil"
                      >
                        <Trash2 size={13} />
                        <span>Sil</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          if (onOpenItinerary) {
                            onOpenItinerary(r);
                          } else {
                            onLoadRoute(r);
                          }
                          onClose();
                        }}
                        className="stop-btn-secondary"
                        style={{
                          padding: '6px 14px',
                          fontSize: 12,
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                          borderColor: '#10b981',
                          color: '#10b981',
                          fontWeight: 700
                        }}
                      >
                        <Compass size={14} /> Rota Tarifinde Aç
                      </button>

                      <button
                        onClick={() => {
                          onLoadRoute(r);
                          onClose();
                        }}
                        className="stop-btn-primary"
                        style={{ padding: '6px 14px', fontSize: 12 }}
                      >
                        <Navigation size={13} /> Haritada Aç
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
