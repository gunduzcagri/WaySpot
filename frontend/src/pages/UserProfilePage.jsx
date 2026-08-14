import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bookmark, MessageSquare, Navigation, Trash2, Printer, Share2, Check, 
  Users, UserPlus, UserCheck, Search, Sparkles, Send, Compass, ThumbsUp, Clock, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareRouteModal from '../components/ShareRouteModal';
import RouteSuggestionReviewModal from '../components/RouteSuggestionReviewModal';
import RouteItineraryModal from '../components/RouteItineraryModal';

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [inboxCollaborations, setInboxCollaborations] = useState([]);
  const [sentCollaborations, setSentCollaborations] = useState([]);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [followerUsers, setFollowerUsers] = useState([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchUserResults, setSearchUserResults] = useState([]);
  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'collabs' | 'social' | 'reviews'
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  // Modals state
  const [selectedRouteForShare, setSelectedRouteForShare] = useState(null);
  const [selectedCollabForReview, setSelectedCollabForReview] = useState(null);
  const [activeItineraryRoute, setActiveItineraryRoute] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProfileData = async () => {
    try {
      const [profileRes, reviewsRes, routesRes, inboxRes, sentRes, friendsRes] = await Promise.all([
        api.get('/profile').catch(() => ({ data: user })),
        api.get('/profile/my-reviews').catch(() => ({ data: [] })),
        api.get('/Route/my-routes').catch(() => ({ data: [] })),
        api.get('/routecollaboration/inbox').catch(() => ({ data: [] })),
        api.get('/routecollaboration/sent').catch(() => ({ data: [] })),
        api.get('/social/friends').catch(() => ({ data: { following: [], followers: [] } }))
      ]);

      setProfile(profileRes.data || user);
      setReviews(reviewsRes.data || []);
      setSavedRoutes(routesRes.data || []);
      setInboxCollaborations(inboxRes.data || []);
      setSentCollaborations(sentRes.data || []);
      setFollowingUsers(friendsRes.data?.following || []);
      setFollowerUsers(friendsRes.data?.followers || []);
    } catch (err) {
      console.error(err);
      setProfile(user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSearchUsers = async (q) => {
    setSearchUserQuery(q);
    if (!q.trim()) {
      setSearchUserResults([]);
      return;
    }
    try {
      const res = await api.get(`/social/search-users?query=${encodeURIComponent(q.trim())}`);
      setSearchUserResults(res.data || []);
    } catch (err) {
      console.error('User search error:', err);
    }
  };

  const handleToggleFollow = async (targetUserId) => {
    try {
      const res = await api.post(`/social/follow/${targetUserId}`);
      // Refresh friends
      const friendsRes = await api.get('/social/friends');
      setFollowingUsers(friendsRes.data?.following || []);
      setFollowerUsers(friendsRes.data?.followers || []);
      
      // Update search results if present
      setSearchUserResults(prev => prev.map(u => u.id === targetUserId ? { ...u, isFollowedByMe: res.data.isFollowing } : u));
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Bu rotayı silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/Route/${id}`);
      setSavedRoutes(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Rota silinemedi.');
    }
  };

  const handleShare = (route) => {
    setSelectedRouteForShare(route);
  };

  const handlePrint = (route) => {
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

  const pendingCollabCount = inboxCollaborations.filter(c => c.status === 'Pending' || c.status === 'ReviewedWithSuggestions').length;

  if (loading) return <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 840, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Kullanıcı Profili & Sosyal Merkez</h2>
      
      {/* Profile Card */}
      <div style={{ padding: 22, borderRadius: 20, background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              {profile?.username}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profile?.email}</div>
            {profile?.firstName && <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{profile.firstName} {profile.lastName}</div>}
            {profile?.bio && <p style={{ marginTop: 10, color: 'var(--text-primary)', fontSize: 14 }}>{profile.bio}</p>}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center', background: '#eff6ff', padding: '8px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>{followerUsers.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Takipçi</div>
            </div>
            <div style={{ textAlign: 'center', background: '#ecfdf5', padding: '8px 14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{followingUsers.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Takip Edilen</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <span>🛣️ <strong>{savedRoutes.length}</strong> kayıtlı rota</span>
          <span>📬 <strong>{inboxCollaborations.length}</strong> gelen rota önerisi</span>
          <span>💬 <strong>{reviews.length}</strong> değerlendirme</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 10, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('routes')}
          className={`filter-btn ${activeTab === 'routes' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <Bookmark size={14} /> Kayıtlı Rotalarım ({savedRoutes.length})
        </button>

        <button
          onClick={() => setActiveTab('collabs')}
          className={`filter-btn ${activeTab === 'collabs' ? 'active' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            position: 'relative'
          }}
        >
          <Sparkles size={14} color="#f59e0b" /> Rota Önerileri & İşbirlikleri
          {pendingCollabCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              {pendingCollabCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`filter-btn ${activeTab === 'social' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <Users size={14} /> Arkadaşlar & Takip ({followingUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`filter-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <MessageSquare size={14} /> Değerlendirmelerim ({reviews.length})
        </button>
      </div>

      {/* TAB 1: Kayıtlı Rotalarım */}
      {activeTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {savedRoutes.length === 0 ? (
            <div style={{ padding: 30, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Henüz kayıtlı bir gezi rotanız bulunmuyor. Harita üzerinden rota planlayıp kaydedebilirsiniz.
            </div>
          ) : (
            savedRoutes.map(r => (
              <div key={r.id} style={{ padding: 16, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</h4>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      🟢 {r.startLocation} ➔ 🔴 {r.endLocation}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {r.stopCount || r.stops?.length || 0} Seçili Durak
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>📏 {r.totalDistanceKm} km</span>
                  <span>⏱️ {Math.floor(r.estimatedDurationMinutes / 60)}s {r.estimatedDurationMinutes % 60}dk</span>
                  <span>📅 {new Date(r.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>

                {r.stops && r.stops.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {r.stops.map((s, idx) => (
                      <span key={s.id || idx} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        {idx + 1}. {s.businessName || s.stopName}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleShare(r)}
                      className="stop-btn-secondary"
                      style={{ padding: '5px 10px', fontSize: 11, background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe', fontWeight: 600 }}
                      title="Arkadaşına onaya/tavsiyeye gönder veya takipçilerine yayınla"
                    >
                      <Share2 size={13} />
                      <span>Ortak Paylaş</span>
                    </button>
                    <button onClick={() => handlePrint(r)} className="stop-btn-secondary" style={{ padding: '4px 8px', fontSize: 11 }}>
                      <Printer size={13} />
                      <span>PDF</span>
                    </button>
                    <button onClick={() => handleDeleteRoute(r.id)} className="stop-btn-secondary" style={{ padding: '4px 8px', fontSize: 11, color: '#ef4444' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => navigate('/?openRoute=' + r.id + '&tab=route')}
                      className="stop-btn-secondary"
                      style={{
                        padding: '5px 12px',
                        fontSize: 12,
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.25))',
                        borderColor: '#10b981',
                        color: '#10b981',
                        fontWeight: 700
                      }}
                    >
                      <Compass size={13} /> Rota Tarifinde Aç
                    </button>

                    <button
                      onClick={() => navigate('/?openRoute=' + r.id)}
                      className="stop-btn-primary"
                      style={{ padding: '5px 12px', fontSize: 12 }}
                    >
                      <Navigation size={13} /> Haritada Aç
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Gelen Rota Önerileri & İşbirlikleri */}
      {activeTab === 'collabs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Gelen Rota Önerileri (Inbox) */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.05rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📬</span> Size Gelen Rotalar ({inboxCollaborations.length})
            </h4>

            {inboxCollaborations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Henüz size gönderilen bir rota incelemesi veya firma önerisi bulunmuyor.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inboxCollaborations.map(collab => {
                  const isBroadcast = collab.type === 'BusinessBroadcast';
                  const hasSuggestions = collab.suggestions && collab.suggestions.length > 0;

                  return (
                    <div
                      key={collab.id}
                      style={{
                        padding: 16,
                        borderRadius: 16,
                        background: '#fff',
                        border: collab.status === 'Pending' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: isBroadcast ? '#ecfdf5' : '#eff6ff',
                              color: isBroadcast ? '#059669' : '#2563eb'
                            }}>
                              {isBroadcast ? '📢 FİRMA ÖNERİLEN ROTASI' : '🤝 ARKADAŞ ONAY & TAVSİYE İSTEĞİ'}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              Gönderen: <strong>{collab.sender?.displayName || collab.sender?.username}</strong>
                            </span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>
                            {collab.route?.name}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                            🟢 {collab.route?.startLocation} ➔ 🔴 {collab.route?.endLocation}
                          </div>
                        </div>

                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: collab.status === 'Pending' ? '#fef3c7' : '#dcfce7',
                          color: collab.status === 'Pending' ? '#b45309' : '#15803d'
                        }}>
                          {collab.status === 'Pending' ? '⏳ İnceleme Bekliyor' : collab.status === 'ReviewedWithSuggestions' ? '💡 Tavsiyeler İletildi' : '✓ Tamamlandı'}
                        </span>
                      </div>

                      {collab.senderNote && (
                        <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #3b82f6', fontSize: '0.85rem', color: '#334155', margin: '8px 0' }}>
                          💬 <strong>Gönderen Notu:</strong> "{collab.senderNote}"
                        </div>
                      )}

                      {/* Tavsiye Edilen Duraklar (varsa) */}
                      {hasSuggestions && (
                        <div style={{ margin: '8px 0', padding: '8px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginBottom: '4px' }}>
                            ✨ Eklenen Mekan Tavsiyeleri ({collab.suggestions.length}):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {collab.suggestions.map(s => (
                              <span key={s.id} style={{ fontSize: '0.8rem', background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fde68a', color: '#92400e' }}>
                                💡 {s.stopName} {s.note ? `("${s.note}")` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                        {!isBroadcast && (
                          <button
                            onClick={() => setSelectedCollabForReview(collab)}
                            className="stop-btn-secondary"
                            style={{ padding: '6px 14px', fontSize: '0.85rem', background: '#eff6ff', borderColor: '#3b82f6', color: '#2563eb', fontWeight: 700 }}
                          >
                            <Sparkles size={14} /> İncele & Mekan Tavsiye Et
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/?openRoute=${collab.route?.id}&tab=route`)}
                          className="stop-btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                        >
                          <Navigation size={14} /> Haritada Gez
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Giden Rota İstekleri (Sent Collaborations) */}
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '1.05rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> Arkadaşlarınıza Gönderdiğiniz Rotalar ({sentCollaborations.length})
            </h4>

            {sentCollaborations.map(collab => (
              <div
                key={collab.id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b' }}>
                      {collab.route?.name} ➔ Alıcı: <strong>{collab.recipient?.displayName || collab.recipient?.username}</strong>
                    </h5>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      Durum: {collab.status === 'ReviewedWithSuggestions' ? '💡 Arkadaşınız mekan tavsiyeleri ekledi!' : collab.status === 'Approved' ? '✓ Onaylandı' : '⏳ İnceleme bekleniyor'}
                    </div>
                  </div>

                  {collab.suggestions && collab.suggestions.length > 0 && (
                    <button
                      onClick={() => {
                        setActiveItineraryRoute({
                          ...collab.route,
                          distance: collab.route.totalDistanceKm,
                          durationMinutes: collab.route.estimatedDurationMinutes,
                          start: { lat: collab.route.startLat, lng: collab.route.startLng },
                          end: { lat: collab.route.endLat, lng: collab.route.endLng },
                          coords: [[collab.route.startLat, collab.route.startLng], [collab.route.endLat, collab.route.endLng]],
                          suggestions: collab.suggestions
                        });
                      }}
                      className="stop-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#fffbeb', borderColor: '#f59e0b', color: '#b45309', fontWeight: 700 }}
                    >
                      <Sparkles size={13} /> Tavsiyeleri İncele ({collab.suggestions.length})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Arkadaşlar & Takip */}
      {activeTab === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Kullanıcı Arama */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              🔍 Yeni Arkadaş veya İşletme Bul
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Kullanıcı adı, isim veya işletme adı yazın..."
                value={searchUserQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            {searchUserResults.length > 0 && (
              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {searchUserResults.map(u => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {u.displayName ? u.displayName[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{u.displayName || u.username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username} {u.businessName ? `• ${u.businessName}` : ''}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(u.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        background: u.isFollowedByMe ? '#f1f5f9' : '#2563eb',
                        color: u.isFollowedByMe ? '#475569' : '#fff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {u.isFollowedByMe ? <UserCheck size={14} /> : <UserPlus size={14} />}
                      {u.isFollowedByMe ? 'Takip Ediliyor' : 'Takip Et'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Takip Edilen Arkadaşlar Listesi */}
          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#1e293b' }}>
              Takip Ettiğiniz Kişiler & İşletmeler ({followingUsers.length})
            </h4>

            {followingUsers.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', background: '#f8fafc', borderRadius: 10, color: '#64748b', fontSize: '0.85rem' }}>
                Henüz kimseyi takip etmiyorsunuz. Yukarıdaki arama kutusundan arkadaşlarınızı bulabilirsiniz.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {followingUsers.map(f => (
                  <div
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#fff',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                        {f.displayName ? f.displayName[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{f.displayName || f.username}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{f.username}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleFollow(f.id)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        background: '#fff',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Bırak
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Değerlendirmelerim */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ padding: 14, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{r.businessName}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{r.comment}</div>
              <small style={{ color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                {new Date(r.createdAt).toLocaleString('tr-TR')} · ⭐ {r.rating}/5
              </small>
            </div>
          ))}
          {!reviews.length && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Henüz yorum yok.</p>}
        </div>
      )}

      {/* Share Route Modal */}
      {selectedRouteForShare && (
        <ShareRouteModal
          isOpen={true}
          onClose={() => setSelectedRouteForShare(null)}
          routeData={selectedRouteForShare}
          defaultRouteName={selectedRouteForShare.name}
          onSuccess={() => fetchProfileData()}
        />
      )}

      {/* Friend Suggestion Review Modal */}
      {selectedCollabForReview && (
        <RouteSuggestionReviewModal
          isOpen={true}
          onClose={() => setSelectedCollabForReview(null)}
          collaboration={selectedCollabForReview}
          onSuccess={() => fetchProfileData()}
        />
      )}

      {/* Itinerary Modal for reviewing suggestions */}
      {activeItineraryRoute && (
        <RouteItineraryModal
          isOpen={true}
          onClose={() => setActiveItineraryRoute(null)}
          route={activeItineraryRoute}
          startName={activeItineraryRoute.startLocation}
          endName={activeItineraryRoute.endLocation}
          activeRouteName={activeItineraryRoute.name}
          initialSuggestions={activeItineraryRoute.suggestions || []}
        />
      )}
    </div>
  );
}
