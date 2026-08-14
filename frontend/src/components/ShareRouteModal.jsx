import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ShareRouteModal = ({
  isOpen,
  onClose,
  routeData,
  defaultRouteName = '',
  currentUserRole = 'User',
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState('friend'); // 'friend' | 'followers'
  const [routeName, setRouteName] = useState(defaultRouteName || 'Özel Gezi Rotası');
  const [senderNote, setSenderNote] = useState('');
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [selectedFollowerIds, setSelectedFollowerIds] = useState([]);
  const [selectAllFollowers, setSelectAllFollowers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultRouteName) setRouteName(defaultRouteName);
      setSenderNote('');
      setFeedback(null);
      fetchFriendsAndFollowers();
    }
  }, [isOpen, defaultRouteName]);

  const fetchFriendsAndFollowers = async () => {
    setLoadingFriends(true);
    try {
      const res = await api.get('/social/friends');
      setFriends(res.data.following || []);
      setFollowers(res.data.followers || []);
      if (res.data.following && res.data.following.length > 0) {
        setSelectedFriendId(res.data.following[0].id);
      }
      if (res.data.followers) {
        setSelectedFollowerIds(res.data.followers.map(f => f.id));
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/social/search-users?query=${encodeURIComponent(query.trim())}`);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('Search user error:', err);
    }
  };

  const handleSendToFriend = async () => {
    if (!selectedFriendId) {
      setFeedback({ type: 'error', text: 'Lütfen bir arkadaşınızı seçin.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        routeId: routeData?.id || null,
        recipientUserId: selectedFriendId,
        routeName: routeName.trim() || 'Özel Gezi Rotası',
        senderNote: senderNote.trim(),
        startLocation: routeData?.startLocation || routeData?.startAddress || 'Başlangıç',
        endLocation: routeData?.endLocation || routeData?.endAddress || 'Varış',
        startLat: routeData?.startCoords?.[0] || routeData?.startLat || 0,
        startLng: routeData?.startCoords?.[1] || routeData?.startLng || 0,
        endLat: routeData?.endCoords?.[0] || routeData?.endLat || 0,
        endLng: routeData?.endCoords?.[1] || routeData?.endLng || 0,
        totalDistanceKm: routeData?.totalDistanceKm || 0,
        estimatedDurationMinutes: routeData?.durationMinutes || 0,
        stops: (routeData?.stops || []).map((s, idx) => ({
          businessId: s.businessId || s.id || null,
          stopName: s.name || s.stopName || `Durak ${idx + 1}`,
          latitude: s.location?.latitude || s.lat || s.latitude || 0,
          longitude: s.location?.longitude || s.lng || s.longitude || 0,
          stopOrder: idx + 1,
          stayDurationMinutes: s.stayDurationMinutes || 30
        }))
      };

      const res = await api.post('/routecollaboration/send-to-friend', payload);
      setFeedback({ type: 'success', text: res.data.message || 'Rota arkadaşınıza başarıyla gönderildi!' });
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Error sending route:', err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Rota gönderilirken bir hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBroadcastToFollowers = async () => {
    const recipientIds = selectAllFollowers ? [] : selectedFollowerIds;
    if (!selectAllFollowers && recipientIds.length === 0) {
      setFeedback({ type: 'error', text: 'Lütfen en az bir takipçi seçin.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        routeId: routeData?.id || null,
        recipientUserIds: recipientIds,
        routeName: routeName.trim() || 'Firma Özel Gezi Rotası',
        broadcastNote: senderNote.trim(),
        startLocation: routeData?.startLocation || routeData?.startAddress || 'Başlangıç',
        endLocation: routeData?.endLocation || routeData?.endAddress || 'Varış',
        startLat: routeData?.startCoords?.[0] || routeData?.startLat || 0,
        startLng: routeData?.startCoords?.[1] || routeData?.startLng || 0,
        endLat: routeData?.endCoords?.[0] || routeData?.endLat || 0,
        endLng: routeData?.endCoords?.[1] || routeData?.endLng || 0,
        totalDistanceKm: routeData?.totalDistanceKm || 0,
        estimatedDurationMinutes: routeData?.durationMinutes || 0,
        stops: (routeData?.stops || []).map((s, idx) => ({
          businessId: s.businessId || s.id || null,
          stopName: s.name || s.stopName || `Durak ${idx + 1}`,
          latitude: s.location?.latitude || s.lat || s.latitude || 0,
          longitude: s.location?.longitude || s.lng || s.longitude || 0,
          stopOrder: idx + 1,
          stayDurationMinutes: s.stayDurationMinutes || 30
        }))
      };

      const res = await api.post('/routecollaboration/broadcast-to-followers', payload);
      setFeedback({ type: 'success', text: res.data.message || 'Rota takipçilerinize başarıyla yayınlandı!' });
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Error broadcasting route:', err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Rota yayınlanırken bir hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content itinerary-modal-container" style={{ maxWidth: '560px', width: '92%' }}>
        {/* Header */}
        <div className="itinerary-header" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚀</span> Rotayı Paylaş & Ortak Planla
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
              Arkadaşına incelemeye gönder veya takipçilerine rehber olarak yayınla
            </p>
          </div>
          <button className="btn-close-itinerary" onClick={onClose}>✕</button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('friend')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'friend' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'friend' ? '3px solid #2563eb' : '3px solid transparent',
              fontWeight: 600,
              color: activeTab === 'friend' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🤝</span> Arkadaşa Onaya / Tavsiyeye Gönder
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'followers' ? '#fff' : 'transparent',
              borderBottom: activeTab === 'followers' ? '3px solid #059669' : '3px solid transparent',
              fontWeight: 600,
              color: activeTab === 'followers' ? '#059669' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>📢</span> Takipçilere Yayınla
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', maxHeight: '68vh', overflowY: 'auto' }}>
          {feedback && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '0.9rem',
              fontWeight: 500,
              background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
              border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`
            }}>
              {feedback.text}
            </div>
          )}

          {/* Rota İsmi Belirleme */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              🏷️ Rota İsmi
            </label>
            <input
              type="text"
              className="route-name-input"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="Örn: Hafta Sonu Antalya & Kaş Kaçamağı"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {activeTab === 'friend' ? (
            /* TAB 1: Arkadaşa Onaya / Tavsiyeye Gönder */
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  👥 Arkadaşını Seç
                </label>

                {loadingFriends ? (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Takip edilen arkadaşlar yükleniyor...</div>
                ) : friends.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {friends.map(friend => (
                      <div
                        key={friend.id}
                        onClick={() => setSelectedFriendId(friend.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: selectedFriendId === friend.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: selectedFriendId === friend.id ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}>
                            {friend.displayName ? friend.displayName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>
                              {friend.displayName || friend.username}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              @{friend.username} {friend.businessName ? `• ${friend.businessName}` : ''}
                            </div>
                          </div>
                        </div>
                        {selectedFriendId === friend.id && (
                          <span style={{ color: '#2563eb', fontWeight: 700 }}>✓ Seçildi</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
                      Henüz takip ettiğiniz arkadaşınız yok. Aşağıdan kullanıcı arayabilirsiniz:
                    </p>
                  </div>
                )}

                {/* Kullanıcı Arama */}
                <div style={{ marginTop: '12px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Kullanıcı adı veya isim ile ara..."
                    value={searchQuery}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchResults.length > 0 && (
                    <div style={{ marginTop: '6px', maxHeight: '120px', overflowY: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setSelectedFriendId(user.id);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #f1f5f9'
                          }}
                        >
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.displayName || user.username} (@{user.username})</span>
                          <span style={{ fontSize: '0.75rem', color: '#2563eb' }}>Seç</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Not Ekleme */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  💬 Arkadaşına Notun (İsteğe bağlı)
                </label>
                <textarea
                  rows="3"
                  value={senderNote}
                  onChange={(e) => setSenderNote(e.target.value)}
                  placeholder="Örn: Bu rotayı hazırladım, sence hangi durakları eklemeliyiz? Tavsiye ettiğin mekanları ekleyip bana geri gönderebilir misin?"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Bilgilendirme Notu */}
              <div style={{ padding: '10px 14px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.4 }}>
                  💡 <strong>Nasıl Çalışır?</strong> Arkadaşınız bu rotayı açtığında güzergahı inceleyebilir, kendi favori mekanlarını <strong>"Tavsiye Olarak Ekle"</strong> diyerek size geri gönderebilir. Siz de tavsiyeleri tek tıkla rotanıza dahil edebilirsiniz!
                </p>
              </div>

              <button
                onClick={handleSendToFriend}
                disabled={submitting || !selectedFriendId}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: submitting || !selectedFriendId ? '#94a3b8' : '#2563eb',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: submitting || !selectedFriendId ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}
              >
                {submitting ? 'Gönderiliyor...' : '🚀 Arkadaşıma Onaya & Tavsiyeye Gönder'}
              </button>
            </div>
          ) : (
            /* TAB 2: Takipçilere Rota Yayınla (Firmalar ve Kullanıcılar İçin) */
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    📢 Takipçiler ({followers.length})
                  </label>
                  <label style={{ fontSize: '0.8rem', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="checkbox"
                      checked={selectAllFollowers}
                      onChange={(e) => setSelectAllFollowers(e.target.checked)}
                    />
                    Tüm Takipçilere Gönder
                  </label>
                </div>

                {!selectAllFollowers && followers.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                    {followers.map(f => (
                      <label
                        key={f.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFollowerIds.includes(f.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFollowerIds([...selectedFollowerIds, f.id]);
                            } else {
                              setSelectedFollowerIds(selectedFollowerIds.filter(id => id !== f.id));
                            }
                          }}
                        />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{f.displayName || f.username}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Yayın Notu */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  📝 Takipçilere Mesaj / Açıklama
                </label>
                <textarea
                  rows="3"
                  value={senderNote}
                  onChange={(e) => setSenderNote(e.target.value)}
                  placeholder="Örn: Hafta sonu için özel olarak hazırladığımız rota! Şehrin en güzel lezzet ve manzara noktalarını keşfetmek için haritada açın."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Bilgilendirme Notu */}
              <div style={{ padding: '10px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#065f46', lineHeight: 1.4 }}>
                  ✨ <strong>Firma / Rehber Yayını:</strong> Takipçileriniz bu rotayı kendi hesaplarında doğrudan gezi rehberi olarak açabilir ve harita üzerinde adım adım takip edebilirler.
                </p>
              </div>

              <button
                onClick={handleBroadcastToFollowers}
                disabled={submitting || (followers.length === 0 && !selectAllFollowers)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  background: submitting ? '#94a3b8' : '#059669',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                }}
              >
                {submitting ? 'Yayınlanıyor...' : '📢 Takipçilerime Rotayı Yayınla'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareRouteModal;
