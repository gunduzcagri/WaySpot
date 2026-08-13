import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', password: '', role: 'User' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-medium)' }}>
        <h1 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>WaySpot Kayıt</h1>
        {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input value={form.username} onChange={update('username')} placeholder="Kullanıcı adı" required style={inputStyle} />
          <input value={form.email} onChange={update('email')} placeholder="E-posta" type="email" required style={inputStyle} />
          <input value={form.firstName} onChange={update('firstName')} placeholder="Ad" required style={inputStyle} />
          <input value={form.lastName} onChange={update('lastName')} placeholder="Soyad" required style={inputStyle} />
          <input value={form.password} onChange={update('password')} placeholder="Şifre" type="password" required style={inputStyle} />
          <select value={form.role} onChange={update('role')} style={inputStyle}>
            <option value="User">Kullanıcı</option>
            <option value="Business">İşletme</option>
          </select>
          <button type="submit" style={buttonStyle}>Kayıt Ol</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Zaten hesabın var mı? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0 16px', height: '52px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '16px', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '0 24px', height: '52px', borderRadius: '14px', background: 'var(--primary)', color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '16px', boxShadow: 'var(--shadow-soft)' };
