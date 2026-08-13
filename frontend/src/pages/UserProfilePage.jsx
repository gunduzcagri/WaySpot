import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          api.get('/profile'),
          api.get('/profile/my-reviews')
        ]);
        setProfile(profileRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
        // Fallback to mock context user if API fails
        setProfile(user);
        setReviews([
          { id: 1, businessName: 'Kaleiçi Tarihi Kahvecisi', comment: 'Harika bir yer!', rating: 5, createdAt: new Date().toISOString() }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Yükleniyor...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Profil</h2>
      <div style={{ padding: 20, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{profile?.username}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profile?.email}</div>
        {profile?.firstName && <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profile.firstName} {profile.lastName}</div>}
        {profile?.bio && <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14 }}>{profile.bio}</p>}
        <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>
          {profile?.totalReviews} yorum · {profile?.totalSavedRoutes} kayitli rota
        </div>
      </div>

      <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Yorumlarım</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reviews.map(r => (
          <div key={r.id} style={{ padding: 14, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{r.businessName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.comment}</div>
            <small style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleString('tr-TR')} · {r.rating}/5</small>
          </div>
        ))}
        {!reviews.length && <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Henüz yorum yok.</p>}
      </div>
    </div>
  );
}
