import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const FeedCard = ({ business }) => {
  const [likes, setLikes] = useState(business.totalLikes || 0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    try {
      const res = await api.post(`/Business/${business.id}/like`);
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
        await api.post(`/Business/${business.id}/save`);
        setSaved(true);
      } else {
        await api.delete(`/Business/${business.id}/save`);
        setSaved(false);
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  return (
    <div className="feed-card">
      <div className="feed-card-image-wrap">
        {business.coverImage ? (
          <img 
            src={business.coverImage} 
            alt={business.name} 
            className="feed-card-image"
          />
        ) : (
          <div className="feed-card-placeholder">
            <span>Görsel Yok</span>
          </div>
        )}
        {business.isFeatured && (
          <div className="feed-card-badge">
            Öne Çıkan
          </div>
        )}
      </div>

      <div className="feed-card-body">
        <div className="feed-card-header">
          <div>
            <Link to={`/business/${business.id}`} className="feed-card-title">
              {business.name}
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              <MapPin size={14} style={{ marginRight: 4 }} />
              <span>{business.address ? (business.address.length > 35 ? business.address.substring(0, 35) + '...' : business.address) : 'Adres bilgisi yok'}</span>
            </div>
          </div>
          <div className="feed-card-rating">
            <span style={{ color: '#f59e0b' }}>★</span>
            <span>{business.averageRating ? Number(business.averageRating).toFixed(1) : '5.0'}</span>
          </div>
        </div>

        <div className="feed-card-tags">
          <span className="feed-tag">
            {business.type || 'Mekan'}
          </span>
          {business.tags && business.tags.map((tag, i) => (
            <span key={i} className="feed-tag feed-tag-gray">
              {tag}
            </span>
          ))}
        </div>

        <div className="feed-card-actions">
          <div className="feed-action-group">
            <button 
              className={`feed-action-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              title="Beğen"
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              <span>{likes}</span>
            </button>
            <button className="feed-action-btn" title="Yorumlar">
              <MessageCircle size={16} />
              <span>{business.totalReviews || 0}</span>
            </button>
            <button 
              className={`feed-action-btn ${saved ? 'saved' : ''}`}
              onClick={handleSave}
              title="Kaydet"
            >
              <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button 
              className="feed-action-btn" 
              title="Haritada Göster"
              onClick={() => {
                if (business.latitude && business.longitude) {
                  window.dispatchEvent(new CustomEvent('wayspot-focus-map', {
                    detail: { lat: business.latitude, lng: business.longitude }
                  }));
                }
              }}
            >
              <Navigation size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
