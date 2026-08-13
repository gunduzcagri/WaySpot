import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Giris basarisiz');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-medium)' }}>
        <h1 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center' }}>WaySpot Giriş</h1>
        {error && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-posta" type="email" required style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" type="password" required style={inputStyle} />
          <button type="submit" style={buttonStyle}>Giriş Yap</button>
        </form>
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Hesabın yok mu? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Kayıt Ol</Link>
        </p>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '0 16px', height: '52px', borderRadius: '14px', border: '1.5px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '16px', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '0 24px', height: '52px', borderRadius: '14px', background: 'var(--primary)', color: 'var(--text-inverse, #FFFFFF)', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '16px', boxShadow: 'var(--shadow-soft)' };
