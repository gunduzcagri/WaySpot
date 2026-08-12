import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

const postIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function DiscoverMarkers({ center }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!center) return;

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/discover?latitude=${center.lat}&longitude=${center.lng}`);
        setPosts(res.data.posts || []);
      } catch (err) {
        console.error('Discover hatasi:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [center]);

  return (
    <>
      {posts.map(post => (
        <Marker
          key={post.id}
          position={[post.business.latitude, post.business.longitude]}
          icon={postIcon}
        >
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <h4 style={{ margin: '0 0 8px 0' }}>{post.business.name}</h4>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>{post.content}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="" style={{ width: '100%', borderRadius: '4px' }} />}
              <small>Yaricap: {post.targetRadiusKm} km</small>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
