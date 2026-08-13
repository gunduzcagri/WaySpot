import { useEffect, useState } from 'react';
import { api } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

export default function FeedPage({ center }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}/discover?latitude=${center?.lat || 39.9334}&longitude=${center?.lng || 32.8597}`);
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error('Feed hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeed(); }, [center]);

  return (
    <div style={{ position: 'absolute', top: 0, right: 0, height: '100vh', maxHeight: '100vh', width: '360px', zIndex: 1000, overflowY: 'auto', background: 'var(--bg-card)', padding: '20px', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-medium)' }}>
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 600 }}>Keşfet Akışı</h3>
      {loading && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Yükleniyor...</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {(posts.length > 0 ? posts : [
          {
            id: 'mock1',
            business: { name: 'Kaleiçi Tarihi Kahvecisi' },
            content: 'Tarihi doku eşliğinde enfes bir Türk kahvesi deneyimi.',
            createdAt: new Date().toISOString(),
            targetRadiusKm: 5
          },
          {
            id: 'mock2',
            business: { name: 'Konyaaltı Balıkçısı' },
            content: 'Günlük taze deniz ürünleri ile akşam yemeğine bekliyoruz!',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            targetRadiusKm: 10
          },
          {
            id: 'mock3',
            business: { name: 'Düden Şelalesi Çay Bahçesi' },
            content: 'Şelale manzaralı serin bir mola için en iyi adres.',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            targetRadiusKm: 15
          }
        ]).map((post) => (
          <div key={post.id} style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{post.business?.name}</div>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{post.content}</p>
            {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: '100%', borderRadius: '12px', marginBottom: '8px' }} />}
            <small style={{ color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleString('tr-TR')} · {post.targetRadiusKm} km</small>
          </div>
        ))}
      </div>
    </div>
  );
}
