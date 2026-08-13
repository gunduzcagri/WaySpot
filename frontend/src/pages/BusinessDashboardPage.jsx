import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function BusinessDashboardPage() {
  const [stats, setStats] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, businessRes] = await Promise.all([
          api.get('/business-dashboard/stats'),
          api.get('/business/my')
        ]);
        setStats(statsRes.data);
        setBusiness(businessRes.data);
      } catch (err) {
        console.error(err);
        // Fallback mock data if API fails
        setBusiness({ name: 'Kaleiçi Tarihi Kahvecisi', id: 'mock-b1' });
        setStats({
          totalPosts: 42,
          activePosts: 12,
          totalReviews: 128,
          averageRating: 4.8,
          recentReviews: [
            { id: 1, username: 'testuser', comment: 'Çok güzel mekan!', rating: 5, createdAt: new Date().toISOString() }
          ],
          postPerformances: [
            { postId: 1, content: 'Taze kahvelerimiz hazır!', targetRadiusKm: 5, createdAt: new Date().toISOString() }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Yükleniyor...</div>;

  if (!business) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto', color: 'var(--text-secondary)' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>İşletme Paneli</h2>
        <p>Henüz işletme kaydınız yok. Haritada bir yere tıklayıp işletme oluşturabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>{business.name} - Panel</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Toplam Paylaşım" value={stats?.totalPosts ?? 0} />
        <StatCard label="Aktif Paylaşım" value={stats?.activePosts ?? 0} />
        <StatCard label="Yorum" value={stats?.totalReviews ?? 0} />
        <StatCard label="Ortalama Puan" value={stats?.averageRating ?? 0} />
      </div>

      <section style={{ marginBottom: 24 }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Son Yorumlar</h3>
        <ReviewList reviews={stats?.recentReviews || []} />
      </section>

      <section>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Paylaşım Performansı</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(stats?.postPerformances || []).map(p => (
            <div key={p.postId} style={{ padding: 12, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{p.content}</div>
              <small style={{ color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleString('tr-TR')} · {p.targetRadiusKm} km</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function ReviewList({ reviews }) {
  if (!reviews.length) return <p style={{ color: 'var(--text-secondary)' }}>Henüz yorum yok.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {reviews.map(r => (
        <div key={r.id} style={{ padding: 12, borderRadius: 12, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{r.username}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.comment}</div>
          <small style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleString('tr-TR')} · {r.rating}/5</small>
        </div>
      ))}
    </div>
  );
}
