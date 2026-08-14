import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RouteSuggestionReviewModal = ({
  isOpen,
  onClose,
  collaboration,
  onSuccess
}) => {
  const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [reviewerNote, setReviewerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isOpen && collaboration) {
      setReviewerNote(collaboration.reviewerNote || '');
      setSelectedSuggestions([]);
      setFeedback(null);
      fetchNearbyBusinesses();
    }
  }, [isOpen, collaboration]);

  const fetchNearbyBusinesses = async () => {
    if (!collaboration?.route) return;
    setLoadingBusinesses(true);
    try {
      const city = collaboration.route.startLocation?.split(',')[0]?.trim() || '';
      const res = await api.get('/businesses', {
        params: { city: city || undefined, pageSize: 30 }
      });
      const businesses = res.data?.items || res.data || [];
      setNearbyBusinesses(businesses);
    } catch (err) {
      console.error('Error fetching businesses for review:', err);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleToggleSuggestion = (business) => {
    const exists = selectedSuggestions.find(s => s.businessId === business.id);
    if (exists) {
      setSelectedSuggestions(selectedSuggestions.filter(s => s.businessId !== business.id));
    } else {
      setSelectedSuggestions([
        ...selectedSuggestions,
        {
          businessId: business.id,
          stopName: business.name,
          latitude: business.location?.latitude || business.latitude || 0,
          longitude: business.location?.longitude || business.longitude || 0,
          kmAlongRoute: 0,
          note: '',
          coverImage: business.coverImage,
          businessType: business.type || 'Mekan',
          averageRating: business.averageRating || 5.0
        }
      ]);
    }
  };

  const handleUpdateNote = (businessId, note) => {
    setSelectedSuggestions(selectedSuggestions.map(s => 
      s.businessId === businessId ? { ...s, note } : s
    ));
  };

  const handleSubmitReview = async () => {
    if (!collaboration?.id) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        reviewerNote: reviewerNote.trim(),
        suggestions: selectedSuggestions.map(s => ({
          businessId: s.businessId,
          stopName: s.stopName,
          latitude: s.latitude,
          longitude: s.longitude,
          kmAlongRoute: s.kmAlongRoute,
          note: s.note.trim()
        }))
      };

      const res = await api.post(`/routecollaboration/${collaboration.id}/submit-review`, payload);
      setFeedback({ type: 'success', text: res.data.message || 'Tavsiyeleriniz rota sahibine iletildi!' });
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
      }, 1300);
    } catch (err) {
      console.error('Error submitting review:', err);
      setFeedback({ type: 'error', text: err.response?.data?.message || 'İnceleme gönderilirken bir hata oluştu.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !collaboration) return null;

  const { route, sender, senderNote } = collaboration;

  return (
    <div className="modal-overlay">
      <div className="modal-content itinerary-modal-container" style={{ maxWidth: '680px', width: '94%' }}>
        {/* Header */}
        <div className="itinerary-header" style={{ background: 'linear-gradient(135deg, #1e3a8a, #0f172a)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '1.4rem' }}>💡</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>
                Rota İnceleme & Mekan Tavsiyesi
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#93c5fd' }}>
              <strong>{sender?.displayName || sender?.username}</strong> bu rotayı onayınıza ve tavsiyelerinize sundu.
            </p>
          </div>
          <button className="btn-close-itinerary" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto' }}>
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

          {/* Rota Özeti */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b', fontWeight: 700 }}>
                {route?.name || 'Gezi Rotası'}
              </h4>
              <span style={{ fontSize: '0.8rem', background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                {route?.totalDistanceKm?.toFixed(1) || 0} km • ~{route?.estimatedDurationMinutes || 0} dk
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📍 {route?.startLocation}</span>
              <span>➔</span>
              <span>🏁 {route?.endLocation}</span>
            </div>

            {senderNote && (
              <div style={{ marginTop: '10px', padding: '8px 12px', background: '#eff6ff', borderRadius: '6px', borderLeft: '3px solid #3b82f6', fontSize: '0.85rem', color: '#1e40af' }}>
                💬 <strong>Arkadaşının Notu:</strong> "{senderNote}"
              </div>
            )}
          </div>

          {/* Mevcut Duraklar */}
          {route?.stops && route.stops.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                📍 Rotadaki Mevcut Duraklar ({route.stops.length})
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {route.stops.map((st, idx) => (
                  <div
                    key={st.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#1e293b'
                    }}
                  >
                    <span style={{ background: '#2563eb', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                      {idx + 1}
                    </span>
                    {st.stopName || st.businessName}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tavsiye Eklenebilecek Mekanlar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✨</span> Bu Rotaya Mekan Tavsiye Et
              </label>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {selectedSuggestions.length} mekan tavsiye edildi
              </span>
            </div>

            {loadingBusinesses ? (
              <div style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', padding: '16px' }}>Mekanlar taranıyor...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px', maxHeight: '220px', overflowY: 'auto', padding: '4px' }}>
                {nearbyBusinesses.map(biz => {
                  const isSelected = selectedSuggestions.some(s => s.businessId === biz.id);
                  return (
                    <div
                      key={biz.id}
                      onClick={() => handleToggleSuggestion(biz)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        borderRadius: '8px',
                        border: isSelected ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                        background: isSelected ? '#fffbeb' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {biz.coverImage ? (
                          <img
                            src={biz.coverImage}
                            alt=""
                            style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            🏢
                          </div>
                        )}
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {biz.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {biz.type || 'Mekan'} • ⭐ {biz.averageRating?.toFixed(1) || '5.0'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isSelected ? '#f59e0b' : '#f1f5f9',
                          color: isSelected ? '#fff' : '#475569',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          marginLeft: '8px'
                        }}
                      >
                        {isSelected ? '✓ Eklendi' : '+ Tavsiye Et'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seçilen Tavsiyelere Not Ekleme */}
          {selectedSuggestions.length > 0 && (
            <div style={{ marginBottom: '20px', background: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fef3c7' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>
                💡 Tavsiye Notlarınız (Arkadaşınıza Görünecektir)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedSuggestions.map(s => (
                  <div key={s.businessId} style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b', marginBottom: '4px' }}>
                      {s.stopName}
                    </div>
                    <input
                      type="text"
                      placeholder="Örn: Buranın taze kahvaltısı enfes, güzergaha eklemelisin!"
                      value={s.note}
                      onChange={(e) => handleUpdateNote(s.businessId, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genel İnceleme Notu */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              ✍️ Genel Geri Bildirim Notunuz
            </label>
            <textarea
              rows="3"
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              placeholder="Örn: Harika bir rota hazırlamışsın! Ben de güzergahtaki favori iki mekanı tavsiye olarak ekledim, inceleyebilirsin."
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: selectedSuggestions.length > 0 ? '#f59e0b' : '#2563eb',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {submitting
                ? 'İletiliyor...'
                : selectedSuggestions.length > 0
                  ? `🚀 ${selectedSuggestions.length} Mekan Tavsiyesiyle Geri Gönder`
                  : '✓ Rotayı Onayla & Geri Gönder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSuggestionReviewModal;
