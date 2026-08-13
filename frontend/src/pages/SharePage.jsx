import { useState } from 'react';
import { api } from '../services/api';

export default function SharePage() {
  const [form, setForm] = useState({ content: '', targetRadiusKm: 5, imageUrl: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/posts', form);
      setMessage('Paylasim yayinlandi.');
      setForm({ content: '', targetRadiusKm: 5, imageUrl: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Hata olustu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Paylaşım Oluştur</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Ne dusuyorsun?" required rows={4} style={{ ...inputStyle, height: 120, padding: 12 }} />
        <input value={form.targetRadiusKm} onChange={(e) => setForm({ ...form, targetRadiusKm: Number(e.target.value) })} type="number" min={1} max={100} style={inputStyle} />
        <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Gorsel URL (opsiyonel)" style={inputStyle} />
        <button type="submit" disabled={submitting} style={buttonStyle}>{submitting ? 'Gonderiliyor...' : 'Paylaş'}</button>
      </form>
      {message && <p style={{ marginTop: 12, color: message.includes('Hata') ? '#ef4444' : '#22c55e' }}>{message}</p>}
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0 16px', height: 48, borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '0 18px', height: 48, borderRadius: 14, background: 'var(--primary)', color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
