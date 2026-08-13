import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [message, setMessage] = useState('');

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.put('/profile', form);
      setMessage('Kaydedildi.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Hata olustu.');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: 16 }}>Ayarlar</h2>
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={form.username} onChange={update('username')} placeholder="Kullanici adi" style={inputStyle} />
        <input value={form.email} onChange={update('email')} placeholder="E-posta" style={inputStyle} />
        <button type="submit" style={buttonStyle}>Kaydet</button>
      </form>
      {message && <p style={{ marginTop: 12, color: message.includes('Hata') ? '#ef4444' : '#22c55e' }}>{message}</p>}
      <button onClick={() => { logout(); navigate('/login'); }} style={{ marginTop: 20, ...buttonStyle, background: '#ef4444' }}>Cikis Yap</button>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0 16px', height: 48, borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '0 18px', height: 48, borderRadius: 14, background: 'var(--primary)', color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
