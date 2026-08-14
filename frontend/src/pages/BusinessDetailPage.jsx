import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Heart, Bookmark, MapPin, Phone, Mail, Globe, 
  MessageCircle, Clock, Share2, Navigation, Send, Image as ImageIcon 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [business, setBusiness] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction states
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    fetchBusinessDetails();
    fetchReviews();
  }, [id]);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/Business/${id}`);
      setBusiness(res.data);
      setLikes(res.data.totalLikes || 0);
    } catch (err) {
      console.error('İşletme yüklenemedi:', err);
      setError('İşletme detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/businesses/${id}/Reviews`);
      setReviews(res.data || []);
    } catch (err) {
      console.error('Yorumlar yüklenemedi:', err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await api.post(`/Business/${id}/like`);
      if (res.data?.totalLikes !== undefined) {
        setLikes(res.data.totalLikes);
      } else {
        setLikes(prev => prev + 1);
      }
      setLiked(true);
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (!saved) {
        await api.post(`/Business/${id}/save`);
        setSaved(true);
      } else {
        await api.delete(`/Business/${id}/save`);
        setSaved(false);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    setReviewMsg(null);
    try {
      await api.post(`/businesses/${id}/reviews`, {
        businessId: id,
        rating: Number(rating),
        comment: comment.trim(),
        photoUrl: photoUrl.trim() || null
      });
      setComment('');
      setPhotoUrl('');
      setReviewMsg({ type: 'success', text: 'Yorumunuz başarıyla gönderildi!' });
      fetchReviews();
      fetchBusinessDetails();
    } catch (err) {
      console.error('Review submission error:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.title || (typeof err.response?.data === 'string' ? err.response?.data : null);
      setReviewMsg({ 
        type: 'error', 
        text: serverMsg || 'Yorum gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' 
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>İşletme yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div style={{ minHeight: '100vh', padding: '40px 20px', textAlign: 'center', background: 'var(--bg-page)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>{error || 'İşletme bulunamadı'}</h2>
        <button 
          onClick={() => navigate('/')}
          style={{ marginTop: 20, padding: '10px 20px', borderRadius: 12, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          ← Haritaya Dön
        </button>
      </div>
    );
  }

  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--text-primary)', paddingBottom: 60 }}>
      {/* Top Navbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-soft)' }}>
        <button 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 999, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          <ArrowLeft size={18} />
          Haritaya Dön
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleLike}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, border: '1px solid var(--border)', background: liked ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)', color: liked ? '#ef4444' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            <span>{likes}</span>
          </button>
          <button 
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 999, border: '1px solid var(--border)', background: saved ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)', color: saved ? '#f59e0b' : 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Kaydedildi' : 'Kaydet'}</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '24px auto', padding: '0 20px' }}>
        {/* Hero Banner */}
        <div style={{ position: 'relative', height: 320, borderRadius: 24, overflow: 'hidden', boxShadow: 'var(--shadow-medium)', background: 'var(--surface-dark)' }}>
          {business.coverImage ? (
            <img src={business.coverImage} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Görsel Bulunmuyor
            </div>
          )}
          {business.isFeatured && (
            <div style={{ position: 'absolute', top: 20, left: 20, background: '#f59e0b', color: '#78350f', fontWeight: 700, fontSize: 12, padding: '6px 14px', borderRadius: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              ⭐ Öne Çıkan İşletme
            </div>
          )}
        </div>

        {/* Header Info */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 28, marginTop: -40, position: 'relative', zIndex: 10, boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{business.name}</h1>
                <span style={{ padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {business.type}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 14 }}>
                <MapPin size={16} />
                <span>{business.address || `${business.cityId || ''} ${business.districtId || ''}`}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-input)', padding: '10px 18px', borderRadius: 16 }}>
              <Star size={24} fill="#f59e0b" color="#f59e0b" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                  {business.averageRating ? Number(business.averageRating).toFixed(1) : '5.0'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {business.totalReviews || reviews.length} değerlendirme
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {business.tags && business.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {business.tags.map((tag, i) => (
                <span key={i} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            {business.phone && (
              <a 
                href={`tel:${business.phone}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'var(--bg-input)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)' }}
              >
                <Phone size={16} color="var(--primary)" />
                {business.phone}
              </a>
            )}
            {business.email && (
              <a 
                href={`mailto:${business.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'var(--bg-input)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)' }}
              >
                <Mail size={16} color="var(--primary)" />
                E-posta Gönder
              </a>
            )}
            {business.website && (
              <a 
                href={business.website} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'var(--bg-input)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)' }}
              >
                <Globe size={16} color="var(--primary)" />
                Web Sitesi
              </a>
            )}
            {business.instagram && (
              <a 
                href={`https://instagram.com/${business.instagram.replace('@','')}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'var(--bg-input)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 14, fontWeight: 600, border: '1px solid var(--border)' }}
              >
                <Share2 size={16} color="#E1306C" />
                Instagram
              </a>
            )}
            <button 
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent('wayspot-focus-map', {
                    detail: { lat: business.latitude, lng: business.longitude }
                  }));
                }, 300);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, background: 'var(--primary)', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-soft)' }}
            >
              <Navigation size={16} />
              Haritada Odaklan
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
          {/* Description */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: 18, fontWeight: 700 }}>Hakkında</h3>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: 14 }}>
              {business.description || 'Bu işletme için henüz detaylı bir açıklama girilmemiş.'}
            </p>
          </div>

          {/* Working Hours */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--primary)" />
              Çalışma Saatleri
            </h3>
            {business.businessHours && business.businessHours.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {business.businessHours.map((h) => (
                  <div key={h.id || h.dayOfWeek} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px dashed var(--border)' }}>
                    <span style={{ fontWeight: 600 }}>{daysOfWeek[(h.dayOfWeek - 1 + 7) % 7]}</span>
                    <span style={{ color: h.isOpen ? 'var(--primary)' : 'var(--danger)' }}>
                      {h.isOpen ? `${h.openTime?.substring(0,5)} - ${h.closeTime?.substring(0,5)}` : 'Kapalı'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Hergün: 08:00 - 23:00 (Standart)</p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 24, padding: 28, marginTop: 24, border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageCircle size={22} color="var(--primary)" />
            Değerlendirmeler ve Yorumlar ({reviews.length})
          </h3>

          {/* Write a Review Form */}
          <form onSubmit={handleSubmitReview} style={{ background: 'var(--bg-input)', padding: 20, borderRadius: 16, marginBottom: 28 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 700 }}>Deneyimini Paylaş</h4>
            
            {reviewMsg && (
              <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600, background: reviewMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)', color: reviewMsg.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                {reviewMsg.text}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Puanınız:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                  >
                    <Star size={22} fill={star <= rating ? '#f59e0b' : 'none'} color={star <= rating ? '#f59e0b' : 'var(--text-muted)'} />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginLeft: 6 }}>{rating} / 5</span>
            </div>

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Mekan hakkındaki görüşlerinizi yazın..."
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit', resize: 'vertical' }}
              required
            />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Fotoğraf URL'si (Opsiyonel / Unsplash vb.)"
                style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }}
              />
              <button
                type="submit"
                disabled={submittingReview}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 10, background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                <Send size={16} />
                {submittingReview ? 'Gönderiliyor...' : 'Yorum Yap'}
              </button>
            </div>
          </form>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ padding: 16, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                        {rev.username ? rev.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{rev.username || 'Anonim Kullanıcı'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-input)', padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>

                  <p style={{ margin: '8px 0', fontSize: 14, lineHeight: 1.5, color: 'var(--text-primary)' }}>{rev.comment}</p>

                  {rev.photoUrl && (
                    <img 
                      src={rev.photoUrl} 
                      alt="Review attachment" 
                      style={{ maxWidth: 200, maxHeight: 140, objectFit: 'cover', borderRadius: 10, marginTop: 8 }} 
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              Henüz bu işletmeye bir değerlendirme yapılmamış. İlk yorumu siz yapın!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
