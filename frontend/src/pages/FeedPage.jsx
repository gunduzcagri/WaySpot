import React, { useState, useEffect } from 'react';
import { useFeed } from '../hooks/useFeed';
import FeedList from '../components/Feed/FeedList';
import { MapPin, Navigation, X, Compass, Sparkles } from 'lucide-react';

export default function FeedPage({ center, mobileTab = 'map', setMobileTab }) {
  const [filter, setFilter] = useState('popular');
  const [userLocation, setUserLocation] = useState(null);

  // Get user's actual device location on mount and store it
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('Cihaz konumu alınamadı:', err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const activeLat = filter === 'nearby' 
    ? (userLocation?.lat ?? center?.lat) 
    : center?.lat;

  const activeLng = filter === 'nearby' 
    ? (userLocation?.lng ?? center?.lng) 
    : center?.lng;

  const latRounded = activeLat ? Math.round(activeLat * 100) / 100 : undefined;
  const lngRounded = activeLng ? Math.round(activeLng * 100) / 100 : undefined;

  const filterParams = {
    filter,
    latitude: latRounded,
    longitude: lngRounded,
    pageSize: 10
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(filterParams);

  const isMobile = window.innerWidth <= 768;
  const isVisibleOnMobile = mobileTab === 'feed';

  if (isMobile && !isVisibleOnMobile) {
    return null; // Don't render feed overlay on mobile when on map or route tab!
  }

  return (
    <div className={`feed-sidebar ${isMobile ? 'feed-mobile-sheet' : ''}`}>
      <div className="feed-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Compass size={20} color="var(--primary)" />
            <h3 className="feed-title" style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
              Keşfet
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {filter === 'nearby' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#16a34a', background: 'rgba(22, 163, 74, 0.12)', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
                <Navigation size={12} />
                <span>Yakınımda</span>
              </div>
            ) : (
              center && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
                  <MapPin size={12} />
                  <span>Harita Odaklı</span>
                </div>
              )
            )}

            {isMobile && (
              <button
                onClick={() => setMobileTab && setMobileTab('map')}
                className="mobile-close-sheet-btn"
                title="Haritaya Dön"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="filter-tabs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button 
            onClick={() => setFilter('popular')}
            className={`filter-btn ${filter === 'popular' ? 'active' : ''}`}
            style={{ textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🔥 Popüler
          </button>
          <button 
            onClick={() => {
              setFilter('nearby');
              if (!userLocation && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                });
              }
            }}
            className={`filter-btn ${filter === 'nearby' ? 'active' : ''}`}
            style={{ textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            📍 Yakınımda
          </button>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <FeedList 
          data={data} 
          fetchNextPage={fetchNextPage} 
          hasNextPage={hasNextPage} 
          isFetchingNextPage={isFetchingNextPage} 
        />
      </div>
    </div>
  );
}
