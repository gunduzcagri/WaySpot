import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5075/api';

const ShareButton = ({ 
  contentType, 
  contentId, 
  shareUrl, 
  title, 
  description 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  const shareOptions = [
    {
      id: 'copy',
      label: copied ? 'Kopyalandı!' : 'Bağlantıyı Kopyala',
      icon: '🔗',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          await logShare('copy');
        } catch (err) {
          console.error('Kopyalama hatası:', err);
        }
      }
    },
    {
      id: 'email',
      label: 'Email',
      icon: '📧',
      action: async () => {
        window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        await logShare('email');
      }
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: '💼',
      action: async () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
        await logShare('linkedin');
      }
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: '📘',
      action: async () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        await logShare('facebook');
      }
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: '📷',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Instagram için bağlantı kopyalandı! Instagram uygulamasını açarak hikayenizde veya mesajlarınızda paylaşabilirsiniz.');
          await logShare('instagram');
        } catch (err) {
          console.error('Instagram kopyalama hatası:', err);
        }
      }
    }
  ];

  const logShare = async (platform) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return; // Ziyaretçiler için analytics tutmuyoruz (isteğe bağlı)

      await axios.post(`${API_URL}/shares`, {
        contentType,
        contentId,
        platform
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Paylaşım kaydedilirken hata oluştu:', err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        aria-label="Paylaş"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          height: '56px', // UI/UX prompt
          padding: '0 24px',
          borderRadius: '16px', // UI/UX prompt
          background: 'var(--primary, #007AFF)',
          color: 'var(--text-inverse, #FFFFFF)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '16px',
          boxShadow: 'var(--shadow-soft, 0 4px 12px rgba(0,0,0,0.1))',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <span>📤</span>
        <span>Paylaş</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            right: 0,
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border, #E5E5EA)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-medium, 0 8px 24px rgba(0,0,0,0.12))',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            minWidth: '200px',
            zIndex: 1000
          }}
        >
          {shareOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={opt.action}
              aria-label={`${opt.label} ile paylaş`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '15px',
                color: 'var(--text-primary, #1C1C1E)',
                fontWeight: 500,
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'var(--bg-hover, #F2F2F7)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '18px' }}>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShareButton;
