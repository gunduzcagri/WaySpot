import { useState } from 'react';
import { api } from '../services/api';

export default function TestDataPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const seed = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await api.post('/testdata/seed-businesses');
      setStatus(res.data.message);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Hata olustu.');
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await api.delete('/testdata/clear-businesses');
      setStatus(res.data.message);
    } catch (err) {
      setStatus(err.response?.data?.message || 'Hata olustu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Test Verileri</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Haritada rota ve akışi test etmek icin 20 test isletmesi yukleyebilirsiniz.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={seed} disabled={loading} style={{ ...btnStyle, background: 'var(--primary)' }}>Yukle</button>
        <button onClick={clear} disabled={loading} style={{ ...btnStyle, background: '#ef4444' }}>Temizle</button>
      </div>
      {status && <p style={{ marginTop: 16, color: 'var(--text-secondary)', fontSize: 14 }}>{status}</p>}
    </div>
  );
}

const btnStyle = { flex: 1, padding: '0 18px', height: 48, borderRadius: 14, color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
